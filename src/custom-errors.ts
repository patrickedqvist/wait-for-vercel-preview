export class StatusError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StatusError'
  }
}
