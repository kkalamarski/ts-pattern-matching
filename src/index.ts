export const Any: unique symbol = Symbol('Any')
export const AnyString: unique symbol = Symbol('AnyString')
export const AnyNumber: unique symbol = Symbol('AnyNumber')
export const AnyBoolean: unique symbol = Symbol('AnyBoolean')
export const AnyObject: unique symbol = Symbol('AnyObject')
export const AnyArray: unique symbol = Symbol('AnyArray')
export const AnyFunction: unique symbol = Symbol('AnyFunction')

const ComposeMatcherSymbol = Symbol('ComposeMatcher')
const StrictMatcherSymbol = Symbol('StrictMatcher')

interface ComposeMatcher {
  _type: typeof ComposeMatcherSymbol
  conditions: CaseValue
}

interface StrictMatcher {
  _type: typeof StrictMatcherSymbol
  value: CaseValue
}

export const strict = (value: CaseValue): StrictMatcher => ({
  _type: StrictMatcherSymbol,
  value
})

export const compose = (...conditions: CaseValue[]): ComposeMatcher => ({
  _type: ComposeMatcherSymbol,
  conditions
})

type CaseValue =
  | any
  | typeof Any
  | typeof AnyString
  | typeof AnyNumber
  | typeof AnyBoolean
  | ComposeMatcher

type CaseFn<T> = (x: CaseValue) => T
type Case<T> = [CaseValue, CaseFn<T>]
type DefaultFn<T> = () => T

const compare = (testCase: CaseValue, value: any): boolean => {
  try {
    if (testCase?._type === ComposeMatcherSymbol)
      return testCase.conditions.every((c: CaseValue) => compare(c, value))
  } catch (e) { }

  try {
    if (testCase?._type === StrictMatcherSymbol)
      return JSON.stringify(testCase.value) === JSON.stringify(value)
  } catch (e) { }

  if (testCase === Any && value !== undefined) return true
  if (testCase === AnyNumber && typeof value === 'number') return true
  if (testCase === AnyString && typeof value === 'string') return true
  if (testCase === AnyBoolean && typeof value === 'boolean') return true
  if (testCase === AnyArray && Array.isArray(value)) return true
  if (testCase === AnyFunction && typeof value === 'function') return true
  if (
    testCase === AnyObject &&
    typeof value === 'object' &&
    !Array.isArray(value)
  )
    return true

  if (typeof testCase === 'function') {
    try {
      return testCase(value)
    } catch (e) {
      return false
    }
  }

  if (typeof testCase === 'object') {
    if (typeof value === 'object') {
      return Object.keys(testCase).every((key: string) =>
        value.hasOwnProperty(key) ? compare(testCase[key], value[key]) : false
      )
    }
    return false
  }

  if (typeof testCase !== typeof value) return false

  return testCase === value
}

const findCase =
  <T>(value: T) =>
    ([testCase]: Case<T>) =>
      compare(testCase, value)

const matcher = <T>(value: unknown, cases: Case<T>[], xCase?: Case<T>) => {
  const updatedCases = xCase ? [...cases, xCase] : [...cases]

  return {
    case: (testCase: CaseValue, testCaseFn: CaseFn<T>) =>
      matcher<T>(value, updatedCases, [testCase, testCaseFn]),
    default: (defaultFn: DefaultFn<T>) => {
      const [, fn] = updatedCases.find(findCase(value)) || [
        undefined,
        defaultFn
      ]
      return fn(value)
    }
  }
}

export default <T>(x: unknown) => matcher<T>(x, [])
