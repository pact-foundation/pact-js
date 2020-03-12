use neon::prelude::*;
use pact_verifier::{ProviderInfo, VerificationOptions, FilterInfo, PactSource};
use pact_verifier::callback_executors::{RequestFilterExecutor, ProviderStateExecutor, ProviderStateError};
use pact_matching::models::http_utils::HttpAuth;
use pact_matching::models::Request;
use ansi_term::Colour::*;
use url::Url;
use std::sync::mpsc;
use std::time::Duration;
use async_trait::async_trait;
use pact_matching::models::provider_states::ProviderState;
use maplit::*;
use std::collections::HashMap;
use crate::utils::serde_value_to_js_object_attr;
use log::*;

fn get_string_value(cx: &mut FunctionContext, obj: &JsObject, name: &str) -> Option<String> {
  match obj.get(cx, name) {
    Ok(val) => match val.downcast::<JsString>() {
      Ok(val) => Some(val.value()),
      Err(_) => None
    },
    _ => None
  }
}

#[derive(Clone)]
struct RequestFilterCallback {
  callback_handler: EventHandler
}

impl RequestFilterExecutor for RequestFilterCallback {
  fn call(&self, request: &Request) -> Request {
    let (sender, receiver) = mpsc::channel();
    let request_copy = request.clone();
    let result = self.callback_handler.schedule_with(move |cx, this, callback| {
      let js_method = cx.string(request_copy.method);
      let js_path = cx.string(request_copy.path);
      let js_query = JsObject::new(cx);
      let js_headers = JsObject::new(cx);
      let js_request = JsObject::new(cx);
      let js_body = cx.string(request_copy.body.str_value());

      if let Some(query) = request_copy.query {
        query.iter().for_each(|(k, v)| {
          let vars = JsArray::new(cx, v.len() as u32);
          v.iter().enumerate().for_each(|(i, val)| {
            let qval = cx.string(val);
            vars.set(cx, i as u32, qval).unwrap();
          });
          js_query.set(cx, k.as_str(), vars).unwrap();
        });
      };

      if let Some(headers) = request_copy.headers {
        headers.iter().for_each(|(k, v)| {
          let vars = JsArray::new(cx, v.len() as u32);
          v.iter().enumerate().for_each(|(i, val)| {
            let hval = cx.string(val);
            vars.set(cx, i as u32, hval).unwrap();
          });
          js_headers.set(cx, k.as_str(), vars).unwrap();
        });
      };

      js_request.set(cx, "method", js_method).unwrap();
      js_request.set(cx, "path", js_path).unwrap();
      js_request.set(cx, "headers", js_headers).unwrap();
      js_request.set(cx, "query", js_query).unwrap();
      js_request.set(cx, "body", js_body).unwrap();
      let args = vec![js_request];
      let result = callback.call(cx, this, args);

      match result {
        Ok(val) => {
          if let Ok(js_obj) = val.downcast::<JsObject>() {
            let mut request = Request::default();
            if let Ok(val) = js_obj.get(cx, "method").unwrap().downcast::<JsString>() {
              request.method = val.value();
            }
            if let Ok(val) = js_obj.get(cx, "path").unwrap().downcast::<JsString>() {
              request.path = val.value();
            }
            if let Ok(val) = js_obj.get(cx, "body").unwrap().downcast::<JsString>() {
              request.body = val.value().into();
            }

            if let Ok(query_map) = js_obj.get(cx, "query").unwrap().downcast::<JsObject>() {
              let mut map = hashmap!{};
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
              request.query = Some(map)
            }

            if let Ok(header_map) = js_obj.get(cx, "headers").unwrap().downcast::<JsObject>() {
              let mut map = hashmap!{};
              let props = header_map.get_own_property_names(cx).unwrap();
              for prop in props.to_vec(cx).unwrap() {
                let prop_name = prop.downcast::<JsString>().unwrap().value();
                let prop_val = header_map.get(cx, prop_name.as_str()).unwrap();
                if let Ok(array) = prop_val.downcast::<JsArray>() {
                  let vec = array.to_vec(cx).unwrap();
                  map.insert(prop_name, vec.iter().map(|item| {
                    item.downcast::<JsString>().unwrap().value()
                  }).collect());
                } else {
                  map.insert(prop_name, vec![prop_val.downcast::<JsString>().unwrap().value()]);
                }
              }
              request.headers = Some(map)
            }

            sender.send(request).unwrap();
          } else {
            error!("Request filter did not return an object");
          }
        },
        Err(err) => {
          error!("Request filter threw an exception: {}", err);
        }
      }
    });

    receiver.recv_timeout(Duration::from_millis(1000)).unwrap_or(request.clone())
  }
}

