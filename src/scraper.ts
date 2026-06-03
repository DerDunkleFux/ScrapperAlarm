import "dotenv/config";

import { chromium, Page } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Alarm, getAlarmList, getColumns, getRowValues, getValidDates, openSchedulePageByDate } from "./utils/scrapperUtils"

// Testdata TODO read from frontend
const userID = '10109046'

/**
 * Read the search query from .env.
 *
 * Example:
 * SEARCH_QUERY=playwright typescript tutorial
 *
 * If the env variable is missing, we use a fallback query.
 */
const searchURL =
process.env.SPREADSHEET_URL ?? "wrong";

console.log("In scraper.ts and have searchQuery: ", searchURL)

export async function getAlarmData(): Promise<Alarm[]> {

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
  let alarmList = []
  try {


    // Navigate to the spreadsheet site
    await page.goto(process.env.SPREADSHEET_URL ?? "",{
    // await page.goto(searchQuery,{
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
    // Search in page valid dates 
    const validDates = await getValidDates(page);

    // TODO Ask user to choose from one of these dates then continue
    // For now just use the first valid date

    // Opens the given date in the spreadsheet
    // Use first valid date for debug 
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
    alarmList = await getAlarmList(rowValuesList, columnNameList, userID)
    console.log("Got alarmList: ", alarmList)
    const dataDir = path.join(process.cwd(), "data");
    await mkdir(dataDir, {
      recursive: true,
    });

    // Save the result as JSON.
    const outputPath = path.join(dataDir, "google-results.json");

    await writeFile(outputPath, JSON.stringify(alarmList, null, 2), "utf-8");

    console.log(`Saved results to ${outputPath}`);
  } finally {
    /**
     * Always close the browser, even if scraping fails.
     */
    await browser.close();
  }
  return alarmList
}

/**
 * Run the script.
 *
 * If something crashes:
 * - print the error
 * - exit with status code 1
 */
// main().catch((error: unknown) => {
//   console.error(error);
//   process.exit(1);
// });
