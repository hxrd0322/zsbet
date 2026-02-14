import chalk from 'chalk'
import { Bot } from 'grammy'
import fs from 'fs/promises'
import { parseMsg } from './utils'
import { placeBet } from './browser'
import createSession from './session'
import path from 'path'

const bot = new Bot(process.env.bot_id)

const sessionPath = path.join(__dirname, '..', 'dirs')

const users: User[] = [{
  username: "szentesyzsolt94@gmail.com",
  password: "Zsolti1994.",
  stake: 250
}]

const clearSession = async () => {
  const paths = await fs.readdir(sessionPath)
  for (let i = 0; i < paths.length; i++) {
    await fs.rm(path.join(sessionPath, paths[i]!), { force: true, recursive: true })
  }
}

bot.on("message", async (ctx) => {
  console.log("Message received at", new Date(1000 * ctx.message.date))
  if ((ctx.message.date * 1000) + (10 * 1000 * 60) <= Date.now()) return
  console.log(ctx.message.text)
  await fs.writeFile("./msg.txt", ctx.message.text || "")
  const instructions: Instruction = parseMsg(ctx.message.text || "")

  await Promise.allSettled(users.map(async (u) => {
    const id = await createSession(u)
    await placeBet(instructions, { id, stake: u.stake })
  }))

  await clearSession()
})

bot.start({
  onStart: () => {
    console.log(chalk.blue(`Bot started at ${new Date().toISOString()}`))
  }
})