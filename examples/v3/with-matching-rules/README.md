# Pact JS V3 Matching Rules Example

This example demonstrates how to use Pact JS V3 with matching rules, which allow you to define flexible matching criteria for request and response attributes beyond exact equality.

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

**Purpose**: Demonstrates using `withRequestMatchingRules` to validate customer profile update requests where field types matter more than exact values.

**Key Points**:

- Uses `{ match: 'type' }` matcher to validate field types
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

await pact.withRequestMatchingRules(req, JSON.stringify(requestMatchingRules));
```

**Why This Matters**: In CRM and customer management systems, customer IDs and emails vary constantly. Type matching ensures the contract is validated without hardcoding specific test values.

### Test 2: Regex Pattern Matching for CRM Contact Creation

**Purpose**: Shows how to use regex patterns to validate contact information when creating sales leads in a CRM system.

**Key Points**:

- Uses `{ match: 'regex', regex: 'pattern' }` for email and phone validation
- Validates E.164 international phone number format
- Ensures data quality without requiring exact matches

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
```

**Benefits**:

- Ensures contact data quality across international formats
- Documents expected data formats in the contract
- Catches invalid emails and phone numbers early

### Test 3: Response Matching Rules for Product Catalogs

**Purpose**: Demonstrates using `withResponseMatchingRules` to validate flexible product catalog responses.

**Key Points**:

- Applies matching rules to response body fields
- Validates arrays with wildcard selectors (`products[*].sku`)
- Ensures response structure consistency for e-commerce catalogs

**Use Case**: Testing product catalog APIs where exact values are dynamic (timestamps, product counts, SKUs) but structure must be consistent.

**Example Data**:

- Products: MacBook Pro 16-inch M4, iPhone 16 Pro, Apple Watch Series 10
- SKUs: `LAPTOP-MBP16-2026`, `PHONE-IP16-PRO`, `WATCH-AW10-GPS`

### Test 4: Number Range Validation for E-Commerce Products

**Purpose**: Shows how to validate product pricing and inventory levels with realistic business constraints.

**Key Points**:

- Uses `{ match: 'decimal', min: X, max: Y }` for price validation
- Uses `{ match: 'integer', min: X, max: Y }` for stock level validation
- Ensures values are within acceptable e-commerce bounds

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
      matchers: [{ match: 'decimal', min: 0.01, max: 9999.99 }],
    },
    '$.stockLevel': {
      matchers: [{ match: 'integer', min: 0, max: 1000 }],
    },
  },
};
```

**Real-World Applications**:

- E-commerce: Product prices and inventory levels
- Electronics retail: Stock tracking for consumer electronics
- Pricing validation: Ensures prices are within acceptable ranges
- Inventory management: Validates stock levels before display

### Test 5: Combined Request and Response Matching Rulesder IDs, decimal ranges for amounts, and status enums

- Enables comprehensive payment contract validation

**Use Case**: Payment gateway integrations where both request format and response structure need strict validation.

**Example Data**:

- Order IDs: `ORD-458923`, `ORD-892347`
- Amounts: $1,249.99, $2,799.50
- Transaction ID: `TXN-pi_3QRtKL2eZvKYlo2C0v8fHw7d`
- Statuses: `pending`, `approved`, `declined`
- dummy API Token: `dummy_sk_test_4eC39HqLyjWDarjtT1zdp7dc`

```typescript
await pact
  .withRequestMatchingRules(req, JSON.stringify(requestMatchingRules))
  .withResponseMatchingRules(req, JSON.stringify(responseMatchingRules))
  .willRespondWith(response);
```

**Example Scenario**: Stripe payment processing where:

- Request validates order ID format (`ORD-XXXXXX`) and positive amount
- Response validates transactifor SaaS Platform Registration
on ID type, ISO 8601 timestamp, and status enum

**Benefits**:

- Complete payment contract coverage
- Flexible yet strict financial validation
- Self-documenting payment API requirements

### Test 6: Using Map Objects

**Purpose**: Shows that matching rules can be provided as Map objects for better type safety in SaaS user registration flows.

**Advantages of Using Maps**:

- Type safety in TypeScript
- Easier to construct rules programmatically
- No need to manually stringify objects
- More idiomatic JavaScript/TypeScript code

**Use Case**: SaaS platform user registration where usernames must follow specific patterns and IDs are generated server-side.

**Example Data**:

- Usernames: `emily_rodriguez`, `alex_thompson`
- Emails: `emily.rodriguez@startup.ventures`, `alex.thompson@devops.cloud`
- User IDs: 987654 (auto-generated)
- Timestamps: 1736258400000 (Unix epoch)

**Key Points**:

- Create rules as `Map<string, unknown>` objects
- Framework automatically converts Maps to JSON
- Both approaches (Map and JSON string) are supported

```typescript
const requestMatchingRules = new Map<string, unknown>();
requestMatchingRules.set('body', {
  '$.username': {
    matchers: [{ match: 'regex', regex: '^[a-zA-Z0-9_]{3,20}$' }],
  },
});

await pact.withRequestMatchingRules(req, requestMatchingRules);
```

**When to Use Each Approach**:

- **Map objects**: Building rules dynamically, TypeScript projects, better IDE support
- **JSON strings**: Simple static rules, loading from configuration files, backwards compatibility

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

## Best Practices

1. **Use type matching for generated values**: IDs, timestamps, UUIDs
2. **Use regex for format validation**: Emails, phones, dates, custom IDs
3. **Use ranges for bounded numbers**: Prices, quantities, ratings
4. **Combine with Pact matchers**: Use `MatchersV3` for response bodies alongside matching rules
5. **Document your patterns**: Comment regex patterns to explain their purpose
6. **Test edge cases**: Ensure your rules catch invalid data

## Additional Resources

- [Pact Specification V3](https://github.com/pact-foundation/pact-specification/tree/version-3)
- [JSON Path Syntax](https://goessner.net/articles/JsonPath/)
