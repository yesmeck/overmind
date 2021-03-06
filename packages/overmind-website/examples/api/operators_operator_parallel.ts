export default (ts) =>
  ts
    ? [
        {
          fileName: 'actions.ts',
          code: `
import { Operator, pipe } from 'overmind'
import * as o from './operators'

export const loadAllData: Operator = parallel(
  o.loadSomeData(),
  o.loadSomeMoreData()
)
`,
        },
      ]
    : [
        {
          fileName: 'actions.js',
          code: `
import { pipe } from 'overmind'
import * as o from './operators'

export const loadAllData = parallel(
  o.loadSomeData(),
  o.loadSomeMoreData()
)
`,
        },
      ]
