// Due to large generated future for async fns
#![type_length_limit="10000000"]

#[macro_use] extern crate lazy_static;
#[macro_use] extern crate serde_json;
#[macro_use] extern crate maplit;

use neon::prelude::*;
use pact_matching::models::*;
use pact_matching::models::provider_states::ProviderState;
use pact_matching::models::matchingrules::{MatchingRules, MatchingRule, Category, RuleLogic};
use pact_matching::models::generators::{Generators, GeneratorCategory, Generator};
use pact_matching::time_utils::generate_string;
use pact_mock_server::server_manager::ServerManager;
use pact_mock_server_ffi::bodies::{process_json, request_multipart, response_multipart, file_as_multipart_body};
use env_logger::{Builder, Target};
use uuid::Uuid;
use std::sync::Mutex;
use serde_json::Value;
use log::*;
use std::collections::HashMap;
use std::fs;

mod verify;
mod xml;
mod utils;

lazy_static! {
  static ref MANAGER: Mutex<ServerManager> = Mutex::new(ServerManager::new());
}

fn init(mut cx: FunctionContext) -> JsResult<JsString> {
    let mut builder = Builder::from_env("LOG_LEVEL");
    builder.target(Target::Stdout);
    builder.init();

    debug!("Initialising Pact native library version {}", env!("CARGO_PKG_VERSION"));

    Ok(cx.string(env!("CARGO_PKG_VERSION")))
}

fn process_xml(body: String, matching_rules: &mut Category, generators: &mut Generators) -> Result<Vec<u8>, String> {
  match serde_json::from_str(&body) {
    Ok(json) => match json {
      Value::Object(ref map) => xml::generate_xml_body(map, matching_rules, generators),
      _ => Err(format!("JSON document is invalid (expected an Object), have {}", json))
    },
    Err(err) => Err(format!("Failed to parse XML builder document: {}", err))
  }
}

fn process_body(body: String, content_type: DetectedContentType, matching_rules: &mut MatchingRules, generators: &mut Generators) -> Result<OptionalBody, String> {
  let category = matching_rules.add_category("body");
  match content_type {
    DetectedContentType::Json => Ok(OptionalBody::from(process_json(body, category, generators))),
    DetectedContentType::Xml => Ok(OptionalBody::Present(process_xml(body, category, generators)?)),
    _ => Ok(OptionalBody::from(body))
  }
}

fn matching_rule_from_js_object<'a>(obj: Handle<JsObject>, ctx: &mut CallContext<JsPact>) -> Option<MatchingRule> {
  let mut matcher_vals = serde_json::map::Map::new();
  let props = obj.get_own_property_names(ctx).unwrap();
  for prop in props.to_vec(ctx).unwrap() {
    let prop_name = prop.downcast::<JsString>().unwrap().value();
    let prop_val = obj.get(ctx, prop_name.as_str()).unwrap();
    if let Ok(val) = prop_val.downcast::<JsString>() {
      matcher_vals.insert(prop_name, json!(val.value()));
    } else if let Ok(val) = prop_val.downcast::<JsNumber>() {
      matcher_vals.insert(prop_name, json!(val.value()));
    }
  }
  MatchingRule::from_integration_json(&matcher_vals)
}

fn generator_from_js_object<'a>(obj: Handle<JsObject>, ctx: &mut CallContext<JsPact>) -> Option<Generator> {
  let mut vals = serde_json::map::Map::new();
  let mut gen_type = None;
  let props = obj.get_own_property_names(ctx).unwrap();
  for prop in props.to_vec(ctx).unwrap() {
    let prop_name = prop.downcast::<JsString>().unwrap().value();
    let prop_val = obj.get(ctx, prop_name.as_str()).unwrap();
    if let Ok(val) = prop_val.downcast::<JsString>() {
      if prop_name == "pact:generator:type" {
        gen_type = Some(val.value())
      }
      vals.insert(prop_name, json!(val.value()));
    } else if let Ok(val) = prop_val.downcast::<JsNumber>() {
      vals.insert(prop_name, json!(val.value()));
    }
  }

  match gen_type {
    Some(val) => Generator::from_map(&val, &vals),
    None => None
  }
}

fn generate_datetime_string(mut cx: FunctionContext) -> JsResult<JsString> {
  let format = cx.argument::<JsString>(0)?;
  let result = generate_string(&format.value());
  match result {
    Ok(value) => Ok(cx.string(value)),
    Err(err) => cx.throw_error(err)
  }
}

