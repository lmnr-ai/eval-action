export interface Output {
  resultUrl: string
  scores: {
    average: {
      [key: string]: number
    }
  }
  filename?: string
}
