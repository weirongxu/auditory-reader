import { compact, orderBy, range } from './collection.js'

it('range', () => {
  expect(range(0, 4)).toEqual([0, 1, 2, 3])
  expect(range(0, 4, 2)).toEqual([0, 2])
  expect(range(4, -4)).toEqual([4, 3, 2, 1, 0, -1, -2, -3])
})

it('compact', () => {
  expect(compact([-1, 0, 1, 2, false, true, null, '', 'hello'])).toEqual([
    -1,
    1,
    2,
    true,
    'hello',
  ])
})

it('orderBy', () => {
  type Item = {
    name: string
    age: number
  }
  const list: Item[] = [
    {
      name: 'AAA',
      age: 12,
    },
    {
      name: 'AAA',
      age: 11,
    },
    {
      name: 'AAA',
      age: 10,
    },
    {
      name: 'CCC',
      age: 5,
    },
    {
      name: 'DDD',
      age: 12,
    },
    {
      name: 'BBB',
      age: 10,
    },
  ]
  expect(orderBy(list, 'asc', (it) => [it.name, it.age])).toEqual([
    {
      name: 'AAA',
      age: 10,
    },
    {
      name: 'AAA',
      age: 11,
    },
    {
      name: 'AAA',
      age: 12,
    },
    {
      name: 'BBB',
      age: 10,
    },
    {
      name: 'CCC',
      age: 5,
    },
    {
      name: 'DDD',
      age: 12,
    },
  ])
})
