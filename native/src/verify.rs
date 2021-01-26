use std::collections::HashMap;
use std::panic;
use std::sync::{Arc, mpsc};
use std::time::Duration;

use ansi_term::Colour::*;
use async_trait::async_trait;
use log::*;
use maplit::*;
use neon::prelude::*;
use pact_matching::models::http_utils::HttpAuth;
use pact_matching::models::provider_states::ProviderState;
use pact_matching::models::Request;
use pact_verifier::{FilterInfo, PactSource, ProviderInfo, VerificationOptions};
use pact_verifier::callback_executors::{ProviderStateError, ProviderStateExecutor, RequestFilterExecutor};
use serde_json::Value;
use url::Url;

use crate::utils::{js_value_to_serde_value, serde_value_to_js_object_attr};

fn get_string_value(cx: &mut FunctionContext, obj: &JsObject, name: &str) -> Option<String> {
  match obj.get(cx, name) {
    Ok(val) => match val.downcast::<JsString, FunctionContext>(cx) {
      Ok(val) => Some(val.value(cx)),
      Err(_) => None
    },
    _ => None
  }
}

fn get_bool_value(cx: &mut FunctionContext, obj: &JsObject, name: &str) -> bool {
  match obj.get(cx, name) {
    Ok(val) => match val.downcast::<JsBoolean, FunctionContext>(cx) {
      Ok(val) => val.value(cx),
      Err(_) => false
    },
    _ => false
  }
}

fn get_string_array(cx: &mut FunctionContext, obj: &JsObject, name: &str) -> Result<Vec<String>, String> {
  match obj.get(cx, name) {
    Ok(items) => match items.downcast::<JsString, FunctionContext>(cx) {
      Ok(item) => Ok(vec![ item.value(cx).to_string() ]),
      Err(_) => match items.downcast::<JsArray, FunctionContext>(cx) {
        Ok(items) => {
          let mut tags = vec![];
          if let Ok(items) = items.to_vec(cx) {
            for tag in items {
              match tag.downcast::<JsString, FunctionContext>(cx) {
                Ok(val) => tags.push(val.value(cx).to_string()),
                Err(_) => {
                  println!("    {}", Red.paint(format!("ERROR: {} must be a string or array of strings", name)));
                }
              }
            }
          };
          Ok(tags)
        },
        Err(_) => if !items.is_a::<JsUndefined, FunctionContext>(cx) {
          println!("    {}", Red.paint(format!("ERROR: {} must be a string or array of strings", name)));
          Err(format!("{} must be a string or array of strings", name))
        } else {
          Ok(vec![])
        }
      }
    },
    _ => Ok(vec![])
  }
}

#[derive(Clone)]
struct RequestFilterCallback {
  callback_handler: Arc<Root<JsFunction>>,
  queue: Arc<EventQueue>
}

