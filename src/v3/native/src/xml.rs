//! XML handling
use sxd_document::dom::Document;
use sxd_document::dom::Element;
use serde_json::Value;
use serde_json::map::Map;
use sxd_document::Package;
use sxd_document::writer::format_document;
use pact_matching::models::matchingrules::{MatchingRules, MatchingRule, Category, RuleLogic};
use pact_matching::models::generators::{Generators, GeneratorCategory, Generator};
use pact_matching::models::json_utils::json_to_string;

pub fn generate_xml_body(attributes: &Map<String, Value>, matching_rules: &mut Category, generators: &mut Generators) -> Result<Vec<u8>, String> {
  let package = Package::new();
  let doc = package.as_document();

  debug!("attributes = {:?}", attributes);
  match attributes.get("root") {
    Some(val) => match dbg!(val) {
      Value::Object(obj) => {
        doc.root().append_child(create_element_from_json(doc, None, obj, matching_rules, generators, &"$".to_string(), false));
      },
      _ => {
        warn!("Root XML element is not an object: {}", val);
      }
    },
    None => {
      warn!("No Root XML element");
    }
  }

  let mut output = vec![];
  match format_document(&doc, &mut output) {
    Ok(_) => Ok(output),
    Err(err) => Err(format!("Unable to generate a valid XML document: {}", err) )
  }
}

fn create_element_from_json<'a>(doc: Document<'a>, parent: Option<Element<'a>>, object: &Map<String, Value>, matching_rules: &mut Category, generators: &mut Generators, path: &String, type_matcher: bool) -> Element<'a> {
  let element = if object.contains_key("pact:matcher:type") {
    if let Some(rule) = MatchingRule::from_integration_json(object) {
      matching_rules.add_rule(path, rule, &RuleLogic::And);
    }
    if let Some(gen) = object.get("pact:generator:type") {
      match Generator::from_map(&json_to_string(gen), object) {
        Some(generator) => generators.add_generator_with_subcategory(&GeneratorCategory::BODY, path, generator),
        _ => ()
      };
    }

    if let Some(val) = object.get("value") {
      if let Value::Object(attr) = val {
        let element = doc.create_element(json_to_string(attr.get("name").unwrap()).as_str());
        if let Some(attributes) = object.get("attributes") {
          match attributes {
            Value::Object(attributes) => add_attributes(&element, attributes),
            _ => ()
          }
        };

        if let Some(children) = object.get("children") {
          match children {
            Value::Array(children) => for child in children {
              match child {
                Value::Object(attributes) => {
                  create_element_from_json(doc, Some(element), attributes, matching_rules, generators, &(path.to_owned() + ".*."), true);
                },
                _ => panic!("Intermediate JSON format is invalid, child is not an object: {:?}", child)
              }
            },
            _ => panic!("Intermediate JSON format is invalid, children is not an Array: {:?}", children)
          }
        };

        element
      } else {
        panic!("Intermediate JSON format is invalid, corresponding value for the given matcher was not an object: {:?}", object)
      }
    } else {
      panic!("Intermediate JSON format is invalid, no corresponding value for the given matcher: {:?}", object)
    }
  } else {
    let name = json_to_string(object.get("name").unwrap());
    let element = doc.create_element(name.as_str());
    if let Some(attributes) = object.get("attributes") {
      match attributes {
        Value::Object(attributes) => add_attributes(&element, attributes),
        _ => ()
      }
    };

    if let Some(children) = object.get("children") {
      match children {
        Value::Array(children) => for child in children {
          match child {
            Value::Object(attributes) => {
              create_element_from_json(doc, Some(element), attributes, matching_rules, generators,  &(path.to_owned() + "." + name.as_str()), false);
            },
            _ => panic!("Intermediate JSON format is invalid, child is not an object: {:?}", child)
          }
        },
        _ => panic!("Intermediate JSON format is invalid, children is not an Array: {:?}", children)
      }
    };
    element
  };

  if let Some(parent) = parent {
    parent.append_child(element);
  };

  element
}

// TODO: add matchers to this
fn add_attributes(element: &Element, attributes: &Map<String, Value>) {
  for (k, v) in attributes {
    element.set_attribute_value(k.as_str(), json_to_string(&v).as_str());
  }
}

/*
fn process_object(obj: &Map<String, Value>, matching_rules: &mut Category, generators: &mut Generators, path: &String, type_matcher: bool) -> Value {
  if obj.contains_key("pact:matcher:type") {
    if let Some(rule) = MatchingRule::from_integration_json(obj) {
      matching_rules.add_rule(path, rule, &RuleLogic::And);
    }
    if let Some(gen) = obj.get("pact:generator:type") {
      match Generator::from_map(&json_to_string(gen), obj) {
        Some(generator) => generators.add_generator_with_subcategory(&GeneratorCategory::BODY, path, generator),
        _ => ()
      };
    }
    match obj.get("value") {
      Some(val) => match val {
        Value::Object(ref map) => process_object(map, matching_rules, generators, path, true),
        Value::Array(array) => process_array(array, matching_rules, generators, path, true),
        _ => val.clone()
      },
      None => Value::Null
    }
  } else {
    Value::Object(obj.iter().map(|(key, val)| {
      let updated_path = if type_matcher {
        path.to_owned() + ".*"
      } else {
        path.to_owned() + "." + key
      };
      (key.clone(), match val {
        Value::Object(ref map) => process_object(map, matching_rules, generators, &updated_path, false),
        Value::Array(ref array) => process_array(array, matching_rules, generators, &updated_path, false),
        _ => val.clone()
      })
    }).collect())
  }
}
*/