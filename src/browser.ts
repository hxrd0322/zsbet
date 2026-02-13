import puppeteer from 'puppeteer'
import type { LaunchOptions, Page, Frame } from 'puppeteer'
import path from 'path'
import fs from 'fs/promises'

const config: {
  launch: LaunchOptions
} = {
  launch: {
    headless: process.argv.includes('--headless'),
    browser: "chrome"
  }
}

const shouldAccept = (username: string) => fs.exists(path.join(__dirname, '..', 'dirs', username)).then(b => !b)


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

const loggedIn = (page: Page) => new Promise((res, rej) => {
  page.waitForSelector(".ButtonLogin").then(() => res(0)).catch(() => { })
  page.waitForSelector(".TotalBalanceWrapper").then(() => res(1)).catch(() => { })
})

export async function placeBet(instructions: Instruction, user: User) {
  const initialExisted = await shouldAccept(user.username.split('@')[0]!)
  const browser = await puppeteer.launch({
    ...config.launch,
    userDataDir: path.join(__dirname, '..', 'dirs', user.username.split('@')[0]!)
  })

  const page = await browser.pages().then(p => p[0]!)
  const url = new URL("https://www.tippmixpro.hu/hu/fogadas/i/kereses")

  await page.goto(url.href, {
    waitUntil: "domcontentloaded"
  })

  if (initialExisted) {
    await page.waitForSelector("button#onetrust-accept-btn-handler")
    await page.$eval("button#onetrust-accept-btn-handler", b => b.click())
    await sleep(3000)
    await page.waitForSelector("div.ComponentClock")
  }

  //loaded site

  let frame = await getFrame(page)
  await sleep(1000)
  //got frame


  if (await loggedIn(page).then(b => !b)) {
    await page.$eval('button.ButtonLogin', b => b.click())
    const inputs = await page.$$('div.InputWrap input')
    await inputs[0]!.type(user.username, { delay: 55 })
    await inputs[1]!.type(user.password, { delay: 100 })
    await sleep(450)
    await page.$eval('button.LoginSubmitButton', btn => btn.click())

    await sleep(3000)
    await page.reload()
    await page.waitForSelector("iframe#SportsIframe").then(() => sleep(1000))
    frame = await getFrame(page)
  }

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




  const buttonIndex = instructions.channel.includes('home') ? 0 : 2
  await frame.waitForSelector('article.Market.Market--Id-69')
  const buttons = await frame.$$('article.Market.Market--Id-69 li.Market__OddsGroupItem button.OddsButton')
  await buttons[buttonIndex]!.click()

  await sleep(900)
  await frame.$('input.StakeInput__Input').then(i => {
    i?.focus()
    return i
  }).then(i => i?.type(user.stake.toString(), { delay: 300 }))
  await sleep(900)

  await frame.waitForSelector("button.BetslipFooter__PlaceBetButton")
  await frame.$eval("button.BetslipFooter__PlaceBetButton", btn => btn.click())


  await sleep(100000000)
}