fn get_request_path(cx: &mut CallContext<JsPact>, request: Handle<JsObject>) -> Option<(String, Option<MatchingRule>, Option<Generator>)> {
  let js_path = request.get(cx, "path");
  match js_path {
    Ok(path) => match path.downcast::<JsString>() {
      Ok(path) => Some((path.value().to_string(), None, None)),
      Err(err) => {
        match path.downcast::<JsObject>() {
          Ok(path) => {
            let prop_val = path.get(cx, "value").unwrap();
            match prop_val.downcast::<JsString>() {
              Ok(val) => {
                let rule = matching_rule_from_js_object(path, cx);
                let gen = generator_from_js_object(path, cx);
                Some((val.value(), rule, gen))
              },
              Err(err2) => {
                warn!("Request path matcher must contain a string value - {}, {}", err, err2);
                None
              }
            }
          },
          Err(err2) => {
            warn!("Request path is not a string value or a matcher - {}, {}", err, err2);
            None
          }
        }
      }
    },
    _ => None
  }
}

fn get_query(cx: &mut CallContext<JsPact>, request: Handle<JsObject>) -> NeonResult<HashMap<String, Vec<String>>> {
  let js_query = request.get(cx, "query");
  js_query.map(|val| {
    let mut map = hashmap!{};
    if let Ok(query_map) = val.downcast::<JsObject>() {
      let props = query_map.get_own_property_names(cx).unwrap();
      for prop in props.to_vec(cx).unwrap() {
        let prop_name = prop.downcast::<JsString>().unwrap().value();
        let prop_val = query_map.get(cx, prop_name.as_str()).unwrap();
        if let Ok(array) = prop_val.downcast::<JsArray>() {
          let vec = array.to_vec(cx).unwrap();
          map.insert(prop_name, vec.iter().map(|item| {
            item.downcast::<JsString>().unwrap().value()
          }).collect());
        } else {
          map.insert(prop_name, vec![prop_val.downcast::<JsString>().unwrap().value()]);
        }
      }
    }
    map
  })
}

fn get_headers(cx: &mut CallContext<JsPact>, obj: Handle<JsObject>) -> NeonResult<HashMap<String, Vec<String>>> {
  let js_headers = obj.get(cx, "headers");
  js_headers.map(|val| {
    let mut map = hashmap!{};
    if let Ok(header_map) = val.downcast::<JsObject>() {
      let props = header_map.get_own_property_names(cx).unwrap();
      for prop in props.to_vec(cx).unwrap() {
        let prop_name = prop.downcast::<JsString>().unwrap().value();
        let prop_val = header_map.get(cx, prop_name.as_str()).unwrap();
        map.insert(prop_name, vec![prop_val.downcast::<JsString>().unwrap().value()]);
      }
    }
    map
  })
}

fn load_file(file_path: &String) -> Result<OptionalBody, std::io::Error> {
  fs::read(file_path).map(|data| OptionalBody::Present(data))
}

