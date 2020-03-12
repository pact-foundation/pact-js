//! XML handling
use serde_json::Value::Number;
use sxd_document::dom::Document;
use sxd_document::dom::Element;
use sxd_document::dom::ChildOfElement;
use serde_json::Value;
use serde_json::map::Map;
use sxd_document::Package;
use sxd_document::writer::format_document;
use pact_matching::models::matchingrules::{MatchingRule, Category, RuleLogic};
use pact_matching::models::generators::{Generators, GeneratorCategory, Generator};
use pact_matching::models::json_utils::json_to_string;
use log::*;

pub fn generate_xml_body(attributes: &Map<String, Value>, matching_rules: &mut Category, generators: &mut Generators) -> Result<Vec<u8>, String> {
  let package = Package::new();
  let doc = package.as_document();

  debug!("attributes = {:?}", attributes);
  match attributes.get("root") {
    Some(val) => match val {
      Value::Object(obj) => {
        let node = create_element_from_json(doc, None, obj, matching_rules, generators, &"$".to_string(), false);
        dbg!(node);
        doc.root().append_child(node);
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
  dbg!(path);
  dbg!(parent);
  dbg!(object);

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

    let updated_path = path.to_owned() + ".*";
    if let Some(val) = object.get("value") {
      if let Value::Object(attr) = val {
        dbg!(val);
        let element = doc.create_element(json_to_string(attr.get("name").unwrap()).as_str());
        if let Some(attributes) = val.get("attributes") {
          match dbg!(attributes) {
            Value::Object(attributes) => add_attributes(&element, attributes, matching_rules, generators, &updated_path),
            _ => ()
          }
        };

        if let Some(children) = val.get("children") {
          match children {
            Value::Array(children) => for child in children {
              match child {
                Value::Object(attributes) => {
                  create_element_from_json(doc, Some(element), attributes, matching_rules, generators, &updated_path, true);
                },
                _ => panic!("Intermediate JSON format is invalid, child is not an object: {:?}", child)
              }
            },
            _ => panic!("Intermediate JSON format is invalid, children is not an Array: {:?}", children)
          }
        };

        dbg!(element)
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
      match dbg!(attributes) {
        Value::Object(attributes) => add_attributes(&element, attributes, matching_rules, generators, path),
        _ => ()
      }
    };

    if let Some(children) = object.get("children") {
      match children {
        Value::Array(children) => for child in children {
          match dbg!(child) {
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
      let examples = match object.get("examples") {
        Some(val) => match val {
          Number(val) => val.as_u64().unwrap(),
          _ => 1
        }
        None => 1
      };

      for _ in 0..examples {
        parent.append_child(duplicate_element(doc, &element));
      }
    }

  element
}

fn add_attributes(element: &Element, attributes: &Map<String, Value>, matching_rules: &mut Category, generators: &mut Generators, path: &String) {
  for (k, v) in attributes {
    let path = format!("{}['@{}']", path, k);

    let value = match v {
      Value::Object(matcher_definition) => if matcher_definition.contains_key("pact:matcher:type") {
        if let Some(rule) = MatchingRule::from_integration_json(matcher_definition) {
          matching_rules.add_rule(&path, rule, &RuleLogic::And);
        }
        if let Some(gen) = matcher_definition.get("pact:generator:type") {
          match Generator::from_map(&json_to_string(gen), matcher_definition) {
            Some(generator) => generators.add_generator_with_subcategory(&GeneratorCategory::BODY, path, generator),
            _ => ()
          };
        }
        json_to_string(matcher_definition.get("value").unwrap())
      } else {
        json_to_string(&v)
      },
      _ => json_to_string(&v)
    };

    debug!("setting attribute key {}, value {}", k.as_str(), value.as_str());

    element.set_attribute_value(k.as_str(), value.as_str());
  }
}

fn duplicate_element<'a>(doc: Document<'a>, el: &Element<'a>) -> Element<'a> {
  let element = doc.create_element(el.name());
  for attr in el.attributes() {
    element.set_attribute_value(attr.name(), attr.value());
  }
  for child in el.children() {
    match child {
      ChildOfElement::Element(el) => element.append_child(duplicate_element(doc, &el)),
      ChildOfElement::Text(txt) => element.append_child(txt),
      _ => ()
    }
  }
  element
}
