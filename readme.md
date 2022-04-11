# Typescript Pattern Matching

Pattern matching is a feature built in into many programming languages. Sadly it's not included in JavaScript nor TypeScript.

This library aims to implement a pattern matching system that works well with other aspects of TS.


## Examples

### Simple value based pattern matching
```typescript
const result = match(5)
  .case(1, () => 'one')
  .case(3, () => 'three')
  .case(5, () => 'five')
  .default(x => `The value is ${x}`)
  
result // 'five'
```

### Partial pattern matching on objects
```typescript
const result = match(anObject)
  .case({ loading: true }, () => 'Loading...')
  .case({ data: true }, () => 'Data received')
  .default(() => 'Default state')
```

### Partial pattern matching with Any matchers
```typescript
const result = match(anObject)
  .case({ loading: true }, () => 'Loading...')
  .case({ data: AnyObject }, () => 'Data received')
  .case({ error: AnyObject }, () => 'Error!')
  .default(() => 'Default state')
```

