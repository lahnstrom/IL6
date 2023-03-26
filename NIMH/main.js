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
    "https://nda.nih.gov/search.html?query=interleukin%206%20IL-6%20plasma%20serum%20human&categories=data_structure"
  )
  await page.setViewport({ width: 1080, height: 1024 })
  let resultsLength = 0
  let start = 0
  const links = []

  while (true) {
    console.log("querying")
    const results = await page.$$("div.search-result")

    console.log("found " + results.length)
    console.log("previous was " + resultsLength)

    // If we haven't loaded any new results - break
    if (resultsLength === results.length) {
      break
    }
    resultsLength = results.length

    for (let i = start; i < resultsLength; i++) {
      const result = results[i]

      const link = await result.$("h4 > a")
      const href = await link.getProperty("href")
      const rawHref = await href.jsonValue()

      const name = await result.$("h4 > a")
      const nameText = await name.getProperty("textContent")
      const rawName = await nameText.jsonValue()

      links.push([rawName, rawHref])

      start = i + 1
    }

    console.log("setting start to " + start)

    // Click to show next result
    try {
      const showMore = await page.$("div.search-show-more > form > a")
      await showMore.click()
    } catch {
      console.log("No more to show, exiting")
      break
    }

    console.log("timing out")
    // Long timeout required
    await delay("10000")
    console.log("go again")
  }
  const output = links.map((row) => row.join(";")).join("\n")
  fs.writeFileSync("./out/nimh.csv", output)
}

extract()
