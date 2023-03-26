const puppeteer = require("puppeteer")

async function extract() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto("https://datasetsearch.research.google.com/")
}

extract()
