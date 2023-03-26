const puppeteer = require("puppeteer")
const fs = require("fs")

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  })
}

async function extract() {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()
  await page.goto(
    "https://datasetsearch.research.google.com/search?src=0&query=(%22interleukin-6%22%20OR%20%22IL-6%22)%20AND%20(serum%20OR%20plasma)%20AND%20human"
  )
  await page.setViewport({ width: 1080, height: 1024 })
  let cardsLength = 0
  let start = 0
  const links = []

  while (true) {
    console.log("querying")
    const cards = await page.$$("li.UnWQ5")

    console.log("found " + cards.length)
    console.log("previous was " + cardsLength)
    // If we haven't loaded any new cards
    if (cardsLength === cards.length) {
      break
    }
    cardsLength = cards.length

    for (let i = start; i < cardsLength; i++) {
      await cards[i].click()

      const link = await page.$("a.WpHeLc")
      const href = await link.getProperty("href")
      const rawHref = await href.jsonValue()

      const name = await page.$("h1.SAyv5")
      const nameText = await name.getProperty("textContent")
      const rawName = await nameText.jsonValue()

      const date = await page.$("span.gHkX8d")
      const dateText = await date.getProperty("textContent")
      const rawDate = await dateText.jsonValue()

      links.push([rawName, rawDate, rawHref])

      start = i + 1
    }

    console.log("setting start to " + start)

    // Let the page load for a while
    console.log("timing out")
    await delay("2000")
    console.log("go again")
  }
  console.log(links)
  const output = links.map((row) => row.join(";")).join("\n")
  fs.writeFileSync("./out/datasearch.csv", output)
}

extract()
