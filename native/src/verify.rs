use pact_verifier::callback_executors::HttpRequestProviderStateExecutor;
use std::sync::Arc;
use serde_json::Value;
use neon::prelude::*;
use pact_verifier::{ProviderInfo, VerificationOptions, FilterInfo, PactSource};
use pact_verifier::callback_executors::{RequestFilterExecutor, ProviderStateExecutor, ProviderStateError};
use pact_models::http_utils::HttpAuth;
use pact_models::request::Request;
use ansi_term::Colour::*;
use url::Url;
use std::sync::mpsc;
use std::time::Duration;
use async_trait::async_trait;
use pact_models::provider_states::ProviderState;
use maplit::*;
use std::collections::HashMap;
use crate::utils::{serde_value_to_js_object_attr, js_value_to_serde_value};
use log::*;
use std::panic;
use std::env;

fn get_string_value(cx: &mut FunctionContext, obj: &JsObject, name: &str) -> Option<String> {
  match obj.get(cx, name) {
    Ok(val) => match val.downcast::<JsString>() {
      Ok(val) => Some(val.value()),
      Err(_) => None
    },
    _ => None
  }
}

fn get_bool_value(cx: &mut FunctionContext, obj: &JsObject, name: &str) -> bool {
  match obj.get(cx, name) {
    Ok(val) => match val.downcast::<JsBoolean>() {
      Ok(val) => val.value(),
      Err(_) => false
    },
    _ => false
  }
}

fn get_string_array(
    cx: &mut FunctionContext,
    obj: &JsObject,
    name: &str,
) -> Result<Option<Vec<String>>, String> {
  if let Ok(items) = obj.get(cx, name) {
      match items.downcast::<JsString>() {
          Ok(item) => return Ok(Some(vec![item.value().to_string()])),
          Err(_) => match items.downcast::<JsArray>() {
              Ok(items) => {
                  let mut tags = vec![];
                  if let Ok(items) = items.to_vec(cx) {
                      for tag in items {
                          match tag.downcast::<JsString>() {
                              Ok(val) => tags.push(val.value().to_string()),
                              Err(_) => {
                                  return Err(format!(
                                      "{} must be a string or array of strings",
                                      name
                                  ));
                              }
                          }
                      }
                  };
                  return Ok(Some(tags));
              }
              Err(_) => {
                  if !items.is_a::<JsUndefined>() {
                      return Err(format!("{} must be a string or array of strings", name));
                  }
              }
          },
      }
  };

  Ok(None)
}

fn get_integer_value(cx: &mut FunctionContext, obj: &JsObject, name: &str) -> Option<u64> {
  match obj.get(cx, name) {
    Ok(val) => match val.downcast::<JsNumber>() {
      Ok(val) => Some(val.value() as u64),
      Err(_) => None
    },
    _ => None
  }
}

#[derive(Clone)]
struct ProviderStateCallback<'a> {
  callback_handlers: &'a HashMap<String, EventHandler>,
  timeout: u64
}

#[derive(Clone)]
pub struct NullRequestFilterExecutor {
  // This field is added (and is private) to guarantee that this struct
  // is never instantiated accidentally, and is instead only able to be
  // used for type-level programming.
  _private_field: (),
}

impl RequestFilterExecutor for NullRequestFilterExecutor {
  fn call(self: Arc<Self>, _request: &Request) -> Request {
    unimplemented!("NullRequestFilterExecutor should never be called")
  }
}

struct BackgroundTask {
  pub provider_info: ProviderInfo,
  pub pacts: Vec<PactSource>,
  pub filter_info: FilterInfo,
  pub consumers_filter: Vec<String>,
  pub options: VerificationOptions<NullRequestFilterExecutor>,
  pub state_handlers: HashMap<String, EventHandler>,
  pub state_change_url: Option<String>
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
          let provider_state_executor = Arc::new(HttpRequestProviderStateExecutor {
            state_change_url: self.state_change_url.clone(),
            state_change_body: true,
            state_change_teardown: true,
          });
          pact_verifier::verify_provider_async(self.provider_info.clone(), self.pacts.clone(), self.filter_info.clone(), self.consumers_filter.clone(), self.options.clone(), &provider_state_executor).await
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

fn json_to_selectors(selectors: Vec<String>) -> Vec<pact_verifier::ConsumerVersionSelector> {
  selectors.iter().map(|s| serde_json::from_str(s.as_str()))
  .flatten()
  .collect()
}

fn interaction_filter() -> FilterInfo {
  let mut pact_description_set = true;
  let mut pact_description = "".to_string();
  match env::var("PACT_DESCRIPTION") {
    Ok(val) => pact_description = val,
    Err(_e) => pact_description_set = false,
  };


  let mut pact_provider_state_set = true;
  let mut pact_provider_state = "".to_string();
  match env::var("PACT_PROVIDER_STATE") {
    Ok(val) => pact_provider_state = val,
    Err(_e) => pact_provider_state_set = false,
  };

  let pact_provider_no_state = match env::var("PACT_PROVIDER_NO_STATE") {
    Ok(val) => val.eq("TRUE"),
    Err(_e) => false,
  };


  if pact_description_set && (pact_provider_state_set || pact_provider_no_state) {
    if pact_provider_state_set {
      FilterInfo::DescriptionAndState(pact_description, pact_provider_state)
    } else {
      FilterInfo::DescriptionAndState(pact_description, "".to_string())
    }
  } else if pact_description_set {
    FilterInfo::Description(pact_description)
  } else if pact_provider_state_set {
    FilterInfo::State(pact_provider_state)
  } else if pact_provider_no_state {
    FilterInfo::State("".to_string())
  } else {
    FilterInfo::None
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
      _ => if !urls.is_a::<JsUndefined>() && !urls.is_a::<JsNull>() {
        println!("    {}", Yellow.paint ("WARN: pactUrls is not a list of URLs, ignoring"));
      }
    },
    _ => ()
  };