declare_types! {
  pub class JsPact for Pact {
    init(mut cx) {
      let consumer: String = cx.argument::<JsString>(0)?.value();
      let provider: String = cx.argument::<JsString>(1)?.value();

      let pact = Pact {
        consumer: Consumer { name: consumer },
        provider: Provider { name: provider },
        .. Pact::default()
      };

      Ok(pact)
    }

    method addInteraction(mut cx) {
      let description: String = cx.argument::<JsString>(0)?.value();
      let states: Handle<JsArray> = cx.argument(1)?;
      let provider_states = states.to_vec(&mut cx)?.iter()
        .map(|state| {
            let js_state = state.downcast::<JsObject>().unwrap();
            let description = js_state.get(&mut cx, "description").unwrap().downcast::<JsString>().unwrap().value();
            let js_parameters = js_state.get(&mut cx, "parameters");
            match js_parameters {
              Ok(parameters) => match parameters.downcast::<JsObject>() {
                Ok(parameters) => {
                  let js_props = parameters.get_own_property_names(&mut cx).unwrap();
                  let props = js_props.to_vec(&mut cx).unwrap().iter().map(|prop| {
                    let prop_name = prop.downcast::<JsString>().unwrap().value();
                    let prop_val = parameters.get(&mut cx, prop_name.as_str()).unwrap();
                    if let Ok(val) = prop_val.downcast::<JsString>() {
                      (prop_name, json!(val.value()))
                    } else if let Ok(val) = prop_val.downcast::<JsNumber>() {
                      (prop_name, json!(val.value()))
                    } else if let Ok(val) = prop_val.downcast::<JsBoolean>() {
                      (prop_name, json!(val.value()))
                    } else {
                      error!("Ignoring value for provider state parameter '{}'", prop_name);
                      (prop_name, Value::Null)
                    }
                  }).collect();
                  ProviderState { name: description.clone(), params: props }
                },
                Err(_) => {
                  if !parameters.is_a::<JsUndefined>() && !parameters.is_a::<JsNull>() {
                    error!("Expected an Object for state change parameters '{}'", description);
                  }
                  ProviderState::default(&description.clone())
                }
              },
              _ => ProviderState::default(&description.clone())
            }
        }).collect();

      let mut this = cx.this();
      {
        let guard = cx.lock();
        let mut pact = this.borrow_mut(&guard);
        pact.interactions.push(Interaction {
            description,
            provider_states,
            .. Interaction::default()
        });
      }

      Ok(cx.undefined().upcast())
    }

    method addRequest(mut cx) {
      let request = cx.argument::<JsObject>(0)?;

      let js_method = request.get(&mut cx, "method");
      let path = get_request_path(&mut cx, request);
      let js_query_props = get_query(&mut cx, request);
      let js_header_props = get_headers(&mut cx, request);
      let js_body = match cx.argument::<JsValue>(1) {
        Ok(body) => body.downcast::<JsString>().map(|val| val.value()).ok(),
        Err(_) => None
      };

      let mut this = cx.this();

      let result = {
        let guard = cx.lock();
        let mut pact = this.borrow_mut(&guard);

        if let Some(last) = pact.interactions.last_mut() {
          if let Ok(method) = js_method {
            match method.downcast::<JsString>() {
              Ok(method) => last.request.method = method.value().to_string(),
              Err(err) => if !method.is_a::<JsUndefined>() && !method.is_a::<JsNull>() {
                warn!("Request method is not a string value - {}", err)
              }
            }
          }
          if let Some((path, rule, gen)) = path {
            last.request.path = path;
            if let Some(rule) = rule {
              let category = last.request.matching_rules.add_category("path");
              category.add_rule(&"".to_string(), rule, &RuleLogic::And)
            }
            if let Some(gen) = gen {
              last.request.generators.add_generator(&GeneratorCategory::PATH, gen)
            }
          }
          if let Ok(query_props) = js_query_props {
            last.request.query = Some(query_props)
          }
          if let Ok(header_props) = js_header_props {
            last.request.headers = Some(header_props)
          }
          if let Some(body) = js_body {
            match process_body(body, last.request.content_type_enum(), &mut last.request.matching_rules,
              &mut last.request.generators) {
              Ok(body) => {
                debug!("Request body = {}", body.str_value());
                last.request.body = body
              },
              Err(err) => panic!(err)
            }
          }
          debug!("Request = {}", last.request);
          debug!("Request matching rules = {:?}", last.request.matching_rules);
          debug!("Request generators = {:?}", last.request.generators);
          Ok(())
        } else if pact.interactions.is_empty() {
          Err("You need to define a new interaction with the uponReceiving method before you can define a new request with the withRequest method")
        } else {
          Ok(())
        }
      };

      match result {
        Ok(_) => Ok(cx.undefined().upcast()),
        Err(message) => cx.throw_error(message)
      }
    }

    method addRequestBinaryFile(mut cx) {
      let request = cx.argument::<JsObject>(0)?;
      let content_type = cx.argument::<JsString>(1)?;
      let file_path = cx.argument::<JsString>(2)?;

      let js_method = request.get(&mut cx, "method");
      let path = get_request_path(&mut cx, request);
      let js_query_props = get_query(&mut cx, request);
      let js_header_props = get_headers(&mut cx, request);

      let mut this = cx.this();

      let result = {
        let guard = cx.lock();
        let mut pact = this.borrow_mut(&guard);

        if let Some(last) = pact.interactions.last_mut() {
          if let Ok(method) = js_method {
            match method.downcast::<JsString>() {
              Ok(method) => last.request.method = method.value().to_string(),
              Err(err) => if !method.is_a::<JsUndefined>() && !method.is_a::<JsNull>() {
                warn!("Request method is not a string value - {}", err)
              }
            }
          }
          if let Some((path, rule, gen)) = path {
            last.request.path = path;
            if let Some(rule) = rule {
              let category = last.request.matching_rules.add_category("path");
              category.add_rule(&"".to_string(), rule, &RuleLogic::And)
            }
            if let Some(gen) = gen {
              last.request.generators.add_generator(&GeneratorCategory::PATH, gen)
            }
          }

          if let Ok(query_props) = js_query_props {
            last.request.query = Some(query_props)
          }

          if let Ok(header_props) = js_header_props {
            last.request.headers = Some(header_props)
          }

          match load_file(&file_path.value()) {
            Ok(body) => {
              last.request.body = body;
              last.request.matching_rules.add_category("body").add_rule("$", MatchingRule::ContentType(content_type.value()), &RuleLogic::And);
              if !last.request.has_header(&"Content-Type".to_string()) {
                match last.request.headers {
                  Some(ref mut headers) => {
                    headers.insert("Content-Type".to_string(), vec!["application/octet-stream".to_string()]);
                  },
                  None => {
                    last.request.headers = Some(hashmap! { "Content-Type".to_string() => vec!["application/octet-stream".to_string()]});
                  }
                }
              }
              Ok(())
            },
            Err(err) => {
              error!("Could not load file {}: {}", file_path.value(), err);
              Err(format!("Could not load file {}: {}", file_path.value(), err))
            }
          }
        } else if pact.interactions.is_empty() {
          Err("You need to define a new interaction with the uponReceiving method before you can define a new request with the withRequestBinaryFile method".to_string())
        } else {
          Ok(())
        }
      };

      match result {
        Ok(_) => Ok(cx.undefined().upcast()),
        Err(message) => cx.throw_error(message)
      }
    }

    method addRequestMultipartFileUpload(mut cx) {
      let request = cx.argument::<JsObject>(0)?;
      let content_type = cx.argument::<JsString>(1)?;
      let file_path = cx.argument::<JsString>(2)?;
      let part_name = cx.argument::<JsString>(3)?;

      let js_method = request.get(&mut cx, "method");
      let path = get_request_path(&mut cx, request);
      let js_query_props = get_query(&mut cx, request);
      let js_header_props = get_headers(&mut cx, request);

      let mut this = cx.this();

      let result = {
        let guard = cx.lock();
        let mut pact = this.borrow_mut(&guard);

        if let Some(last) = pact.interactions.last_mut() {
          if let Ok(method) = js_method {
            match method.downcast::<JsString>() {
              Ok(method) => last.request.method = method.value().to_string(),
              Err(err) => if !method.is_a::<JsUndefined>() && !method.is_a::<JsNull>() {
                warn!("Request method is not a string value - {}", err)
              }
            }
          }
          if let Some((path, rule, gen)) = path {
            last.request.path = path;
            if let Some(rule) = rule {
              let category = last.request.matching_rules.add_category("path");
              category.add_rule(&"".to_string(), rule, &RuleLogic::And)
            }
            if let Some(gen) = gen {
              last.request.generators.add_generator(&GeneratorCategory::PATH, gen)
            }
          }

          if let Ok(query_props) = js_query_props {
            last.request.query = Some(query_props)
          }

          if let Ok(header_props) = js_header_props {
            last.request.headers = Some(header_props)
          }

          let boundary = last.description.replace(" ", "_");
          match file_as_multipart_body(&file_path.value(), &part_name.value(), &boundary) {
            Ok(body) => {
              request_multipart(&mut last.request, &boundary, body, &content_type.value(), &part_name.value());
              Ok(())
            },
            Err(err) => {
              error!("Could not load file {}: {}", file_path.value(), err);
              Err(format!("Could not load file {}: {}", file_path.value(), err))
            }
          }
        } else if pact.interactions.is_empty() {
          Err("You need to define a new interaction with the uponReceiving method before you can define a new request with the withResponseMultipartFileUpload method".to_string())
        } else {
          Ok(())
        }
      };

      match result {
        Ok(_) => Ok(cx.undefined().upcast()),
        Err(message) => cx.throw_error(message)
      }
    }

    method addResponse(mut cx) {
      let response = cx.argument::<JsObject>(0)?;
      let js_status = response.get(&mut cx, "status");
      let js_header_props = get_headers(&mut cx, response);
      let js_body = match cx.argument::<JsValue>(1) {
        Ok(body) => body.downcast::<JsString>().map(|val| val.value()).ok(),
        Err(_) => None
      };

      let mut this = cx.this();

      let result = {
        let guard = cx.lock();
        let mut pact = this.borrow_mut(&guard);
        if let Some(last) = pact.interactions.last_mut() {
          if let Ok(status) = js_status {
            match status.downcast::<JsNumber>() {
              Ok(status) => last.response.status = status.value() as u16,
              Err(err) => warn!("Response status is not a number - {}", err)
            }
          }
          if let Ok(header_props) = js_header_props {
            last.response.headers = Some(header_props)
          }

          if let Some(body) = js_body {
            match process_body(body, last.response.content_type_enum(), &mut last.response.matching_rules,
              &mut last.response.generators) {
              Ok(body) => last.response.body = body,
              Err(err) => panic!(err)
            }
          }
          debug!("Response = {}", last.response);
          debug!("Response matching rules = {:?}", last.response.matching_rules);
          debug!("Response generators = {:?}", last.response.generators);
          Ok(())
        } else if pact.interactions.is_empty() {
          Err("You need to define a new interaction with the uponReceiving method before you can define a new response with the willRespondWith method")
        } else {
          Ok(())
        }
      };

      match result {
        Ok(_) => Ok(cx.undefined().upcast()),
        Err(message) => cx.throw_error(message)
      }
    }

    method addResponseBinaryFile(mut cx) {
      let response = cx.argument::<JsObject>(0)?;
      let content_type = cx.argument::<JsString>(1)?;
      let file_path = cx.argument::<JsString>(2)?;

      let js_status = response.get(&mut cx, "status");
      let js_header_props = get_headers(&mut cx, response);

      let mut this = cx.this();

      let result = {
        let guard = cx.lock();
        let mut pact = this.borrow_mut(&guard);

        if let Some(last) = pact.interactions.last_mut() {
          if let Ok(status) = js_status {
            match status.downcast::<JsNumber>() {
              Ok(status) => last.response.status = status.value() as u16,
              Err(err) => warn!("Response status is not a number - {}", err)
            }
          }
          if let Ok(header_props) = js_header_props {
            last.response.headers = Some(header_props)
          }

          match load_file(&file_path.value()) {
            Ok(body) => {
              last.response.body = body;
              last.response.matching_rules.add_category("body").add_rule("$", MatchingRule::ContentType(content_type.value()), &RuleLogic::And);
              if !last.response.has_header(&"Content-Type".to_string()) {
                match last.response.headers {
                  Some(ref mut headers) => {
                    headers.insert("Content-Type".to_string(), vec!["application/octet-stream".to_string()]);
                  },
                  None => {
                    last.response.headers = Some(hashmap! { "Content-Type".to_string() => vec!["application/octet-stream".to_string()]});
                  }
                }
              }
              Ok(())
            },
            Err(err) => {
              error!("Could not load file {}: {}", file_path.value(), err);
              Err(format!("Could not load file {}: {}", file_path.value(), err))
            }
          }
        } else if pact.interactions.is_empty() {
          Err("You need to define a new interaction with the uponReceiving method before you can define a new response with the withResponseBinaryFile method".to_string())
        } else {
          Ok(())
        }
      };

      match result {
        Ok(_) => Ok(cx.undefined().upcast()),
        Err(message) => cx.throw_error(message)
      }
    }

    method addResponseMultipartFileUpload(mut cx) {
      let response = cx.argument::<JsObject>(0)?;
      let content_type = cx.argument::<JsString>(1)?;
      let file_path = cx.argument::<JsString>(2)?;
      let part_name = cx.argument::<JsString>(3)?;

      let js_status = response.get(&mut cx, "status");
      let js_header_props = get_headers(&mut cx, response);

      let mut this = cx.this();

      let result = {
        let guard = cx.lock();
        let mut pact = this.borrow_mut(&guard);

        if let Some(last) = pact.interactions.last_mut() {
          if let Ok(status) = js_status {
            match status.downcast::<JsNumber>() {
              Ok(status) => last.response.status = status.value() as u16,
              Err(err) => warn!("Response status is not a number - {}", err)
            }
          }
          if let Ok(header_props) = js_header_props {
            last.response.headers = Some(header_props)
          }

          let boundary = last.description.replace(" ", "_");
          match file_as_multipart_body(&file_path.value(), &part_name.value(), &boundary) {
            Ok(body) => {
              response_multipart(&mut last.response, &boundary, body, &content_type.value(), &part_name.value());
              Ok(())
            },
            Err(err) => {
              error!("Could not load file {}: {}", file_path.value(), err);
              Err(format!("Could not load file {}: {}", file_path.value(), err))
            }
          }
        } else if pact.interactions.is_empty() {
          Err("You need to define a new interaction with the uponReceiving method before you can define a new response with the withResponseMultipartFileUpload method".to_string())
        } else {
          Ok(())
        }
      };

      match result {
        Ok(_) => Ok(cx.undefined().upcast()),
        Err(message) => cx.throw_error(message)
      }
    }

    method executeTest(mut cx) {
      let test_fn = cx.argument::<JsFunction>(0)?;
      let this = cx.this();

      let mock_server_id = Uuid::new_v4().simple().to_string();
      let port = {
        let guard = cx.lock();
        let pact = this.borrow(&guard);
        match MANAGER.lock().unwrap()
          .start_mock_server(mock_server_id.clone(), pact.clone(), 0)
          .map(|port| port as i32) {
            Ok(port) => port,
            Err(err) => panic!(err)
          }
      };

      let js_port = cx.number(port);
      let js_url = cx.string(format!("http://127.0.0.1:{}", port));
      let js_id = cx.string(mock_server_id);
      let js_mock_server = JsObject::new(&mut cx);
      js_mock_server.set(&mut cx, "port", js_port)?;
      js_mock_server.set(&mut cx, "url", js_url)?;
      js_mock_server.set(&mut cx, "id", js_id)?;
      let args: Vec<Handle<JsObject>> = vec![js_mock_server];
      let null = cx.null();
      let result = test_fn.call(&mut cx, null, args);

      let js_result = JsObject::new(&mut cx);
      js_result.set(&mut cx, "mockServer", js_mock_server)?;

      match result {
        Ok(val) => {
          js_result.set(&mut cx, "testResult", val)?;
        }
        Err(err) => {
          let err_str = cx.string(err.to_string());
          js_result.set(&mut cx, "testError", err_str)?;
        }
      }

      Ok(js_result.upcast())
    }

    method shutdownTest(mut cx) {
      let test_result = cx.argument::<JsObject>(0)?;
      let mock_server = test_result.get(&mut cx, "mockServer")?.downcast::<JsObject>().unwrap();
      let mock_server_id = mock_server.get(&mut cx, "id")?.downcast::<JsString>().unwrap().value();
      MANAGER.lock().unwrap().shutdown_mock_server_by_id(mock_server_id);
      Ok(cx.undefined().upcast())
    }

    method getTestResult(mut cx) {
      let mock_server_id = cx.argument::<JsString>(0)?.value();

      let js_test_result = JsObject::new(&mut cx);

      let mismatches = MANAGER.lock().unwrap().find_mock_server_by_id(&mock_server_id, &|ms| {
        ms.mismatches()
      });
      match mismatches {
        None => {
          let js_str = cx.string(format!("Could not get the result from the mock server: there is no mock server with id {}", mock_server_id));
          js_test_result.set(&mut cx, "mockServerError", js_str)?;
        },
        Some(val) => if !val.is_empty() {
          let mock_server_result = JsArray::new(&mut cx, val.len() as u32);
          for (index, mismatch) in val.iter().enumerate() {
            let js_string = cx.string(json!(mismatch.to_json()).to_string());
            mock_server_result.set(&mut cx, index as u32, js_string).unwrap();
          }
          js_test_result.set(&mut cx, "mockServerMismatches", mock_server_result)?;
        }
      }

      Ok(js_test_result.upcast())
    }

    method writePactFile(mut cx) {
      let mock_server_id = cx.argument::<JsString>(0)?.value();
      let dir = cx.argument::<JsValue>(1)?.downcast::<JsString>().map(|val| val.value()).ok();
      let undefined = cx.undefined().upcast();
      let result = MANAGER.lock().unwrap()
        .find_mock_server_by_id(&mock_server_id, &|mock_server| {
            mock_server.write_pact(&dir)
                .map(|_| undefined)
                .map_err(|err| {
                    error!("Failed to write pact to file - {}", err);
                    format!("Failed to write pact to file - {}", err)
                })
        });

      match result {
        Some(result) => match result {
          Ok(v) => Ok(v),
          Err(err) => cx.throw_error(err)
        },
        None => cx.throw_error(format!("Mock server was not found with ID {}", mock_server_id))
      }
    }
  }
}

register_module!(mut m, {
    m.export_function("init", init)?;
    m.export_class::<JsPact>("Pact")?;
    m.export_function("verify_provider", verify::verify_provider)?;
    m.export_function("generate_datetime_string", generate_datetime_string)?;
    Ok(())
});
