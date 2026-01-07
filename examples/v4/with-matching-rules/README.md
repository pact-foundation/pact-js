# Pact JS V4 Matching Rules Example

This example demonstrates how to use Pact JS V4 with matching rules, using the builder pattern to apply flexible matching criteria for request and response attributes beyond exact equality.

## Overview

Matching rules are a powerful feature in Pact that enable flexible contract testing by allowing you to specify patterns, types, and ranges instead of exact values. This makes your tests more maintainable and resilient to changes while still ensuring the contract is honored.

This example demonstrates real-world scenarios including:

- **Customer Profile Management**: Type matching for customer ID and email updates
- **CRM Contact Validation**: Regex pattern matching for international email and phone formats
- **E-Commerce Product Catalogs**: Response validation for electronics inventory
- **Payment Gateway Integration**: Stripe payment processing with combined request/response rules
- **SaaS User Registration**: Map-based matching rules for platform signups

Each test case uses realistic data from common business domains to show how matching rules solve real contract testing challenges.

## Prerequisites

- Node.js (v20 or higher recommended)
- npm or yarn package manager
- Basic understanding of Pact consumer-driven contract testing

## Installation

```bash
npm install
```

## Running the Tests

```bash
# Run the consumer tests
npm run test:consumer
```

## Test Cases Explained

**File**: [consumer.spec.ts](consumer.spec.ts)

### Test 1: Type Matching for Customer Profile Updates

**Purpose**: Demonstrates using `builder.matchingRules()` on requests to validate customer profile update requests where field types matter more than exact values.

**Key Points**:

- Uses `{ match: 'type' }` matcher to validate field types
- Applied via the request builder's `matchingRules()` method
- Allows different customer IDs and emails as long as the type matches
- Makes tests less brittle when exact values don't matter

**Use Case**: Testing customer management APIs where customer IDs and email addresses vary but the data structure must remain consistent.

**Example Data**:

- Customer IDs: 789456, 892341
- Emails: `sarah.johnson@techcorp.com`, `michael.chen@innovate.io`

```typescript
const requestMatchingRules = {
  body: {
    '$.customerId': { matchers: [{ match: 'type' }] },
    '$.email': { matchers: [{ match: 'type' }] },
  },
};

await pact
  .addInteraction()
  .given('a customer profile exists')
  .uponReceiving('a request to update customer profile with type matching')
  .withRequest('PUT', '/customers/c789456', (builder) => {
    builder
      .headers({ 'Content-Type': 'application/json' })
      .jsonBody({
        customerId: 789456,
        email: 'sarah.johnson@techcorp.com',
      })
      .matchingRules(JSON.stringify(requestMatchingRules));
  })
  .willRespondWith(200, (builder) => {
    builder.jsonBody({
      success: Matchers.boolean(true),
      message: Matchers.like('Customer profile updated successfully'),
    });
  })
  .executeTest(async (mockServer) => {
    // Test implementation
  });
```

**Why This Matters**: In CRM and customer management systems, customer IDs and emails vary constantly. Type matching ensures the contract is validated without hardcoding specific test values.

### Test 2: Regex Pattern Matching for CRM Contact Creation

**Purpose**: Shows how to use regex patterns to validate contact information when creating sales leads in a CRM system.

**Key Points**:

- Uses `{ match: 'regex', regex: 'pattern' }` for email and phone validation
- Validates E.164 international phone number format
- Ensures data quality without requiring exact matches
- Applied to request body via builder pattern

**Use Case**: CRM systems accepting new sales leads with validated contact information.

**Example Data**:

- Emails: `jessica.martinez@acmecorp.com`, `david.kim@globaltech.io`
- Phone numbers: `+14155552671` (US), `+442071838750` (UK)

