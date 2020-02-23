use neon::prelude::*;
use pact_verifier::{ProviderInfo, VerificationOptions, FilterInfo, PactSource};
use pact_matching::models::http_utils::HttpAuth;
use pact_matching::models::Request;
use tokio::prelude::*;
use tokio::task;
use ansi_term::Colour::*;
use url::Url;
use std::sync::Arc;
use std::sync::Mutex;

fn get_string_value(cx: &mut FunctionContext, obj: &JsObject, name: &str) -> Option<String> {
  match obj.get(cx, name) {
    Ok(val) => match val.downcast::<JsString>() {
      Ok(val) => Some(val.value()),
      Err(_) => None
    },
    _ => None
  }
}

struct BackgroundTask {
  pub provider_info: ProviderInfo,
  pub pacts: Vec<PactSource>,
  pub filter_info: FilterInfo,
  pub consumers_filter: Vec<String>,
  pub options: VerificationOptions
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
      if pact_verifier::verify_provider(self.provider_info.clone(), self.pacts.clone(), self.filter_info.clone(), self.consumers_filter.clone(), self.options.clone()).await {
        Ok(true)
      } else {
        Err("Pact verification failed".to_string())
      }
    })
  }

  fn complete(self, mut cx: TaskContext, result: Result<Self::Output, Self::Error>) -> JsResult<Self::JsEvent> {
    match result {
      Ok(_) => Ok(cx.boolean(true)),
      Err(err) => cx.throw_error(err)
    }
  }
}

// impl <'a> RequestExecutor for BackgroundTaskRequestExecutor<'a> {
//   fn schedule_request<R, E>(&mut self, request: impl Future<Item=R, Error=E>) -> Result<R, E> {
//     // self.runtime.block_on(request)
//     // BackgroundTask.schedule(f)
//     todo!()
//   }

//   fn execute_request_filter(&mut self, request: &mut Request) {
//     if let Some(f) = self.request_filter {
//       let object = JsObject::new(&mut self.cx);
//       let args: Vec<Handle<JsObject>> = vec![object];
//       let null = self.cx.null();

//       f.call(&mut self.cx, null, args);
//     }
//   }
// }

pub fn verify_provider(mut cx: FunctionContext) -> JsResult<JsUndefined> {
  let config = cx.argument::<JsObject>(0)?;
  let callback = cx.argument::<JsFunction>(1)?;

  let provider = config.get(&mut cx, "provider").unwrap().downcast::<JsString>().unwrap().value();
  
  let mut pacts: Vec<PactSource> = vec![];
  match config.get(&mut cx, "pactUrls") {
    Ok(urls) => (),
    _ => ()
  };
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
        println!("    {}", Red.paint("ERROR: pactBrokerUrl must be a string value"));
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
    // /// URL to post state change requests to
    // pub state_change_url: Option<String>,
    // /// If teardown state change requests should be made (default is false)
    // pub state_change_teardown: bool,
    // /// If state change request data should be sent in the body (true) or as query parameters (false)
    // pub state_change_body: bool,
    .. ProviderInfo::default()
  };

  match get_string_value(&mut cx, &config, "providerBaseUrl") {
    Some(url) => match Url::parse(&url) {
      Ok(url) => {
        provider_info.protocol = url.scheme().into();
        provider_info.host = url.host_str().unwrap_or("localhost").into();
        provider_info.port = url.port().unwrap_or(8080);
        provider_info.path = url.path().into();
      },
      Err(err) => {
        println!("    {}", Red.paint("ERROR: pactBrokerUrl is not a valid URL"));
      }
    },
    None => ()
  };

  let requestFilter = match config.get(&mut cx, "requestFilter") {
    Ok(requestFilter) => match requestFilter.downcast::<JsFunction>() {
      Ok(val) => Some(val),
      Err(_) => None
    },
    _ => None
  };

  let filter_info = FilterInfo::None;
  let consumers_filter: Vec<String> = vec![];
  let options = VerificationOptions {
    publish: false,
    provider_version: None,
    build_url: None
  };

  BackgroundTask { provider_info, pacts, filter_info, consumers_filter, options }.schedule(callback);
  
  Ok(cx.undefined())
}
