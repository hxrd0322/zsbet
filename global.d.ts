export { }

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      bot_id: string
    }
  }

  interface Instruction {
    channel: string
    teams: [string, string]
  }

  interface User {
    username: string
    password: string
    stake: number
  }

  interface BetConfig {
    stake: number
    id: string
  }
}