```typescript
const requestMatchingRules = {
  body: {
    '$.email': {
      matchers: [
        {
          match: 'regex',
          regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        },
      ],
    },
    '$.phone': {
      matchers: [
        {
          match: 'regex',
          regex: '^\\+?[1-9]\\d{1,14}$',
        },
      ],
    },
  },
};

await pact
  .addInteraction()
  .given('CRM system accepts new contacts')
  .uponReceiving('a request to create a sales lead with validated contact info')
  .withRequest('POST', '/contacts', (builder) => {
    builder
      .headers({ 'Content-Type': 'application/json' })
      .jsonBody({
        email: 'jessica.martinez@acmecorp.com',
        phone: '+14155552671',
      })
      .matchingRules(JSON.stringify(requestMatchingRules));
  })
  .willRespondWith(201, (builder) => {
    builder.jsonBody({
      id: Matchers.uuid('a3f2c8b1-9d4e-4c7a-b2e5-f8a9c1d3e5f7'),
      created: Matchers.boolean(true),
    });
  })
  .executeTest(async (mockServer) => {
    // Test implementation
  });
```

**Benefits**:

- Ensures contact data quality across international formats
- Documents expected data formats in the contract
- Catches invalid emails and phone numbers early

### Test 3: Response Matching Rules for Product Catalogs

**Purpose**: Demonstrates using `builder.matchingRules()` on responses to validate flexible product catalog responses.

**Key Points**:

- Applies matching rules to response body fields via response builder
- Validates arrays with wildcard selectors (`products[*].sku`)
- Ensures response structure consistency for e-commerce catalogs
- Combined with Matchers for better type safety

**Use Case**: Testing product catalog APIs where exact values are dynamic (timestamps, product counts, SKUs) but structure must be consistent.

**Example Data**:

- Products: MacBook Pro 16-inch M4, iPhone 16 Pro, Apple Watch Series 10
- SKUs: `LAPTOP-MBP16-2026`, `PHONE-IP16-PRO`, `WATCH-AW10-GPS`

```typescript
const responseMatchingRules = {
  body: {
    '$.timestamp': { matchers: [{ match: 'type' }] },
    '$.count': { matchers: [{ match: 'integer' }] },
    '$.products[*].sku': { matchers: [{ match: 'type' }] },
    '$.products[*].name': { matchers: [{ match: 'type' }] },
  },
};

await pact
  .addInteraction()
  .given('electronics products are in stock')
  .uponReceiving('a request for product catalog with response matching rules')
  .withRequest('GET', '/catalog/electronics', (builder) => {
    builder.headers({ Accept: 'application/json' });
  })
  .willRespondWith(200, (builder) => {
    builder
      .headers({ 'Content-Type': 'application/json' })
      .jsonBody({
        timestamp: 1736250000000,
        count: 3,
        products: [
          { sku: 'LAPTOP-MBP16-2026', name: 'MacBook Pro 16-inch M4' },
          { sku: 'PHONE-IP16-PRO', name: 'iPhone 16 Pro' },
          { sku: 'WATCH-AW10-GPS', name: 'Apple Watch Series 10' },
        ],
      })
      .matchingRules(JSON.stringify(responseMatchingRules));
  })
  .executeTest(async (mockServer) => {
    // Test implementation
  });
```

**Why This Matters**: E-commerce catalog responses contain dynamic timestamps and varying product lists. Response matching rules allow testing the contract structure without requiring exact product matches.

### Test 4: Number Range Validation for E-Commerce Products

**Purpose**: Shows how to validate product pricing and inventory levels with realistic business constraints.

**Key Points**:

- Uses `{ match: 'decimal', min: X, max: Y }` for price validation
- Uses `{ match: 'integer', min: X, max: Y }` for stock level validation
- Ensures values are within acceptable e-commerce bounds
- Combined with Matchers.like() for other fields

**Use Case**: Testing product detail APIs for e-commerce platforms with price and inventory constraints.

**Example Data**:

- Product: Sony WH-1000XM5 Wireless Headphones
- SKU: `HEADPHONE-WH1000XM5`
- Price: $399.99 (within $0.01 - $9,999.99)
- Stock Level: 47 units (within 0 - 1,000)

