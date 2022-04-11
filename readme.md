# Typescript Pattern Matching

Pattern matching is a feature built in into many programming languages. Sadly it's not included in JavaScript nor TypeScript. It's like a `switch` statement on steroids, that lets you write a more declarative code.

This library aims to implement a pattern matching system that works well with other aspects of TS. It uses Builder Pattern to get all the cases and evaluate them.
The default case is mandatory.

## Installation

Install it using npm (or yarn).

```bash
npm install @safe-ts/pattern
```

It can be imported then in your *.ts files.

```typescript

import match, { AnyNumber, AnyString } from '@safe-ts/pattern'

// (...)

match(x)
  .case(AnyNumber, () => '...')
  .case(AnyString, () => '...')
  .default(() => '...')

```
## Comparison with other languages
### Scala
```scala
import scala.util.Random

val x: Int = Random.nextInt(10)

x match {
  case 0 => "zero"
  case 1 => "one"
  case 2 => "two"
  case _ => "other"
}
```
### Elm
```elm
patternMatching : Int -> String
patternMatching x =
  case x of
    0 -> "zero"
    1 -> "one"
    2 -> "two"
    _ -> "other"
```
### Typescript with this library
```typescript
const x = Math.floor(Math.random() * 10);

match(x)
  .case(0, () => 'zero')
  .case(1, () => 'one')
  .case(2, () => 'two')
  .default(() => 'other')
```

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

### Typesafe JSON parsing

When parsing JSON strings we do not know if the result will be correctly typed.

```typescript
interface User {
  name: string
  age: number
}

const jsonString = '{ "definetly": "not an user" }'
const user = JSON.parse(jsonString) as User

user.name // runtime boom
```

```typescript
interface User {
  name: string
  age: number
}

const jsonString = '{ "definetly": "not an user" }'

const user = match<User | null>(JSON.parse(jsonString))
  .case({ name: AnyString, age: AnyNumber }, (user: unknown) => user as User)
  .default(() => null)

user && user.name // user will be null if the structure is not right, otherwise it's always guaranteed to be of User type.
```
