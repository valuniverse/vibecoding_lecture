export type Completion = '완료' | '부분' | '스킵'

export interface Feedback {
  completion: Completion
  rating: number
  comment?: string
}
