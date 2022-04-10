import match, { Any, AnyBoolean, AnyNumber, AnyString } from '.'

const Loading = Symbol('Loading')

const testCases = <V, R>(
  cases: [V, R][],
  fn: (value: V, result: R) => void
) => {
  cases.forEach(([value, result]) => fn(value, result))
}

describe('Pattern Matching TS', () => {
  it('Should define the match function', () => {
    expect(match).toBeDefined()
  })

  it('Should be chainable', () => {
    const v = match<number, string>(1)
      .case(1, () => 'one')
      .case(2, () => 'two')
      .case(3, () => 'three')
      .default(() => 'five')

    expect(v).toBe('one')
  })

  it('should match object structure', () => {
    interface X {
      loading?: boolean
      data?: string | null
      error?: string | null
    }

    const x: X = {
      loading: true
    }

    const v = match<X, string>(x)
      .case(
        {
          loading: true
        },
        () => 'loading'
      )
      .case(
        {
          data: 'data'
        },
        () => 'two'
      )
      .case(
        {
          error: null
        },
        () => 'three'
      )
      .default(() => 'not found')

    expect(v).toBe('loading')
  })

  it('should match an object with any() value', () => {
    type Val = { data?: any; loading?: boolean; error?: any }

    testCases(
      [
        [{ loading: true }, 'loading'],
        [{ data: 'data' }, 'data'],
        [{ error: null }, 'error'],
        [{}, 'not found']
      ],
      (value, result) => {
        const v = match<Val, string>(value)
          .case(
            {
              loading: true
            },
            () => 'loading'
          )
          .case(
            {
              data: Any
            },
            () => 'data'
          )
          .case(
            {
              error: Any
            },
            () => 'error'
          )
          .default(() => 'not found')

        expect(v).toBe(result)
      }
    )
  })

  it('should match different strings', () => {
    testCases(
      [
        [{ value: 'test' }, 1],
        [{ value: 'test2' }, 2],
        [{ value: 'test3' }, 3],
        [{ value: 'test4' }, 4],
        [{ value: 'test5' }, 5],
        [{ value: 'test6' }, 6],
        [{ value: 'any other string' }, 0]
      ],
      (val, res) => {
        const x = match<{ value: string }, number>(val)
          .case({ value: 'test' }, () => 1)
          .case({ value: 'test2' }, () => 2)
          .case({ value: 'test3' }, () => 3)
          .case({ value: 'test4' }, () => 4)
          .case({ value: 'test5' }, () => 5)
          .case({ value: 'test6' }, () => 6)
          .default(() => 0)

        expect(x).toBe(res)
      }
    )
  })

  it('should match custom symbol types', () => {
    type Response = typeof Loading | { data: string } | { error: string }

    testCases<Response, number>(
      [
        [{ data: 'data' }, 1],
        [{ error: 'error' }, 2],
        [Loading, 3]
      ],
      (val, res) => {
        const x = match<Response, number>(val)
          .case({ data: 'data' }, () => 1)
          .case({ error: 'error' }, () => 2)
          .case(Loading, () => 3)
          .default(() => 4)

        expect(x).toBe(res)
      }
    )
  })

  describe('should match ANY symbols', () =>
    testCases<any, number>(
      [
        [1, 1],
        ['test', 2],
        [false, 3],
        [[], 4]
      ],
      (val, res) => {
        it(`should match ${val} to ${res}`, () => {
          const x = match<any, number>(val)
            .case(AnyNumber, () => 1)
            .case(AnyString, () => 2)
            .case(AnyBoolean, () => 3)
            .case(Any, () => 4)
            .default(() => 5)

          expect(x).toBe(res)
        })
      }
    ))

  describe('should match arrays', () =>
    testCases(
      [
        [[1, 2, 3], 'three numbers'],
        [[1, 2], 'default']
      ],
      (val, res) => {
        it(`should match ${val} to ${res}`, () => {
          const x = match(val)
            .case([AnyNumber, AnyNumber, AnyNumber], () => 'three numbers')
            .default(() => 'default')

          expect(x).toBe(res)
        })
      }
    ))

  describe('should validate parsed json', () =>
    testCases(
      [
        ['{"data": "data"}', 'wrong'],
        ['{}', 'wrong'],
        ['{"name": "Mark", "age": "15"}', 'wrong'],
        ['{"name": "Mark", "age": 15}', 'correct']
      ],
      (val, res) => {
        it(`should match ${val} to ${res}`, () => {
          const parsed = JSON.parse(val)

          const x = match(parsed)
            .case({ name: AnyString, age: AnyNumber }, () => 'correct')
            .default(() => 'wrong')

          expect(x).toBe(res)
        })
      }
    ))
})
