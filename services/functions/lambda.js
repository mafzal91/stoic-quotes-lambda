import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

const URL = "https://www.stoicsnapshots.com";
// const URL = "http://localhost:3000";
const YOUR_LOCAL_CHROMIUM_PATH =
  "/tmp/localChromium/chromium/mac_arm-1186211/chrome-mac/Chromium.app/Contents/MacOS/Chromium";

async function setCookie(cookies, page, url) {
  if (cookies) {
    const cookiesArray = cookies.map((cookie) => {
      const [name, value] = cookie.trim().split("=");
      return { url, name, value };
    });

    await page.setCookie(...cookiesArray);
  }
}

export async function handler(event) {
  const height = event.queryStringParameters.height || 1440;
  const width = event.queryStringParameters.width || 2560;
  const quote_id = event?.queryStringParameters?.quote_id ?? "";
  const cookies = event?.cookies ?? [];

  if (process.env.IS_LOCAL) {
    console.log({
      height,
      width,
      quote_id,
      cookies,
    });
  }

  const launchArgs = {
    args: chromium.args,
    defaultViewport: {
      ...chromium.defaultViewport,
      deviceScaleFactor: 2,
      width: Number(width),
      height: Number(height),
    },
    executablePath: process.env.IS_LOCAL
      ? YOUR_LOCAL_CHROMIUM_PATH
      : await chromium.executablePath(),
    headless: true,
    ignoreHTTPSErrors: true,
    slowMo: 200,
  };
  const url = `${URL}/${quote_id}`;
  const browser = await puppeteer.launch(launchArgs);
  const page = await browser.newPage();
  await setCookie(cookies, page, url);

  // Navigate to the url
  await page.goto(url);
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  let div_selector_to_remove = ".screenshot-hidden";
  await page.evaluate((sel) => {
    const elements = document.querySelectorAll(sel);

    for (let i = 0; i < elements.length; i++) {
      elements[i].parentNode.removeChild(elements[i]);
    }
  }, div_selector_to_remove);

  return {
    statusCode: 200,
    isBase64Encoded: true,
    headers: {
      "Content-Type": "image/png",
    },
    body: await page.screenshot({ encoding: "base64" }),
  };
}
