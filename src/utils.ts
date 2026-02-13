const reverse = (str: string) => {
  let final = ''
  for (let i = str.length - 1; i >= 0; i--) {
    final += str[i]
  }
  return final
}

const getChannel = (text: string) => {
  const split = text.split('\n')
  let collected = ''

  for (let i = text.length - 1; i >= 0; i--) {
    const current = split[0]![i]
    if (!current) continue
    if (current === ' ') break
    collected += current
  }
  return reverse(collected)
}

const getTeams = (msg: string) => {
  const split = msg.split('\n')
  const teams = split.find(i => i.includes('vs'))!.split('vs').map(i => i.trim())
  return teams as [string, string]
}

export function parseMsg(msg: string): Instruction {
  const channel = getChannel(msg)
  const teams = getTeams(msg)

  return {
    channel,
    teams
  }
}