```typescript
const responseMatchingRules = {
  body: {
    '$.price': {
      matchers: [
        {
          match: 'decimal',
          min: 0.01,
          max: 9999.99,
        },
      ],
    },
    '$.stockLevel': {
      matchers: [
        {
          match: 'integer',
          min: 0,
          max: 1000,
        },
      ],
    },
  },
};

await pact
  .addInteraction()
  .given('wireless headphones are in inventory')
  .uponReceiving('a request for product details with numeric range rules')
  .withRequest('GET', '/products/HEADPHONE-WH1000XM5', (builder) => {
    builder.headers({ Accept: 'application/json' });
  })
  .willRespondWith(200, (builder) => {
    builder
      .jsonBody({
        sku: Matchers.like('HEADPHONE-WH1000XM5'),
        name: Matchers.like('Sony WH-1000XM5 Wireless Headphones'),
        price: 399.99,
        stockLevel: 47,
        available: Matchers.boolean(true),
      })
      .matchingRules(JSON.stringify(responseMatchingRules));
  })
  .executeTest(async (mockServer) => {
    // Test implementation
  });
```

**Real-World Applications**:

- E-commerce: Product prices and inventory levels
- Electronics retail: Stock tracking for consumer electronics
- Pricing validation: Ensures prices are within acceptable ranges
- Inventory management: Validates stock levels before display

### Test 5: Combined Request and Response Matching Rules for Payment Processing

**Purpose**: Demonstrates using matching rules on both request and response builders in a Stripe payment gateway integration.

**Key Points**:

- Both request and response builders can have independent matching rules
- Rules combine regex for order IDs, decimal ranges for amounts, and status enums
- Enables comprehensive payment contract validation
- Shows V4's fluent builder pattern in action

**Use Case**: Payment gateway integrations where both request format and response structure need strict validation.

**Example Data**:

- Order IDs: `ORD-458923`, `ORD-892347`
- Amounts: $1,249.99, $2,799.50
- Transaction ID: `TXN-pi_3QRtKL2eZvKYlo2C0v8fHw7d`
- Statuses: `pending`, `approved`, `declined`
- API Token: `dummy_sk_test_4eC39HqLyjWDarjtT1zdp7dc`

```typescript
const requestMatchingRules = {
  body: {
    '$.orderId': {
      matchers: [{ match: 'regex', regex: '^ORD-[0-9]{6}$' }],
    },
    '$.amount': {
      matchers: [{ match: 'decimal', min: 0.01 }],
    },
  },
};

const responseMatchingRules = {
  body: {
    '$.transactionId': { matchers: [{ match: 'type' }] },
    '$.processedAt': {
      matchers: [
        {
          match: 'regex',
          regex: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}',
        },
      ],
    },
    '$.status': {
      matchers: [
        {
          match: 'regex',
          regex: '^(pending|approved|declined)$',
        },
      ],
    },
  },
};

await pact
  .addInteraction()
  .given('Stripe payment gateway is operational')
  .uponReceiving('a credit card payment request with combined matching rules')
  .withRequest('POST', '/payments', (builder) => {
    builder
      .headers({
        'Content-Type': 'application/json',
        Authorization: 'Bearer dummy_sk_test_4eC39HqLyjWDarjtT1zdp7dc',
      })
      .jsonBody({
        orderId: 'ORD-458923',
        amount: 1249.99,
      })
      .matchingRules(JSON.stringify(requestMatchingRules));
  })
  .willRespondWith(200, (builder) => {
    builder
      .jsonBody({
        transactionId: 'TXN-pi_3QRtKL2eZvKYlo2C0v8fHw7d',
        processedAt: '2026-01-07T14:32:18Z',
        status: 'approved',
        message: Matchers.like('Payment authorized successfully'),
      })
      .matchingRules(JSON.stringify(responseMatchingRules));
  })
  .executeTest(async (mockServer) => {
    // Test implementation
  });
```

**Benefits**:

- Complete payment contract coverage
- Flexible yet strict financial validation
- Self-documenting payment API requirements

### Test 6: Using Map Objects for SaaS Platform Registration

**Purpose**: Shows that matching rules can be provided as Map objects instead of JSON strings for better type safety in SaaS user registration flows.

**Key Points**:

- Create rules as `Map<string, unknown>` objects
- Framework automatically converts Maps to the required format
- Both approaches (Map and JSON string) are supported
- More idiomatic TypeScript code

**Advantages of Using Maps**:

- Type safety in TypeScript
- Easier to construct rules programmatically
- No need to manually stringify objects
- Better IDE support and autocomplete

**Use Case**: SaaS platform user registration where usernames must follow specific patterns and IDs are generated server-side.

**Example Data**:

