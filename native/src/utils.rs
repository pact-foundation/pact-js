use serde_json::Value;
use serde_json::map::Map;
use neon::prelude::*;
use log::*;

pub fn serde_value_to_js_object_attr<'a>(cx: &mut TaskContext, obj: &Handle<'a, JsObject>, key: &String, value: &Value) -> Result<bool, neon::result::Throw> {
  match value {
    Value::Null => {
      let null = cx.null();
      obj.set(cx, key.as_str(), null)
    },
    Value::Bool(b) => {
      let js_bool = cx.boolean(*b);
      obj.set(cx, key.as_str(), js_bool)
    },
    Value::Number(n) => {
      let js_num = cx.number(n.as_f64().unwrap_or_default());
      obj.set(cx, key.as_str(), js_num)
    },
    Value::String(s) => {
      let js_str = cx.string(s.as_str());
      obj.set(cx, key.as_str(), js_str)
    },
    Value::Array(values) => {
      let array = JsArray::new(cx, values.len() as u32);

      for (i, val) in values.iter().enumerate() {
        serde_value_to_js_array_value(cx, &array, i as u32, &val)?;
      }

      obj.set(cx, key.as_str(), array)
    },
    Value::Object(attributes) => {
      let obj = JsObject::new(cx);

      for (key, val) in attributes {
        serde_value_to_js_object_attr(cx, &obj, &key, &val)?;
      }

      obj.set(cx, key.as_str(), obj)
    }
  }
}

fn serde_value_to_js_array_value<'a>(cx: &mut TaskContext, array: &Handle<'a, JsArray>, i: u32, value: &Value) -> Result<bool, neon::result::Throw> {
  match value {
    Value::Null => {
      let null = cx.null();
      array.set(cx, i, null)
    },
    Value::Bool(b) => {
      let js_bool = cx.boolean(*b);
      array.set(cx, i, js_bool)
    },
    Value::Number(n) => {
      let js_num = cx.number(n.as_f64().unwrap_or_default());
      array.set(cx, i, js_num)
    },
    Value::String(s) => {
      let js_str = cx.string(s.as_str());
      array.set(cx, i, js_str)
    },
    Value::Array(values) => {
      let array = JsArray::new(cx, values.len() as u32);

      for (i, val) in values.iter().enumerate() {
        serde_value_to_js_array_value(cx, &array, i as u32, &val)?;
      }

      array.set(cx, i, array)
    },
    Value::Object(attributes) => {
      let obj = JsObject::new(cx);

      for (key, val) in attributes {
        serde_value_to_js_object_attr(cx, &obj, &key, &val)?;
      }

      array.set(cx, i, obj)
    }
  }
}

pub(crate) fn js_value_to_serde_value<'a, C: Context<'a>>(value: &Handle<'a, JsValue>, cx: &mut C) -> Value {
  if let Ok(val) = value.downcast::<JsString, C>(cx) {
    Value::String(val.value(cx))
  } else if let Ok(val) = value.downcast::<JsNumber, C>(cx) {
    let num = val.value(cx);
    let s_num = num.to_string();
    if s_num.contains('.') {
      json!(num)
    } else {
      json!(num as i64)
    }
  } else if let Ok(val) = value.downcast::<JsBoolean, C>(cx) {
    Value::Bool(val.value(cx))
  } else if let Ok(val) = value.downcast::<JsArray, C>(cx) {
    Value::Array(val.to_vec(cx).unwrap().iter().map(|v| js_value_to_serde_value(v, cx)).collect())
  } else if let Ok(_) = value.downcast::<JsNull, C>(cx) {
    Value::Null
  } else if let Ok(_) = value.downcast::<JsUndefined, C>(cx) {
    Value::Null
  } else if let Ok(val) = value.downcast::<JsObject, C>(cx) {
    let js_props = val.get_own_property_names(cx).unwrap();
    let props: Map<String, Value> = js_props.to_vec(cx).unwrap().iter().map(|prop| {
      let prop_name = prop.downcast::<JsString, C>(cx).unwrap().value(cx);
      let prop_val = val.get(cx, prop_name.as_str()).unwrap();
      (prop_name, js_value_to_serde_value(&prop_val, cx))
    }).collect();
    Value::Object(props)
  } else {
    error!("Ignoring a value for provider state parameter as it can not be converted to a JSON type");
    Value::Null
  }
}
