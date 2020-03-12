use serde_json::Value;
use neon::prelude::*;
use neon::handle::Managed;

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
