const puppeteer = require("puppeteer")
const fs = require("fs")

async function extract() {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()
  await page.goto(
    "https://www.icpsr.umich.edu/web/ICPSR/search/studies?start=0&sort=score%20desc%2CTITLE_SORT%20asc&ARCHIVE=ICPSR&PUBLISH_STATUS=PUBLISHED&rows=50&q=(%22interleukin-6%22%20OR%20%22IL-6%22)%20AND%20human"
  )
  await page.setViewport({ width: 1080, height: 1024 })
  const links = []

  const searchResults = await page.$$("div.searchResult")

  for (let result of searchResults) {
    const link = await result.$("a")
    const href = await link.getProperty("href")
    const rawHref = await href.jsonValue()

    const nameText = await link.getProperty("textContent")
    const rawName = await nameText.jsonValue()

    const date = await result.$("div.text-nowrap")
    const dateText = await date.getProperty("textContent")
    const rawDate = await dateText.jsonValue()

    links.push([rawName, rawDate, rawHref])
  }

  const output = links.map((row) => row.join(";")).join("\n")
  fs.writeFileSync("./out/icpsr.csv", output)
}

extract()
