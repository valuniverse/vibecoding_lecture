export type Goal = '체중감량' | '근력향상' | '체력유지' | '스트레스해소'
export type Level = '초급' | '중급' | '고급'

export interface User {
  id: string
  nickname: string
  goal: Goal
  level: Level
  cautionParts: string[]
}