#[derive(Clone)]
struct ProviderStateCallback<'a> {
  callback_handlers: &'a HashMap<String, EventHandler>
}

#[async_trait]
impl ProviderStateExecutor for ProviderStateCallback<'_> {
  async fn call(&self, interaction_id: Option<String>, provider_state: &ProviderState, setup: bool, client: Option<&reqwest::Client>) -> Result<HashMap<String, serde_json::Value>, ProviderStateError> {
    match self.callback_handlers.get(&provider_state.name) {
      Some(callback) => {
        let (sender, receiver) = mpsc::channel();
        let state = provider_state.clone();
        let iid = interaction_id.clone();
        let result = callback.schedule_with(move |cx, this, callback| {
          let args = if !state.params.is_empty() {
            let js_parameter = JsObject::new(cx);
            for (ref parameter, ref value) in state.params {
              serde_value_to_js_object_attr(cx, &js_parameter, parameter, value).unwrap();
            };
            vec![cx.boolean(setup).upcast::<JsValue>(), js_parameter.upcast::<JsValue>()]
          } else {
            vec![cx.boolean(setup).upcast::<JsValue>()]
          };
          let callback_result = callback.call(cx, this, args);
          match callback_result {
            Ok(val) => {
              sender.send(Ok(hashmap!{})).unwrap();
            },
            Err(err) => {
              error!("Provider state callback for '{}' failed: {}", state.name, err);
              let error = ProviderStateError { description: format!("Provider state callback for '{}' failed: {}", state.name, err), interaction_id: iid };
              sender.send(Result::<HashMap<String, serde_json::Value>, ProviderStateError>::Err(error)).unwrap();
            }
          };
        });
        match receiver.recv_timeout(Duration::from_millis(1000)) {
          Ok(result) => {
            debug!("Received {:?} from callback", result);
            match result {
              Ok(result) => Ok(hashmap!{}),
              Err(err) => Err(err)
            }
          },
          Err(_) => Err(ProviderStateError { description: format!("Provider state callback for '{}' timed out after 1000 ms", provider_state.name), interaction_id })
        }
      },
      None => {
        error!("No provider state callback defined for '{}'", provider_state.name);
        Err(ProviderStateError { description: format!("No provider state callback defined for '{}'", provider_state.name), interaction_id })
      }
    }
  }
}

struct BackgroundTask {
  pub provider_info: ProviderInfo,
  pub pacts: Vec<PactSource>,
  pub filter_info: FilterInfo,
  pub consumers_filter: Vec<String>,
  pub options: VerificationOptions<RequestFilterCallback>,
  pub state_handlers: HashMap<String, EventHandler>
}

impl Task for BackgroundTask {
  type Output = bool;
  type Error = String;
  type JsEvent = JsBoolean;

  fn perform(&self) -> Result<Self::Output, Self::Error> {
    let mut runtime = tokio::runtime::Builder::new()
      .threaded_scheduler()
      .enable_all()
      .build()
      .unwrap();

    runtime.block_on(async {
      let provider_state_executor = ProviderStateCallback { callback_handlers: &self.state_handlers };
      Ok(pact_verifier::verify_provider(self.provider_info.clone(), self.pacts.clone(), self.filter_info.clone(), self.consumers_filter.clone(), self.options.clone(), &provider_state_executor).await)
    })
  }

  fn complete(self, mut cx: TaskContext, result: Result<Self::Output, Self::Error>) -> JsResult<Self::JsEvent> {
    match dbg!(result) {
      Ok(res) => Ok(cx.boolean(res)), // TODO: send a data structure back so we can do things with it (e.g. sub tests)
      Err(err) => cx.throw_error(err)
    }
  }
}