- Usernames: `emily_rodriguez`, `alex_thompson`
- Emails: `emily.rodriguez@startup.ventures`, `alex.thompson@devops.cloud`
- User IDs: 987654 (auto-generated)
- Timestamps: 1736258400000 (Unix epoch)

```typescript
const requestMatchingRules = new Map<string, unknown>();
requestMatchingRules.set('body', {
  '$.username': {
    matchers: [
      {
        match: 'regex',
        regex: '^[a-zA-Z0-9_]{3,20}$',
      },
    ],
  },
  '$.email': {
    matchers: [{ match: 'type' }],
  },
});

const responseMatchingRules = new Map<string, unknown>();
responseMatchingRules.set('body', {
  '$.userId': { matchers: [{ match: 'type' }] },
  '$.createdAt': { matchers: [{ match: 'type' }] },
});

await pact
  .addInteraction()
  .given('SaaS platform user registration is enabled')
  .uponReceiving('a new account registration with Map-based matching rules')
  .withRequest('POST', '/api/v1/register', (builder) => {
    builder
      .headers({ 'Content-Type': 'application/json' })
      .jsonBody({
        username: 'emily_rodriguez',
        email: 'emily.rodriguez@startup.ventures',
      })
      .matchingRules(requestMatchingRules);
  })
  .willRespondWith(201, (builder) => {
    builder
      .jsonBody({
        userId: 987654,
        username: Matchers.like('emily_rodriguez'),
        createdAt: 1736258400000,
      })
      .matchingRules(responseMatchingRules);
  })
  .executeTest(async (mockServer) => {
    // Test implementation
  });
```

**When to Use Each Approach**:

- **Map objects**: Building rules dynamically, TypeScript projects, better IDE support
- **JSON strings**: Simple static rules, loading from configuration files, backwards compatibility

## V4 Builder Pattern

Pact V4 uses a fluent builder pattern for constructing interactions:

### Request Builder Methods

```typescript
.withRequest(method, path, (builder) => {
  builder
    .query(queryParams)              // Query parameters
    .headers(headers)                // HTTP headers
    .jsonBody(body)                  // JSON request body
    .matchingRules(rules)            // Matching rules (Map or JSON string)
    .binaryFile(contentType, file)   // Binary file upload
    .multipartBody(...)              // Multipart form data
})
```

### Response Builder Methods

```typescript
.willRespondWith(status, (builder) => {
  builder
    .headers(headers)                // Response headers
    .jsonBody(body)                  // JSON response body
    .matchingRules(rules)            // Matching rules (Map or JSON string)
    .binaryFile(contentType, file)   // Binary file response
})
```

## Matching Rules Specification

Matching rules follow the Pact specification format with JSON Path selectors:

### Common Matchers

- **Type matching**: `{ match: 'type' }` - Matches any value of the same type
- **Regex matching**: `{ match: 'regex', regex: 'pattern' }` - Validates format
- **Integer**: `{ match: 'integer', min: X, max: Y }` - Integer within range
- **Decimal**: `{ match: 'decimal', min: X, max: Y }` - Decimal within range
- **Equality**: `{ match: 'equality' }` - Exact value match (default)

### JSON Path Selectors

- `$.fieldName` - Selects a specific field
- `$.array[*].field` - Selects field in all array elements
- `$.nested.field` - Selects nested fields

## Combining with Pact Matchers

V4 matching rules work seamlessly with the `Matchers` module for response bodies:

```typescript
import { Matchers } from '@pact-foundation/pact';

builder.jsonBody({
  id: Matchers.uuid(),                    // UUID matcher
  name: Matchers.like('example'),         // Type matcher
  active: Matchers.boolean(true),         // Boolean matcher
  tags: Matchers.eachLike('tag'),         // Array matcher
  metadata: Matchers.somethingLike({...}) // Object matcher
});
```

**Key Difference**: Matchers are used for example values in the response body, while matching rules provide flexible validation criteria for both requests and responses.

## Additional Resources

- [Pact Specification V4](https://github.com/pact-foundation/pact-specification/tree/version-4)
- [Pact JS Documentation](https://docs.pact.io/implementation_guides/javascript)
- [JSON Path Syntax](https://goessner.net/articles/JsonPath/)