impl RequestFilterExecutor for RequestFilterCallback {
  fn call(self: Arc<Self>, request: &Request) -> Request {
    let (sender_in, receiver_in) = mpsc::channel();
    let (sender, receiver) = mpsc::channel();
    sender_in.send((request.clone(), self.callback_handler.clone())).unwrap();
    self.queue.send(move |mut cx| {
      let (request_copy, callback) = receiver_in.recv().unwrap();
      let js_method = cx.string(request_copy.method);
      let js_path = cx.string(request_copy.path);
      let js_query = JsObject::new(&mut cx);
      let js_headers = JsObject::new(&mut cx);
      let js_request = JsObject::new(&mut cx);
      let js_body = cx.string(request_copy.body.str_value());

      if let Some(query) = request_copy.query {
        query.iter().for_each(|(k, v)| {
          let vars = JsArray::new(&mut cx, v.len() as u32);
          v.iter().enumerate().for_each(|(i, val)| {
            let qval = cx.string(val);
            vars.set(&mut cx, i as u32, qval).unwrap();
          });
          js_query.set(&mut cx, k.as_str(), vars).unwrap();
        });
      };

      if let Some(headers) = request_copy.headers {
        headers.iter().for_each(|(k, v)| {
          let vars = JsArray::new(&mut cx, v.len() as u32);
          v.iter().enumerate().for_each(|(i, val)| {
            let hval = cx.string(val);
            vars.set(&mut cx, i as u32, hval).unwrap();
          });
          js_headers.set(&mut cx, k.to_lowercase().as_str(), vars).unwrap();
        });
      };

      js_request.set(&mut cx, "method", js_method).unwrap();
      js_request.set(&mut cx, "path", js_path).unwrap();
      js_request.set(&mut cx, "headers", js_headers).unwrap();
      js_request.set(&mut cx, "query", js_query).unwrap();
      js_request.set(&mut cx, "body", js_body).unwrap();
      let args = vec![js_request];
      let inner = callback.to_inner(&mut cx);
      let this = cx.undefined();
      let result = inner.call(&mut cx, this, args);

      match result {
        Ok(val) => {
          if let Ok(js_obj) = val.downcast::<JsObject, TaskContext>(&mut cx) {
            let mut request = Request::default();
            if let Ok(val) = js_obj.get(&mut cx, "method").unwrap().downcast::<JsString, TaskContext>(&mut cx) {
              request.method = val.value(&mut cx);
            }
            if let Ok(val) = js_obj.get(&mut cx, "path").unwrap().downcast::<JsString, TaskContext>(&mut cx) {
              request.path = val.value(&mut cx);
            }
            if let Ok(val) = js_obj.get(&mut cx, "body").unwrap().downcast::<JsString, TaskContext>(&mut cx) {
              request.body = val.value(&mut cx).into();
            }

            if let Ok(query_map) = js_obj.get(&mut cx, "query").unwrap().downcast::<JsObject, TaskContext>(&mut cx) {
              let mut map = hashmap!{};
              let props = query_map.get_own_property_names(&mut cx).unwrap();
              for prop in props.to_vec(&mut cx).unwrap() {
                let prop_name = prop.downcast::<JsString, TaskContext>(&mut cx).unwrap().value(&mut cx);
                let prop_val = query_map.get(&mut cx, prop_name.as_str()).unwrap();
                if let Ok(array) = prop_val.downcast::<JsArray, TaskContext>(&mut cx) {
                  let vec = array.to_vec(&mut cx).unwrap();
                  map.insert(prop_name, vec.iter().map(|item| {
                    item.downcast::<JsString, TaskContext>(&mut cx).unwrap().value(&mut cx)
                  }).collect());
                } else {
                  map.insert(prop_name, vec![prop_val.downcast::<JsString, TaskContext>(&mut cx).unwrap().value(&mut cx)]);
                }
              }
              request.query = Some(map)
            }

            if let Ok(header_map) = js_obj.get(&mut cx, "headers").unwrap().downcast::<JsObject, TaskContext>(&mut cx) {
              let mut map = hashmap!{};
              let props = header_map.get_own_property_names(&mut cx).unwrap();
              for prop in props.to_vec(&mut cx).unwrap() {
                let prop_name = prop.downcast::<JsString, TaskContext>(&mut cx).unwrap().value(&mut cx);
                let prop_val = header_map.get(&mut cx, prop_name.as_str()).unwrap();
                if let Ok(array) = prop_val.downcast::<JsArray, TaskContext>(&mut cx) {
                  let vec = array.to_vec(&mut cx).unwrap();
                  map.insert(prop_name, vec.iter().map(|item| {
                    item.downcast::<JsString, TaskContext>(&mut cx).unwrap().value(&mut cx)
                  }).collect());
                } else {
                  map.insert(prop_name, vec![prop_val.downcast::<JsString, TaskContext>(&mut cx).unwrap().value(&mut cx)]);
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
      };

      Ok(())
    });

    receiver.recv_timeout(Duration::from_millis(1000)).unwrap_or(request.clone())
  }
}

struct ProviderStateCallback {
  callback_handlers: HashMap<String, Arc<Root<JsFunction>>>,
  queue: Arc<EventQueue>
}

#[async_trait]
impl ProviderStateExecutor for ProviderStateCallback {
  async fn call(self: Arc<Self>, interaction_id: Option<String>, provider_state: &ProviderState, setup: bool, _client: Option<&reqwest::Client>) -> Result<HashMap<String, serde_json::Value>, ProviderStateError> {
    let inner = self.clone();
    match inner.callback_handlers.get(provider_state.name.as_str()) {
      Some(callback) => {
        let (sender_in, receiver_in) = mpsc::channel();
        let (sender, receiver) = mpsc::channel();
        let state = provider_state.clone();
        let iid = interaction_id.clone();
        let queue = self.queue.clone();
        sender_in.send(callback.clone()).unwrap();
        queue.send(move |mut cx| {
          let callback = receiver_in.recv().unwrap();
          let args = if !state.params.is_empty() {
            let js_parameter = JsObject::new(&mut cx);
            for (ref parameter, ref value) in state.params {
              serde_value_to_js_object_attr(&mut cx, &js_parameter, parameter, value).unwrap();
            };
            vec![cx.boolean(setup).upcast::<JsValue>(), js_parameter.upcast::<JsValue>()]
          } else {
            vec![cx.boolean(setup).upcast::<JsValue>()]
          };
          let callback = callback.as_ref().clone(&mut cx).into_inner(&mut cx);
          let this = cx.undefined();
          let callback_result = callback.call(&mut cx, this, args);
          match callback_result {
            Ok(val) => {
              if let Ok(vals) = val.downcast::<JsObject, TaskContext>(&mut cx) {
                let js_props = vals.get_own_property_names(&mut cx).unwrap();
                let props: HashMap<String, Value> = js_props.to_vec(&mut cx).unwrap().iter().map(|prop| {
                  let prop_name = prop.downcast::<JsString, TaskContext>(&mut cx).unwrap().value(&mut cx);
                  let prop_val = vals.get(&mut cx, prop_name.as_str()).unwrap();
                  (prop_name, js_value_to_serde_value(&prop_val, &mut cx))
                }).collect();
                debug!("Provider state callback result = {:?}", props);
                sender.send(Ok(props)).unwrap();
              } else {
                debug!("Provider state callback did not return a map of values. Ignoring.");
                sender.send(Ok(hashmap!{})).unwrap();
              }
            },
            Err(err) => {
              error!("Provider state callback for '{}' failed: {}", state.name, err);
              let error = ProviderStateError { description: format!("Provider state callback for '{}' failed: {}", state.name, err), interaction_id: iid };
              sender.send(Result::<HashMap<String, serde_json::Value>, ProviderStateError>::Err(error)).unwrap();
            }
          };

          Ok(())
        });
        match receiver.recv_timeout(Duration::from_millis(1000)) {
          Ok(result) => {
            debug!("Received {:?} from callback", result);
            result
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
  pub state_handlers: HashMap<String, Arc<Root<JsFunction>>>,
  queue: Arc<EventQueue>
}

impl Task for BackgroundTask {
  type Output = bool;
  type Error = String;
  type JsEvent = JsBoolean;

  fn perform(&self) -> Result<Self::Output, Self::Error> {
    debug!("Background verification task started");
    panic::catch_unwind(|| {
      match tokio::runtime::Builder::new_current_thread().enable_all().build() {
        Ok(runtime) => runtime.block_on(async {
          let provider_state_executor = &Arc::new(ProviderStateCallback {
            callback_handlers: self.state_handlers.clone(),
            queue: self.queue.clone()
          });
          pact_verifier::verify_provider_async(
            self.provider_info.clone(),
            self.pacts.clone(),
            self.filter_info.clone(),
            self.consumers_filter.clone(),
            self.options.clone(),
            provider_state_executor
          ).await
        }),
        Err(err) => {
          error!("Verify process failed to start the tokio runtime: {}", err);
          false
        }
      }
    }).map_err(|err| {
      if let Some(err) = err.downcast_ref::<&str>() {
        error!("Verify process failed with a panic: {}", err);
        format!("Verify process failed with a panic: {}", err)
      } else if let Some(err) = err.downcast_ref::<String>() {
        error!("Verify process failed with a panic: {}", err);
        format!("Verify process failed with a panic: {}", err)
      } else {
        error!("Verify process failed with a panic");
        format!("Verify process failed with a panic")
      }
    })
  }

  fn complete(self, mut cx: TaskContext, result: Result<Self::Output, Self::Error>) -> JsResult<Self::JsEvent> {
    debug!("Background verification task complete: {:?}", result);
    match result {
      Ok(res) => Ok(cx.boolean(res)), // TODO: send a data structure back so we can do things with it (e.g. sub tests)
      Err(err) => cx.throw_error(err)
    }
  }
}

fn consumer_tags_to_selectors(tags: Vec<String>) -> Vec<pact_verifier::ConsumerVersionSelector> {
  tags.iter().map(|t| {
    pact_verifier::ConsumerVersionSelector {
      consumer: None,
      fallback_tag: None,
      tag: t.to_string(),
      latest: Some(true),
    }
  }).collect()
}

pub fn verify_provider(mut cx: FunctionContext) -> JsResult<JsUndefined> {
  let config = cx.argument::<JsObject>(0)?;
  let callback = cx.argument::<JsFunction>(1)?;

  let provider = config.get(&mut cx, "provider").unwrap().downcast::<JsString, FunctionContext>(&mut cx).unwrap().value(&mut cx);

  let mut pacts: Vec<PactSource> = vec![];
  match config.get(&mut cx, "pactUrls") {
    Ok(urls) => match urls.downcast::<JsArray, FunctionContext>(&mut cx) {
      Ok(urls) => {
        if let Ok(urls) = urls.to_vec(&mut cx) {
          for url in urls {
            match url.downcast::<JsString, FunctionContext>(&mut cx) {
              Ok(url) => pacts.push(PactSource::File(url.value(&mut cx))),
              _ => println!("    {}", Yellow.paint ("WARN: pactUrls does not contain a valid list of URL strings"))
            }
          }
        }
      },
      _ => if !urls.is_a::<JsUndefined, FunctionContext>(&mut cx) && !urls.is_a::<JsNull, FunctionContext>(&mut cx) {
        println!("    {}", Yellow.paint ("WARN: pactUrls is not a list of URLs, ignoring"));
      }
    },
    _ => ()
  };

  let provider_tags = match get_string_array(&mut cx, &config, "providerVersionTags") {
    Ok(tags) => tags,
    Err(e) => return cx.throw_error(e)
  };


  match config.get(&mut cx, "pactBrokerUrl") {
    Ok(url) => match url.downcast::<JsString, FunctionContext>(&mut cx) {
      Ok(url) => {
        let pending = get_bool_value(&mut cx, &config, "enablePending");
        let wip = get_string_value(&mut cx, &config, "includeWipPactsSince");
        let consumer_version_tags = match get_string_array(&mut cx, &config, "consumerVersionTags") {
          Ok(tags) => tags,
          Err(e) => return cx.throw_error(e)
        };
        let selectors = consumer_tags_to_selectors(consumer_version_tags);

        if let Some(username) = get_string_value(&mut cx, &config, "pactBrokerUsername") {
          let password = get_string_value(&mut cx, &config, "pactBrokerPassword");
          pacts.push(PactSource::BrokerWithDynamicConfiguration {
            provider_name: provider.clone(),
            broker_url: url.value(&mut cx),
            enable_pending: pending,
            include_wip_pacts_since: wip,
            provider_tags: provider_tags.clone(),
            selectors,
            auth: Some(HttpAuth::User(username, password)), links: vec![]
          })
        } else if let Some(token) = get_string_value(&mut cx, &config, "pactBrokerToken") {
          pacts.push(PactSource::BrokerWithDynamicConfiguration {
            provider_name: provider.clone(),
            broker_url: url.value(&mut cx),
            enable_pending: pending,
            include_wip_pacts_since: wip,
            provider_tags: provider_tags.clone(),
            selectors,
            auth: Some(HttpAuth::Token(token)),
            links: vec![]
          })
        } else {
          pacts.push(PactSource::BrokerWithDynamicConfiguration {
            provider_name: provider.clone(),
            broker_url: url.value(&mut cx),
            enable_pending: pending,
            include_wip_pacts_since: wip,
            provider_tags: provider_tags.clone(),
            selectors,
            auth: None,
            links: vec![]
          })
        }
      },
      Err(_) => {
        if !url.is_a::<JsUndefined, FunctionContext>(&mut cx) {
          println!("    {}", Red.paint("ERROR: pactBrokerUrl must be a string value"));
          cx.throw_error("pactBrokerUrl must be a string value")?;
        }
      }
    },
    _ => ()
  };

  debug!("pacts = {:?}", pacts);
  if pacts.is_empty() {
    println!("    {}", Red.paint("ERROR: No pacts were found to verify!"));
    cx.throw_error("No pacts were found to verify!")?;
  }

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
        error!("Failed to parse pactBrokerUrl: {}", err);
        println!("    {}", Red.paint("ERROR: pactBrokerUrl is not a valid URL"));
      }
    },
    None => ()
  };

  debug!("provider_info = {:?}", provider_info);

  let request_filter = match config.get(&mut cx, "requestFilter") {
    Ok(request_filter) => match request_filter.downcast::<JsFunction, FunctionContext>(&mut cx) {
      Ok(val) => {
        Some(Arc::new(RequestFilterCallback {
          callback_handler: Arc::new(val.root(&mut cx)),
          queue: Arc::new(cx.queue())
        }))
      },
      Err(_) => None
    },
    _ => None
  };

  debug!("request_filter done");

  let mut callbacks = hashmap![];
  match config.get(&mut cx, "stateHandlers") {
    Ok(state_handlers) => match state_handlers.downcast::<JsObject, FunctionContext>(&mut cx) {
      Ok(state_handlers) => {
        let props = state_handlers.get_own_property_names(&mut cx).unwrap();
        for prop in props.to_vec(&mut cx).unwrap() {
          let prop_name = prop.downcast::<JsString, FunctionContext>(&mut cx).unwrap().value(&mut cx);
          let prop_val = state_handlers.get(&mut cx, prop_name.as_str()).unwrap();
          if let Ok(callback) = prop_val.downcast::<JsFunction, FunctionContext>(&mut cx) {
            callbacks.insert(prop_name, Arc::new(callback.root(&mut cx)));
          }
        };
      },
      Err(_) => ()
    },
    _ => ()
  };

  let publish = match config.get(&mut cx, "publishVerificationResult") {
    Ok(publish) => match publish.downcast::<JsBoolean, FunctionContext>(&mut cx) {
      Ok(publish) => publish.value(&mut cx),
      Err(_) => {
        warn!("publishVerificationResult must be a boolean value. Ignoring it");
        false
      }
    },
    _ => false
  };

  let provider_version = match config.get(&mut cx, "providerVersion") {
    Ok(provider_version) => match provider_version.downcast::<JsString, FunctionContext>(&mut cx) {
      Ok(provider_version) => Some(provider_version.value(&mut cx).to_string()),
      Err(_) => if !provider_version.is_a::<JsUndefined, FunctionContext>(&mut cx) {
        println!("    {}", Red.paint("ERROR: providerVersion must be a string value"));
        return cx.throw_error("providerVersion must be a string value")
      } else {
        None
      }
    },
    _ => None
  };

  if publish && provider_version.is_none() {
    println!("    {}", Red.paint("ERROR: providerVersion must be provided if publishing verification results in enabled (publishVerificationResult == true)"));
    return cx.throw_error("providerVersion must be provided if publishing verification results in enabled (publishVerificationResult == true)")?
  }

  let disable_ssl_verification = match config.get(&mut cx, "disableSSLVerification") {
    Ok(disable) => match disable.downcast::<JsBoolean, FunctionContext>(&mut cx) {
      Ok(disable) => disable.value(&mut cx),
      Err(_) => {
        if !disable.is_a::<JsUndefined, FunctionContext>(&mut cx) {
          warn!("disableSSLVerification must be a boolean value. Ignoring it");
        }
        false
      }
    },
    _ => false
  };

  let filter_info = FilterInfo::None;
  let consumers_filter: Vec<String> = vec![];
  let options = VerificationOptions {
    publish,
    provider_version,
    build_url: None,
    request_filter,
    provider_tags,
    disable_ssl_verification
  };

  debug!("Starting background task");
  BackgroundTask {
    provider_info,
    pacts,
    filter_info,
    consumers_filter,
    options,
    state_handlers: callbacks,
    queue: Arc::new(cx.queue())
  }.schedule(callback);

  debug!("Done");
  Ok(cx.undefined())
}