pub fn verify_provider(mut cx: FunctionContext) -> JsResult<JsUndefined> {
  let config = cx.argument::<JsObject>(0)?;
  let callback = cx.argument::<JsFunction>(1)?;

  let provider = config.get(&mut cx, "provider").unwrap().downcast::<JsString>().unwrap().value();

  let mut pacts: Vec<PactSource> = vec![];
  match config.get(&mut cx, "pactUrls") {
    Ok(urls) => match urls.downcast::<JsArray>() {
      Ok(urls) => {
        if let Ok(urls) = urls.to_vec(&mut cx) {
          for url in urls {
            match url.downcast::<JsString>() {
              Ok(url) => pacts.push(PactSource::File(url.value())),
              _ => println!("    {}", Yellow.paint ("WARN: pactUrls does not contain a valid list of URL strings"))
            }
          }
        }
      },
      _ => println!("    {}", Yellow.paint ("WARN: pactUrls is not a list of URLs"))
    },
    _ => ()
  };

  debug!("{:?}", pacts);

  match config.get(&mut cx, "pactBrokerUrl") {
    Ok(url) => match url.downcast::<JsString>() {
      Ok(url) => {
        if let Some(username) = get_string_value(&mut cx, &config, "pactBrokerUsername") {
          let password = get_string_value(&mut cx, &config, "pactBrokerPassword");
          pacts.push(PactSource::BrokerUrl(provider.clone(), url.value(), Some(HttpAuth::User(username, password)), vec![]));
        } else if let Some(token) = get_string_value(&mut cx, &config, "pactBrokerToken") {
          pacts.push(PactSource::BrokerUrl(provider.clone(), url.value(), Some(HttpAuth::Token(token)), vec![]));
        } else {
          pacts.push(PactSource::BrokerUrl(provider.clone(), url.value(), None, vec![]));
        }
      },
      Err(_) => {
        if !url.is_a::<JsUndefined>() {
          println!("    {}", Red.paint("ERROR: pactBrokerUrl must be a string value"));
          cx.throw_error("pactBrokerUrl must be a string value")?;
        }
      }
    },
    _ => ()
  };

  // providerStatesSetupUrl?: string
  // consumerVersionTag?: string | string[]
  // providerVersionTag?: string | string[]
  // customProviderHeaders?: string[]
  // publishVerificationResult?: boolean
  // providerVersion?: string
  // tags?: string[]

  let mut provider_info = ProviderInfo {
    name: provider.clone(),
    .. ProviderInfo::default()
  };

  match get_string_value(&mut cx, &config, "providerBaseUrl") {
    Some(url) => match Url::parse(&url) {
      Ok(url) => {
        provider_info.protocol = url.scheme().into();
        provider_info.host = url.host_str().unwrap_or("localhost").into();
        provider_info.port = url.port();
        provider_info.path = url.path().into();
      },
      Err(err) => {
        println!("    {}", Red.paint("ERROR: pactBrokerUrl is not a valid URL"));
      }
    },
    None => ()
  };

  let request_filter = match config.get(&mut cx, "requestFilter") {
    Ok(request_filter) => match request_filter.downcast::<JsFunction>() {
      Ok(val) => {
        let this = cx.this();
        Some(Box::new(RequestFilterCallback { callback_handler: EventHandler::new(&cx, this, val) }))
      },
      Err(_) => None
    },
    _ => None
  };

  let mut callbacks = hashmap![];
  match config.get(&mut cx, "stateHandlers") {
    Ok(state_handlers) => match state_handlers.downcast::<JsObject>() {
      Ok(state_handlers) => {
        let this = cx.this();
        let props = state_handlers.get_own_property_names(&mut cx).unwrap();
        for prop in props.to_vec(&mut cx).unwrap() {
          let prop_name = prop.downcast::<JsString>().unwrap().value();
          let prop_val = state_handlers.get(&mut cx, prop_name.as_str()).unwrap();
          if let Ok(callback) = prop_val.downcast::<JsFunction>() {
            callbacks.insert(prop_name, EventHandler::new(&cx, this, callback));
          }
        };
      },
      Err(_) => ()
    },
    _ => ()
  };

  let filter_info = FilterInfo::None;
  let consumers_filter: Vec<String> = vec![];
  let options = VerificationOptions {
    publish: false,
    provider_version: None,
    build_url: None,
    request_filter,
    provider_tags: vec![]
  };

  BackgroundTask { provider_info, pacts, filter_info, consumers_filter, options, state_handlers: callbacks }.schedule(callback);
  
  Ok(cx.undefined())
}
