const puppeteer = require("puppeteer")

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

    let start = 0
    for (let i = start; i < cardsLength; i++) {
      await cards[i].click()

      start = i + 1
    }

    console.log("setting start to " + start)

    // Let the page load for a while
    console.log("timing out")
    await delay("5000")
    console.log("go again")
  }
}

extract()
