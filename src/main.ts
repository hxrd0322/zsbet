import chalk from 'chalk'
import { Bot } from 'grammy'
import fs from 'fs/promises'
import { parseMsg } from './utils'
import { placeBet } from './browser'


const bot = new Bot(process.env.bot_id)

const users: User[] = [{
  username: "szentesyzsolt94@gmail.com",
  password: "Zsolti1994.",
  stake: 250
}]

bot.on("message", async (ctx) => {
  if ((ctx.message.date * 1000) + (10 * 1000 * 60) <= Date.now()) return
  console.log(ctx.message.text)
  await fs.writeFile("./msg.txt", ctx.message.text || "")
  const instructions: Instruction = parseMsg(ctx.message.text || "")

  await Promise.allSettled(users.map(u => placeBet(instructions, u)))



  process.exit(1)
})

bot.start({
  onStart: () => {
    console.log(chalk.blue(`Bot started at ${new Date().toISOString()}`))
  }
})