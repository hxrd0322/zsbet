import puppeteer from 'puppeteer'
import type { Page, Frame } from 'puppeteer'

async function getFrame(page: Page, target = "SportsIframe"): Promise<Frame> {
  let frame: Frame | undefined
  while (!frame) {
    try {
      frame = await page.waitForFrame(async (frame) => {
        const el = await frame.frameElement()
        if (!el) return false
        const id = await el.evaluate(el => el.getAttribute("id"))
        return id === target
      })
    } catch { await sleep(100) }
  }
  return frame
}

const sleep = (ms: number) => new Promise((res, rej) => setTimeout(res, ms))


let frame: Frame | null

export async function placeBet(instructions: Instruction, config: BetConfig) {
  const tags = instructions.channel.split('-')
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: config.id
  })

  const page = await browser.pages().then(p => p[0]!)
  const url = new URL("https://www.tippmixpro.hu/hu/fogadas/i/kereses")

  await page.goto(url.href, {
    waitUntil: "domcontentloaded"
  })

  //loaded site

  frame = await getFrame(page)
  await sleep(1000)
  //got frame


  while (1) {
    try {
      await frame.waitForSelector("input.Search__Input", { timeout: 2000 })
      break
    } catch {
      await page.reload()
    }
  }

  const input = await frame.waitForSelector("input.Search__Input").then(p => p!)
  //found the input

  //await input!.evaluate((el, arg: string) => el.value = arg, )
  await input.focus()
  const query = instructions.teams[0] + " " + instructions.teams[1]
  for (let i = 0; i < query.length; i++) {
    await input.type(query[i]!)
    await sleep(50 + Math.floor(Math.random() * 150))
  }
  //query input done

  await sleep(4000)
  await frame.waitForSelector(".Search__Results .SearchItem.Search__Item")
  const result = await frame.$(".Search__Results .SearchItem.Search__Item")


  await result!.$eval("a.Anchor", a => a.click())

  frame = await getFrame(page)
  await frame.waitForSelector(".Market__OddsGroups")

  const buttonIndex = tags.includes('home') ? 0 : 2
  await frame.waitForSelector('article.Market.Market--Id-69')
  const buttons = await frame.$$('article.Market.Market--Id-69 li.Market__OddsGroupItem button.OddsButton')
  await buttons[buttonIndex]!.click()

  await sleep(900)
  await frame.$('input.StakeInput__Input').then(i => {
    i?.focus()
    return i
  }).then(i => i?.type(config.stake.toString(), { delay: 300 }))
  await sleep(900)

  await frame.waitForSelector("button.BetslipFooter__PlaceBetButton")
  await frame.$eval("button.BetslipFooter__PlaceBetButton", btn => btn.click())

  await sleep(5000)
  await browser.close()
}
