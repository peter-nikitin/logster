export type LogRow = {
  id: string
  timestamp: number
  method: string
  message: string
  deltaMs: number | null
  payload?: unknown
}
