import type { Page, Frame } from 'puppeteer'
import puppeteer from 'puppeteer'
import path from 'path'
import { v7 as uuid } from 'uuid'

const sleep = (ms: number) => new Promise((res, _) => setTimeout(res, ms))

let frame: Frame | null

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

const login = async (page: Page, user: User) => {
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

export default async function createSession(user: User) {
  const id = path.join(__dirname, '..', 'dirs', uuid())
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: id
  })
  const page = await browser.pages().then(p => p[0]!)

  const url = new URL("https://www.tippmixpro.hu/hu/fogadas/i/kereses")

  await page.goto(url.href)

  await page.waitForSelector("button#onetrust-accept-btn-handler")
  await page.$eval("button#onetrust-accept-btn-handler", b => b.click())
  await sleep(3000)
  await page.waitForSelector("div.ComponentClock")

  await login(page, user)
  await browser.close()
  return id
}