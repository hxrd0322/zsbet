import { placeBet } from "./browser"

const teams = ["Manchester City", "Newcastle"] as [string, string]

const channel = "premier-home"
const user = {
  username: "szentesyzsolt94@gmail.com",
  password: "Zsolti1994.", stake: 100
}

await placeBet({
  teams, channel
}, user)
