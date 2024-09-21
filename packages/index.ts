import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

const URL = "https://www.stoicsnapshots.com";
const LOCAL_URL = "http://localhost:3000";
const YOUR_LOCAL_CHROMIUM_PATH =
  "/tmp/localChromium/chromium/mac_arm-1357991/chrome-mac/Chromium.app/Contents/MacOS/Chromium";

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
  const url = `${process.env.IS_LOCAL ? LOCAL_URL : URL}/${quote_id}`;
  const browser = await puppeteer.launch(launchArgs);
  const page = await browser.newPage();
  await setCookie(cookies, page, url);

  // Navigate to the url
  await page.goto(url);
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  let div_selector_to_remove = ".screenshot-hidden";
  await page.evaluate((sel) => {
    const elements = document.querySelectorAll(sel);
    elements.forEach((element) => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
  }, div_selector_to_remove);

  const screenshot = (await page.screenshot({ encoding: "base64" })) as string;
  await browser.close();

  return {
    statusCode: 200,
    isBase64Encoded: true,
    headers: {
      "Content-Type": "image/png",
    },
    body: screenshot,
  };
}
