#[macro_use] extern crate neon;
#[macro_use] extern crate pact_matching;
extern crate pact_mock_server;
#[macro_use] extern crate log;
extern crate env_logger;
extern crate uuid;
// #[macro_use] extern crate neon_serde;
#[macro_use] extern crate serde_derive;
#[macro_use] extern crate lazy_static;
#[macro_use] extern crate serde_json;
#[macro_use] extern crate maplit;

use neon::prelude::*;
use pact_matching::models::*;
use pact_matching::models::provider_states::ProviderState;
use pact_matching::models::json_utils::json_to_string;
use pact_matching::models::matchingrules::{MatchingRules, MatchingRule, Category, RuleLogic};
use pact_matching::models::generators::{Generators, GeneratorCategory, Generator};
use pact_mock_server::*;
use pact_mock_server::server_manager::ServerManager;
use std::env;
use env_logger::{Builder, Target};
use uuid::Uuid;
use std::sync::Mutex;
use serde_json::{Result, Value};
use serde_json::map::Map;

lazy_static! {
  static ref MANAGER: Mutex<ServerManager> = Mutex::new(ServerManager::new());
}

fn init(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let mut builder = Builder::from_default_env();
    builder.target(Target::Stdout);
    builder.init();
    Ok(cx.undefined())
}

fn process_array(array: &Vec<Value>, matching_rules: &mut Category, generators: &mut Generators, path: &String) -> Value {
  Value::Array(array.iter().enumerate().map(|(index, val)| {
    match val {
      Value::Object(ref map) => process_object(map, matching_rules, generators, &(path.to_owned() + "[" + &index.to_string() + "]")),
      Value::Array(ref array) => process_array(array, matching_rules, generators, &(path.to_owned() + "[" + &index.to_string() + "]")),
      _ => val.clone()  
    }
  }).collect())
}

fn process_object(obj: &Map<String, Value>, matching_rules: &mut Category, generators: &mut Generators, path: &String) -> Value {
  if obj.contains_key("pact:matcher:type") {
    if let Some(rule) = MatchingRule::from_integration_json(obj) {
      matching_rules.add_rule(path, rule, &RuleLogic::And)
    }
    if let Some(gen) = obj.get("pact:generator:type") {
      match Generator::from_map(&json_to_string(gen), obj) {
        Some(generator) => generators.add_generator_with_subcategory(&GeneratorCategory::BODY, path, generator),
        _ => ()
      }
    }
    match obj.get("value") {
      Some(val) => match val {
        Value::Object(ref map) => process_object(map, matching_rules, generators, path),
        Value::Array(array) => process_array(array, matching_rules, generators, path),
        _ => val.clone()  
      },
      None => Value::Null
    }
  } else {
    Value::Object(obj.iter().map(|(key, val)| {
      (key.clone(), match val {
        Value::Object(ref map) => process_object(map, matching_rules, generators, &(path.to_owned() + "." + key)),
        Value::Array(ref array) => process_array(array, matching_rules, generators, &(path.to_owned() + "." + key)),
        _ => val.clone()
      })
    }).collect())
  }
}

fn process_json(body: String, matching_rules: &mut Category, generators: &mut Generators) -> String {
  match serde_json::from_str(&body) {
    Ok(json) => match json { 
      Value::Object(ref map) => process_object(map, matching_rules, generators, &"$".to_string()).to_string(),
      Value::Array(ref array) => process_array(array, matching_rules, generators, &"$".to_string()).to_string(),
      _ => body
    },
    Err(_) => body
  }
}

