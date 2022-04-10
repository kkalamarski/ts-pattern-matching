export const Any: unique symbol = Symbol('Any')
export const AnyString: unique symbol = Symbol('AnyString')
export const AnyNumber: unique symbol = Symbol('AnyNumber')
export const AnyBoolean: unique symbol = Symbol('AnyBoolean')

type CaseValue<T> =
  | any
  | T
  | Partial<T>
  | typeof Any
  | typeof AnyString
  | typeof AnyNumber
  | typeof AnyBoolean
type CaseFn<T, U> = (x: T) => U
type Case<T, U> = [CaseValue<T>, CaseFn<CaseValue<T>, U>]
type DefaultFn<T> = () => T

const compare = (testCase: any, value: any): boolean => {
  if (testCase === Any && value !== undefined) return true
  if (testCase === AnyNumber && typeof value === 'number') return true
  if (testCase === AnyString && typeof value === 'string') return true
  if (testCase === AnyBoolean && typeof value === 'boolean') return true

  if (typeof testCase !== typeof value) return false

  if (typeof testCase === 'object') {
    return Object.keys(testCase).every((key) =>
      value.hasOwnProperty(key) ? compare(testCase[key], value[key]) : false
    )
  }

  return testCase === value
}

const findCase =
  <T>(value: T) =>
    ([testCase]: Case<T, any>) =>
      compare(testCase, value)

const matcher = <T, U>(value: T, cases: Case<T, U>[], xCase?: Case<T, U>) => {
  const updatedCases = xCase ? [...cases, xCase] : [...cases]

  return {
    case: (testCase: CaseValue<T>, testCaseFn: CaseFn<CaseValue<T>, U>) =>
      matcher<CaseValue<T>, U>(value, updatedCases, [testCase, testCaseFn]),
    default: (defaultFn: DefaultFn<U>) => {
      const [, fn] = updatedCases.find(findCase(value)) || [undefined, defaultFn]
      return fn(value)
    }
  }
}

export default <T, U>(x: T) => matcher<T, U>(x, [])
