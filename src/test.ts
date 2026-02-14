import { placeBet } from "./browser"
import createSession from "./session"
import fs from 'fs/promises'
import path from 'path'

const teams = ["Manchester City", "Newcastle"] as [string, string]
const sessionPath = path.join(__dirname, '..', 'dirs')

const channel = "premier-home"
const user = {
  username: "szentesyzsolt94@gmail.com",
  password: "Zsolti1994.", stake: 100
}


const clearSession = async () => {
  const paths = await fs.readdir(sessionPath)
  for (let i = 0; i < paths.length; i++) {
    await fs.rm(path.join(sessionPath, paths[i]!), { force: true, recursive: true })
  }
}