fn process_body(body: String, content_type: DetectedContentType) -> (OptionalBody, MatchingRules, Generators) {
  let mut matching_rules = MatchingRules::default();
  let mut category = matching_rules.add_category("body");
  let mut generators = Generators::default();

  let processed_body = match content_type {
    DetectedContentType::Json => process_json(body, &mut category, &mut generators),
    _ => body
  };

  (OptionalBody::from(processed_body), matching_rules, generators)
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
            let state_desc = state.downcast::<JsString>().unwrap().value();
            ProviderState::default(&state_desc.clone())
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
      let js_path = request.get(&mut cx, "path");
      let js_query = request.get(&mut cx, "query");
      let js_query_props = js_query.map(|val| {
        let mut map = hashmap!{};
        let query_map = val.downcast::<JsObject>().unwrap();
        let props = query_map.get_own_property_names(&mut cx).unwrap();
        for prop in props.to_vec(&mut cx).unwrap() {
          let prop_name = prop.downcast::<JsString>().unwrap().value();
          let prop_val = query_map.get(&mut cx, prop_name.as_str()).unwrap();
          if let Ok(array) = prop_val.downcast::<JsArray>() {
            // convert the array to a vec
          } else {
            map.insert(prop_name, vec![prop_val.downcast::<JsString>().unwrap().value()]);
          }
        }
        map
      });
      let js_headers = request.get(&mut cx, "headers");
      let js_header_props = js_headers.map(|val| {
        let mut map = hashmap!{};
        let header_map = val.downcast::<JsObject>().unwrap();
        let props = header_map.get_own_property_names(&mut cx).unwrap();
        for prop in props.to_vec(&mut cx).unwrap() {
          let prop_name = prop.downcast::<JsString>().unwrap().value();
          let prop_val = header_map.get(&mut cx, prop_name.as_str()).unwrap();
          map.insert(prop_name, vec![prop_val.downcast::<JsString>().unwrap().value()]);
        }
        map
      });
      let js_body = cx.argument::<JsValue>(1)?.downcast::<JsString>().map(|val| OptionalBody::from(val.value()));

      let mut this = cx.this();

      {
        let guard = cx.lock();
        let mut pact = this.borrow_mut(&guard);
        if let Some(last) = pact.interactions.last_mut() {
          if let Ok(method) = js_method {
            last.request.method = method.downcast::<JsString>().unwrap().value().to_string();
          }
          if let Ok(path) = js_path {
            last.request.path = path.downcast::<JsString>().unwrap().value().to_string();
          }
          if let Ok(query_props) = js_query_props {
            last.request.query = Some(query_props)
          }
          if let Ok(header_props) = js_header_props {
            last.request.headers = Some(header_props)
          }
          if let Ok(body) = js_body {
            last.request.body = body
          }
        }
      }

      Ok(cx.undefined().upcast())
    }

    method addResponse(mut cx) {
      let response = cx.argument::<JsObject>(0)?;
      let js_status = response.get(&mut cx, "status");
      let js_headers = response.get(&mut cx, "headers");
      let js_header_props = js_headers.map(|val| {
        let mut map = hashmap!{};
        let header_map = val.downcast::<JsObject>().unwrap();
        let props = header_map.get_own_property_names(&mut cx).unwrap();
        for prop in props.to_vec(&mut cx).unwrap() {
          let prop_name = prop.downcast::<JsString>().unwrap().value();
          let prop_val = header_map.get(&mut cx, prop_name.as_str()).unwrap();
          map.insert(prop_name, vec![prop_val.downcast::<JsString>().unwrap().value()]);
        }
        map
      });
      let js_body = cx.argument::<JsValue>(1)?.downcast::<JsString>().map(|val| val.value());

      let mut this = cx.this();

      {
        let guard = cx.lock();
        let mut pact = this.borrow_mut(&guard);
        if let Some(last) = pact.interactions.last_mut() {
            if let Ok(status) = js_status {
              last.response.status = status.downcast::<JsNumber>().unwrap().value() as u16;
            }
            if let Ok(header_props) = js_header_props {
              last.response.headers = Some(header_props)
            }
            if let Ok(body) = js_body {
              let (val, matching_rules, generators) = process_body(body, last.response.content_type_enum());
              last.response.body = val;
              last.response.matching_rules = matching_rules;
              last.response.generators = generators;
            }
        }
      }

      Ok(cx.undefined().upcast())
    }

    method executeTest(mut cx) {
      let testFn = cx.argument::<JsFunction>(0)?;
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
      let result = testFn.call(&mut cx, null, args);

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
      let this = cx.this();
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
          let js_str = cx.string("Could not the result from the mock server");
          js_test_result.set(&mut cx, "mockServerResult", js_str)?;
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
      MANAGER.lock().unwrap()
        .find_mock_server_by_id(&mock_server_id, &|mock_server| {
            mock_server.write_pact(&dir)
                .map(|_| undefined)
                .map_err(|err| {
                    error!("Failed to write pact to file - {}", err);
                    panic!("Failed to write pact to file - {}", err)
                })
        }).unwrap()
    }
  }
}

register_module!(mut m, {
    m.export_function("init", init)?;
    m.export_class::<JsPact>("Pact")?;
    Ok(())
});
