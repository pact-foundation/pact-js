# XML Example

This example demonstrates contract testing for XML response bodies using Pact's `XmlBuilder`. The same matcher flexibility available for JSON (`integer()`, `string()`, `eachLike()`) applies to XML elements and attributes.

## What You'll Learn

- Building an XML body contract with `XmlBuilder`
- Using `eachLike()` inside XML to match repeated elements
- Applying `string()` matchers to XML element text content
- Why PactV3 is used here (V3 DSL fits XML body definitions naturally)

## Running the Example

```bash
npm install
npm test
```

## How It Works

**Consumer** fetches the catalogue as XML, parses it with `fast-xml-parser`, and returns plain JavaScript objects. The Pact test uses `new XmlBuilder(...).build()` to define the expected XML structure. `eachLike('book', ...)` means: one or more `<book>` elements, each with the given attributes and child elements.

**Provider** generates XML by string interpolation for simplicity. In a real application it might use an XML serialisation library or a template. The important thing is that the XML structure matches what `XmlBuilder` defined: a `<catalogue>` root, `<book>` elements with an `id` attribute, and `<title>` and `<author>` child elements.

Note: this example uses `PactV3` rather than the V4 `Pact` class. The V3 DSL (`withRequest`/`willRespondWith` as plain objects) is a natural fit for attaching `XmlBuilder` bodies. Both DSLs are fully supported.

## Further Reading

- [XML matching in Pact](https://docs.pact.io/implementation_guides/javascript/docs/matching#xml)
- [XmlBuilder API](https://github.com/pact-foundation/pact-js/blob/master/src/dsl/xmlBuilder.ts)
