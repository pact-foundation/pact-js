//! XML handling
use serde_json::Value::Number;
use sxd_document::dom::{Document, Element, ChildOfElement, Text};
use serde_json::Value;
use serde_json::map::Map;
use sxd_document::Package;
use sxd_document::writer::format_document;
use pact_matching::models::matchingrules::{MatchingRule, Category, RuleLogic};
use pact_matching::models::generators::{Generators, GeneratorCategory, Generator};
use pact_matching::models::json_utils::json_to_string;
use log::*;
use std::collections::HashMap;
use either::Either;

pub fn generate_xml_body(attributes: &Map<String, Value>, matching_rules: &mut Category, generators: &mut Generators) -> Result<Vec<u8>, String> {
  let package = Package::new();
  let doc = package.as_document();

  trace!("generate_xml_body: attributes = {:?}", attributes);
  match attributes.get("root") {
    Some(val) => match val {
      Value::Object(obj) => {
        match create_element_from_json(doc, None, obj, matching_rules, generators, &vec!["$"], false, &mut hashmap!{}) {
          Either::Left(element) => doc.root().append_child(element),
          Either::Right(_) => warn!("Can't append text node to the root")
        }
      },
      _ => {
        warn!("Root XML element is not an object: {}", val);
      }
    },
    None => {
      warn!("No Root XML element");
    }
  }

  debug!("Done processing XML body");
  let mut output = vec![];
  match format_document(&doc, &mut output) {
    Ok(_) => Ok(output),
    Err(err) => Err(format!("Unable to generate a valid XML document: {}", err) )
  }
}

fn create_element_from_json<'a>(
  doc: Document<'a>, 
  parent: Option<Element<'a>>, 
  object: &Map<String, Value>, 
  matching_rules: &mut Category, 
  generators: &mut Generators, 
  path: &Vec<&str>, 
  type_matcher: bool,
  namespaces: &mut HashMap<String, String>
) -> Either<Element<'a>, Text<'a>> {
  trace!("create_element_from_json {:?}: object = {:?}", path, object);
  let mut element = None;
  let mut text = None;
  if object.contains_key("pact:matcher:type") {
    if let Some(rule) = MatchingRule::from_integration_json(object) {
      matching_rules.add_rule(path.join("."), rule, &RuleLogic::And);
    }
    if let Some(gen) = object.get("pact:generator:type") {
      match Generator::from_map(&json_to_string(gen), object) {
        Some(generator) => generators.add_generator_with_subcategory(&GeneratorCategory::BODY, path.join("."), generator),
        _ => ()
      };
    }

    let mut updated_path = path.clone();
    updated_path.push(".*");
    if let Some(val) = object.get("value") {
      if let Value::Object(attr) = val {
        let name = json_to_string(attr.get("name").unwrap());
        let new_element = doc.create_element(name.as_str());
        if let Some(attributes) = val.get("attributes") {
          match attributes {
            Value::Object(attributes) => {
              let mut updated_path = path.clone();
              updated_path.push(&name);
              add_attributes(&new_element, attributes, matching_rules, generators, &updated_path);
            },
            _ => ()
          }
        };

        if let Some(children) = val.get("children") {
          match children {
            Value::Array(children) => for (index, child) in children.iter().enumerate() {
              match child {
                Value::Object(attributes) => {
                  let mut updated_path = path.clone();
                  let index = index.to_string();
                  updated_path.push(new_element.name().local_part());
                  updated_path.push(&index);
                  create_element_from_json(doc, Some(new_element), attributes, matching_rules, generators, &updated_path, true, namespaces);
                },
                _ => panic!("Intermediate JSON format is invalid, child is not an object: {:?}", child)
              }
            },
            _ => panic!("Intermediate JSON format is invalid, children is not an Array: {:?}", children)
          }
        };

        element = Some(new_element)
      } else {
        panic!("Intermediate JSON format is invalid, corresponding value for the given matcher was not an object: {:?}", object)
      }
    } else {
      panic!("Intermediate JSON format is invalid, no corresponding value for the given matcher: {:?}", object)
    }
  } else if let Some(content) = object.get("content") {
    text = Some(doc.create_text(json_to_string(content).as_str()));
    if let Some(matcher) = object.get("matcher") {
      let mut text_path = path.clone();
      text_path.pop();
      text_path.push("#text");
      if let Value::Object(matcher) = matcher {
        if let Some(rule) = MatchingRule::from_integration_json(matcher) {
          matching_rules.add_rule(&text_path.join("."), rule, &RuleLogic::And);
        }
      }
      if let Some(gen) = object.get("pact:generator:type") {
        if let Value::Object(matcher) = matcher {
          match Generator::from_map(&json_to_string(gen), matcher) {
            Some(generator) => generators.add_generator_with_subcategory(&GeneratorCategory::BODY, &text_path.join("."), generator),
            _ => ()
          };
        }
      }
    }
  } else if let Some(name) = object.get("name") {
    let name = json_to_string(name);
    let new_element = doc.create_element(name.as_str());
    if let Some(attributes) = object.get("attributes") {
      match attributes {
        Value::Object(attributes) => {
          let mut updated_path = path.clone();
          updated_path.push(&name);
          add_attributes(&new_element, attributes, matching_rules, generators, &updated_path);
        },
        _ => ()
      }
    };

    if let Some(children) = object.get("children") {
      match children {
        Value::Array(children) => for (index, child) in children.iter().enumerate() {
          match child {
            Value::Object(attributes) => {
              let mut updated_path = path.clone();
              let index = index.to_string();
              updated_path.push(&name);
              updated_path.push(&index);
              create_element_from_json(doc, Some(new_element), attributes, matching_rules, generators, &updated_path, false, namespaces);
            },
            _ => panic!("Intermediate JSON format is invalid, child is not an object: {:?}", child)
          }
        },
        _ => panic!("Intermediate JSON format is invalid, children is not an Array: {:?}", children)
      }
    };
    element = Some(new_element);
  } else {
    panic!("Ignoring invalid object {:?}", object);
  };

  if let Some(parent) = parent {
    let examples = match object.get("examples") {
      Some(val) => match val {
        Number(val) => val.as_u64().unwrap(),
        _ => 1
      }
      None => 1
    };

    if let Some(element) = element {
      for _ in 0..examples {
        parent.append_child(duplicate_element(doc, &element));
      }
    } else if let Some(text) = text {
      parent.append_child(&text);
    }
  }

  if let Some(element) = element {
    Either::Left(element)
  } else if let Some(text) = text {
    Either::Right(text)
  } else {
    panic!("Intermediate JSON was mapped to neither an element or a text node")
  }
}

fn add_attributes(
  element: &Element, 
  attributes: &Map<String, Value>, 
  matching_rules: &mut Category, 
  generators: &mut Generators, 
  path: &Vec<&str>
) {
  trace!("add_attributes: attributes = {:?}", attributes);
  for (k, v) in attributes {
    let path = format!("{}['@{}']", path.join("."), k);

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

    trace!("add_attributes: setting attribute key {}, value {}", k.as_str(), value.as_str());

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
