import "dotenv/config";

import { Browser, chromium, Page } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Alarm, getAlarmList, getColumns, getRowValues, getValidDates, openSchedulePageByDate } from "./utils/scrapperUtils"

// Testdata TODO read from frontend
// const userID = '10109046'

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
async function openSpreadsheet(): Promise<{ "page": Page, "browser" : Browser }> {
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

  console.log("Opening page in openSpreadsheet")


    // Navigate to the spreadsheet site
    await page.goto(process.env.SPREADSHEET_URL ?? "", {
      // await page.goto(searchQuery,{
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });
  console.log("returning page and browser...")
  const result = { "page": page, "browser": browser }
  
    return result

  } 
export async function getAlarmData(dateString: string, userID: string): Promise<Alarm[]> {

  let alarmList = []
  const openResult = await openSpreadsheet();
  const page = openResult.page;
  const browser = openResult.browser;
  try {
    // Search in page valid dates 
    // const validDates = await getValidDates(page);

    // formatting dateString
    const selectedDate = new Date(dateString)
    console.log("Got dateString while getting AlarmData: ",dateString)
    console.log("Got selectedDate: \n", selectedDate)
    console.log("Got userID: ", userID)
    // TODO Ask user to choose from one of these dates then continue
    // For now just use the first valid date

    // Opens the given date in the spreadsheet
    // Use first valid date for debug 
    await openSchedulePageByDate(page, selectedDate)

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
    alarmList = await getAlarmList(rowValuesList, columnNameList, userID, selectedDate)
    // TODO If user starts at 23:00 and ends turn at next day their userID appears two times, read again the userID to check if that is the case

    // const dataDir = path.join(process.cwd(), "data");
    // await mkdir(dataDir, {
    //   recursive: true,
    // });

  }  finally {
    /**
     * Always close the browser, even if scraping fails.
     */
    await browser.close();
  }

  return alarmList
}

/**
 * Searches spreadsheet for currently available dates
 * @returns Promise of Date array with the Dates available in the spreadsheet
 */
export async function getAvailableDates(): Promise<Date[]>{
  console.log("in getAvailableDates")
  const openResult = await openSpreadsheet()
  const browser = openResult.browser
  let result: Date[] = []
  try {
  const page = openResult.page
    result = await getValidDates(page)
  } catch (e) {
    console.error("Got error while searching for valid dates: ", e)
  } finally {
    /**
     * Always close the browser, even if scraping fails.
     */
    await browser.close();
  }
  return result

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
