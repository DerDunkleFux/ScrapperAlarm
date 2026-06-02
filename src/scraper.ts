import "dotenv/config";

import { chromium, Page } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getAlarmList, getColumns, getRowValues, getValidDates, openSchedulePageByDate, type Alarm } from "./utils/scrapperUtils"

/**
 * Type for the JSON object we save to disk.
 */
type SearchResultOutput = {
  searchedAt: string;
  query: string;
  pageTitle: string;
  titles: string[];
};


/**
 * Read the search query from .env.
 *
 * Example:
 * SEARCH_QUERY=playwright typescript tutorial
 *
 * If the env variable is missing, we use a fallback query.
 */
const searchQuery =
  process.env.SEARCH_QUERY ?? "playwright typescript tutorial";



async function main(): Promise<void> {

  /**
   * Launch Chromium.
   *
   * headless: true
   * - Browser runs invisibly in the background.
   *
   * headless: false
   * - Browser opens visibly.
   * - Better while learning and debugging.
   */
  const browser = await chromium.launch({
    headless: false,
  });

  /**
   * A browser context is like a clean browser profile.
   *
   * It has isolated:
   * - cookies
   * - localStorage
   * - sessionStorage
   * - cache
   */
  const context = await browser.newContext();

  /**
   * A page is one browser tab.
   */
  const page = await context.newPage();

  try {

    // const userID = '10109046'

    const userID = '10051766'

    

    // Navigate to the spreadsheet site
    await page.goto(process.env.SPREADSHEET_URL ?? "");
    // Search in page valid dates 
    const validDates = await getValidDates(page);
    // TODO Ask user to choose from one of these dates then continue
    // For now just use the first valid date

    // Opens the given date in the spreadsheet
    // Use first valid date for debug 
    console.log("Got validDatesList: ", validDates)
    await openSchedulePageByDate(page, validDates[0])

    /**
     * Get columnnames from Excelfile
     */
    const columnNameList = await getColumns(page)
    /**
     * Get rowValues for specific User 
     */
    const rowValuesList = await getRowValues(page, userID, columnNameList.length)
    /**
     * Use retrieved information to format and create Alarm Array with necesary alarm-information
     * See type Alarm
     */
    const alarmList = await getAlarmList(rowValuesList, columnNameList, userID)


    /**
 * Make sure the data directory exists.
 */
    const dataDir = path.join(process.cwd(), "data");
    await mkdir(dataDir, {
      recursive: true,
    });

    /**
     * Save the result as JSON.
     */
    const outputPath = path.join(dataDir, "google-results.json");

    await writeFile(outputPath, JSON.stringify(alarmList, null, 2), "utf-8");

    console.log(`Saved results to ${outputPath}`);
  } finally {
    /**
     * Always close the browser, even if scraping fails.
     */
    await browser.close();
  }
  return

  /// old
  await page.goto("https://www.google.com", {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });

  /**
   * Google may show a cookie consent dialog depending on location,
   * browser state, and Google variant.
   *
   * This tries to click a likely accept button.
   *
   * If it does not exist, the catch block ignores the error.
   */
  const acceptButton = page.getByRole("button", {
    name: /accept all|agree|i agree|alle akzeptieren/i,
  });

  try {
    await acceptButton.click({
      timeout: 5_000,
    });
  } catch {
    /**
     * No consent dialog appeared, or the button text was different.
     * That is okay for this example.
     */
  }

  /**
   * Locate the Google search input.
   *
   * Depending on Google's rendered HTML, the search input may be:
   * - textarea[name="q"]
   * - input[name="q"]
   *
   * The comma means:
   * "match either of these selectors".
   */
  const searchBox = page.locator('textarea[name="q"], input[name="q"]');

  /**
   * Fill the search box with our query.
   */
  await searchBox.fill(searchQuery);

  /**
   * Press Enter to submit the search.
   */
  await searchBox.press("Enter");

  /**
   * Wait for the search results page to load.
   */
  await page.waitForLoadState("domcontentloaded");

  /**
   * Google result titles are commonly rendered as h3 elements.
   *
   * This is good enough for a learning scraper.
   * For a real scraper, you may want a more specific locator.
   */
  const resultTitleLocator = page.locator("h3");

  /**
   * Wait until at least one result title appears.
   */
  await resultTitleLocator.first().waitFor({
    timeout: 10_000,
  });

  /**
   * Extract all h3 text contents from the page.
   */
  const rawTitles = await resultTitleLocator.allTextContents();

  /**
   * Clean the titles:
   * - remove leading/trailing whitespace
   * - remove empty strings
   */
  const titles = rawTitles
    .map((title) => title.trim())
    .filter((title) => title.length > 0);

  /**
   * Read the current browser page title.
   */
  const pageTitle = await page.title();

  /**
   * Build the final JSON payload.
   */
  const output: SearchResultOutput = {
    searchedAt: new Date().toISOString(),
    query: searchQuery,
    pageTitle,
    titles,
  };

  /**
   * Print a small summary to the terminal.
   */
  console.log(`Search query: ${searchQuery}`);
  console.log(`Page title: ${pageTitle}`);
  console.log(`Found ${titles.length} result titles.`);

  for (const [index, title] of titles.entries()) {
    console.log(`${index + 1}. ${title}`);
  }
}

/**
 * Run the script.
 *
 * If something crashes:
 * - print the error
 * - exit with status code 1
 */
main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