  let provider_tags = match get_string_array(&mut cx, &config, "providerVersionTags") {
      Ok(tags) => tags.unwrap_or(vec![]),
      Err(e) => {
        eprintln!("    {}", Red.paint(format!("ERROR: {}", e)));
        return cx.throw_error(e);
      }
  };

  match config.get(&mut cx, "pactBrokerUrl") {
    Ok(url) => match url.downcast::<JsString>() {
      Ok(url) => {
        let pending = get_bool_value(&mut cx, &config, "enablePending");
        let wip = get_string_value(&mut cx, &config, "includeWipPactsSince");
        let consumer_version_tags =
          match get_string_array(&mut cx, &config, "consumerVersionTags") {
            Ok(vt) => vt,
            Err(e) => {
              eprintln!("    {}", Red.paint(format!("ERROR: {}", e)));
              return cx.throw_error(e);
            }
          };
        let consumer_version_selectors =
          match get_string_array(&mut cx, &config, "consumerVersionSelectorsString") {
            Ok(vs) => vs,
            Err(e) => {
                eprintln!("    {}", Red.paint(format!("ERROR: {}", e)));
                return cx.throw_error(e);
            }
          };

        let selectors = match (consumer_version_selectors, consumer_version_tags) {
          (Some(vs), _) => json_to_selectors(vs),
          (_, Some(vt)) => consumer_tags_to_selectors(vt),
          _ => vec![]
        };

        if let Some(username) = get_string_value(&mut cx, &config, "pactBrokerUsername") {
          let password = get_string_value(&mut cx, &config, "pactBrokerPassword");
          pacts.push(PactSource::BrokerWithDynamicConfiguration { provider_name: provider.clone(), broker_url: url.value(), enable_pending: pending, include_wip_pacts_since: wip, provider_tags: provider_tags.clone(), selectors: selectors, auth: Some(HttpAuth::User(username, password)), links: vec![] })
        } else if let Some(token) = get_string_value(&mut cx, &config, "pactBrokerToken") {
          pacts.push(PactSource::BrokerWithDynamicConfiguration { provider_name: provider.clone(), broker_url: url.value(), enable_pending: pending, include_wip_pacts_since: wip, provider_tags: provider_tags.clone(), selectors: selectors, auth: Some(HttpAuth::Token(token)), links: vec![] })
        } else {
          pacts.push(PactSource::BrokerWithDynamicConfiguration { provider_name: provider.clone(), broker_url: url.value(), enable_pending: pending, include_wip_pacts_since: wip, provider_tags: provider_tags.clone(), selectors: selectors, auth: None, links: vec![] })
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

  let request_timeout = get_integer_value(&mut cx, &config, "timeout").unwrap_or(5000);

  let callbacks = hashmap![];

  let publish = match config.get(&mut cx, "publishVerificationResult") {
    Ok(publish) => match publish.downcast::<JsBoolean>() {
      Ok(publish) => publish.value(),
      Err(_) => {
        warn!("publishVerificationResult must be a boolean value. Ignoring it");
        false
      }
    },
    _ => false
  };

  let provider_version = match config.get(&mut cx, "providerVersion") {
    Ok(provider_version) => match provider_version.downcast::<JsString>() {
      Ok(provider_version) => Some(provider_version.value().to_string()),
      Err(_) => if !provider_version.is_a::<JsUndefined>() {
        println!("    {}", Red.paint("ERROR: providerVersion must be a string value"));
        return cx.throw_error("providerVersion must be a string value")
      } else {
        None
      }
    },
    _ => None
  };

  if publish && provider_version.is_none() {
    println!("    {}", Red.paint("ERROR: providerVersion must be provided if publishing verification results is enabled (publishVerificationResult == true)"));
    return cx.throw_error("providerVersion must be provided if publishing verification results is enabled (publishVerificationResult == true)")?
  }

  let disable_ssl_verification = match config.get(&mut cx, "disableSSLVerification") {
    Ok(disable) => match disable.downcast::<JsBoolean>() {
      Ok(disable) => disable.value(),
      Err(_) => {
        if !disable.is_a::<JsUndefined>() {
          warn!("disableSSLVerification must be a boolean value. Ignoring it");
        }
        false
      }
    },
    _ => false
  };

  let state_change_url = get_string_value(&mut cx, &config, "providerStatesSetupUrl");

  let filter_info = interaction_filter();

  match filter_info {
    FilterInfo::None => (),
    _ => {
      if publish {
        warn!("\n\nWARNING: you have enabled publishing of verification results and are also filtering interactions - this can lead to invalid results published to your Pact Broker. I hope you know what you're doing!\n\n");
      }
    }
  };

  let consumers_filter: Vec<String> = vec![];
  let options = VerificationOptions {
    publish,
    provider_version,
    build_url: None,
    request_filter: None,
    provider_tags,
    disable_ssl_verification,
    request_timeout,
    .. VerificationOptions::default()
  };

  debug!("Starting background task");
  BackgroundTask { provider_info, pacts, filter_info, consumers_filter, options, state_handlers: callbacks, state_change_url }.schedule(callback);

  debug!("Done");
  Ok(cx.undefined())
}
