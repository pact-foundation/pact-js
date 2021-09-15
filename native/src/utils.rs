use serde_json::Value;
use serde_json::map::Map;
use neon::prelude::*;
use log::*;

pub(crate) fn js_value_to_serde_value<'a, C: Context<'a>>(value: &Handle<'a, JsValue>, cx: &mut C) -> Value {
  if let Ok(val) = value.downcast::<JsString>() {
    Value::String(val.value())
  } else if let Ok(val) = value.downcast::<JsNumber>() {
    let num = val.value();
    let s_num = num.to_string();
    if s_num.contains('.') {
      json!(num)
    } else {
      json!(num as i64)
    }
  } else if let Ok(val) = value.downcast::<JsBoolean>() {
    Value::Bool(val.value())
  } else if let Ok(val) = value.downcast::<JsArray>() {
    Value::Array(val.to_vec(cx).unwrap().iter().map(|v| js_value_to_serde_value(v, cx)).collect())
  } else if let Ok(_) = value.downcast::<JsNull>() {
    Value::Null
  } else if let Ok(_) = value.downcast::<JsUndefined>() {
    Value::Null
  } else if let Ok(val) = value.downcast::<JsObject>() {
    let js_props = val.get_own_property_names(cx).unwrap();
    let props: Map<String, Value> = js_props.to_vec(cx).unwrap().iter().map(|prop| {
      let prop_name = prop.downcast::<JsString>().unwrap().value();
      let prop_val = val.get(cx, prop_name.as_str()).unwrap();
      (prop_name, js_value_to_serde_value(&prop_val, cx))
    }).collect();
    Value::Object(props)
  } else {
    error!("Ignoring a value for provider state parameter as it can not be converted to a JSON type");
    Value::Null
  }
}
