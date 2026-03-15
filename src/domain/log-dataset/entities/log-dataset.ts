import type { LogRow } from './log-row'

export type LogDataset = {
  id: string
  name: string
  rows: LogRow[]
}
