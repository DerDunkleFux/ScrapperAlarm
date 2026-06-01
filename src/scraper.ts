import "dotenv/config";

import { chromium, Page } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

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
 * Type of the alarm = 
 */
type Alarm = {
  name: string;
  idxStart?: number;
  idxEnd?: number;
  start?: string | null;
  end?: string | null;
}

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

const delay = 50
/**
 * Selects the text that appeared at the top bar upon selecting a cell. 
 * If no value was found throws error "Could not read cell value" [TODO Find out at what cell we were for error log]
 * 
 * The text inside of cells would have to be accessed over the Google API with authorization of the organization.
 * By selecting the cell and reading the top bar we avoid the Google Api
 * @param page 
 */

async function getCurrCellData(page: Page): Promise<string> {
  const result = await page.locator('#t-formula-bar-input').textContent();
  if (!result)
    throw new Error("Could not read cell value");
  return result;
}
/**
 * Helper function meant to search next valid alarm name and index in the current spreadsheet
 * also increases passed Idx
 * Stops when its found two identical values following each other e.g. "" , "" or "end 2", "end 2"
 * @param page 
 * @param currIdx 
 * @param maxColIdx Optional: When given, stops at the given index even if its found two identical values right after another
 * @returns name and index
 * Name is the value of the cell if it changed, if it didn't change returns null
 */
async function getCellValueByIdx(page: Page, currIdx: number, maxColIdx?: number): Promise<{ cellValue: string | null, idx: number }> {
  const oldValue = await getCurrCellData(page);
  await page.keyboard.press('ArrowRight', { delay: delay });
  const newValue = await getCurrCellData(page);
  if ((oldValue === newValue && maxColIdx == undefined) || currIdx === maxColIdx) {
    if (maxColIdx != undefined)
      console.log("Got the maxColIdx: ", maxColIdx);
    return { cellValue: null, idx: currIdx };
  }
  return { cellValue: newValue, idx: currIdx + 1 }
}

/**
 * Retrieves all column names and their corresponding idx
 * 
 * returns promise with array of object with name and idx 
 */
async function getColumns(page: Page): Promise<{ name: string, idx: number }[]> {
  let currIdx = 0
  let currCellName: string | null = ""
  type ColumnName = { name: string, idx: number }
  const columnNameList: ColumnName[] = []

  await page.keyboard.press('Control+f', { delay: delay });
  await page.keyboard.type('WinID', { delay: delay });
  await page.keyboard.press('Escape', { delay: delay });
  const text = await getCurrCellData(page)

  if (text != "WinID")
    throw new Error("Couldn't find first line with 'WinID' to select the alarm names");

  while (true) {
    const result = await getCellValueByIdx(page, currIdx)
    currCellName = result.cellValue
    if (currCellName === null)
      break;
    currIdx = result.idx

    const currCol: ColumnName = { name: currCellName, idx: currIdx }
    columnNameList.push(currCol)
    console.log("Added ", currCellName, "to list")
  }

  console.log("Now have list with names and idxs: ", columnNameList)
  return columnNameList
}

/**
 * Searches for userID and returns the whole row in an Array
 * @param page 
 * @param userID 
 * @returns promise of array with all of the cellvalues corresponding to that userID
 */
async function getRowValues(page: Page, userID: string, maxColIdx: number): Promise<string[]> {

  await page.keyboard.press('Control+f', { delay: delay });
  await page.keyboard.type(userID, { delay: delay });
  await page.keyboard.press('Escape', { delay: delay });
  const text = await getCurrCellData(page)
  if (text != userID)
    throw new Error("Couldn't find the given UserID: " + userID);
  const resultArray = [userID]
  let currIdx = 0
  while (true) {
    const result = await getCellValueByIdx(page, currIdx, maxColIdx)
    const currCellName = result.cellValue
    console.log("Have current result with idx: ", result, "  ", currIdx)
    if (currCellName === null)
      break;
    currIdx = result.idx
    resultArray.push(currCellName)
  }
  return resultArray
}
/**
 * Create array of Alarm objects corresponding to the names in columnNameList and their userID specific time values in rowValuesList
 * @param rowValuesList Array with the userID specific information in the same order as the colIdx's of columnNameList
 * @param columnNameList Array with the name and colIdx of the columns to see what alarm is being created
 * @param userID 
 * @returns Promise od Array with correctly formatted and filled Alarm objects
 */
async function fillAlarmStartEnd(rowValuesList: string[], columnNameList: { name: string; idx: number; }[], userID: string): Promise<Alarm[]> {
  const alarmList: Alarm[] = []

  for (const currCol of columnNameList) {
    let currAlarm: Alarm

    // special case: Offline activity end is before offline activity 2 start and offline activity 2 end, 
    // TODO: Fix excel sheet and THEN REMOVE this fix 
    const lowerName = currCol.name.toLowerCase()
    if (lowerName.includes("offline activity end")) {
      currAlarm = {
        idxStart: currCol.idx,
        name: currCol.name.replace(/ (start|end)/i, ""),
        start: rowValuesList[currCol.idx]
      }
      alarmList.push(currAlarm)
      continue;
    } else if (lowerName.includes("offline activity 2 start")) {
      const currEndName = currCol.name.replace(/ 2 (start|end)/i, "")
      console.log("Trying to find alarm with name: ", currEndName)
      const foundAlarm = alarmList.find(findAlarm => findAlarm.name == currEndName)
      if (foundAlarm != undefined) {
        foundAlarm.idxEnd = currCol.idx
        foundAlarm.end = rowValuesList[currCol.idx]
      }
      console.log("Found offline activity: ", foundAlarm)
      continue
    }
    else if (lowerName.includes("offline activity 2 end")) {
      continue
    }
    // End of fix

    if (currCol.name.toLowerCase().includes("start")) {
      currAlarm = {
        idxStart: currCol.idx,
        name: currCol.name.replace(/ (start|end)/i, ""),
        start: rowValuesList[currCol.idx]
      }
      alarmList.push(currAlarm)

    } else if (currCol.name.toLowerCase().includes("end")) {
      // for the end of an alarm we have to find the corresponding start, in this case by name since idx could be further apart
      const currEndName = currCol.name.replace(/ (start|end)/i, "")
      const foundAlarm = alarmList.find(findAlarm => findAlarm.name == currEndName)
      if (foundAlarm != undefined) {
        foundAlarm.idxEnd = currCol.idx
        // foundAlarm.end = await getCellValueByColIdx(page, currCol.colIdx, userID)
        foundAlarm.end = rowValuesList[currCol.idx]
      }
      else {
        throw new Error("Got " + currEndName + " end but no start");
      }
    }
  }

  return alarmList
}


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

    const userID = '52159052'
    
    async function openSchedulePageByDate(page: Page, date: Date = new Date()) {
      await page.goto(process.env.SPREADSHEET_URL ?? "");
      const dayNumber = date.getDate()
      const monthNumber = date.getMonth()
      const dayWord = date.toLocaleDateString('es-ES', { weekday: "long" })
      const yearNumber = date.getFullYear()
      const formattedDate = `${dayWord} ${dayNumber}/${monthNumber}/`

      let button = await page.getByRole('button', { name: formattedDate , exact: false})
      if (! await button.count()) {
        console.log("Didnt find given date! Please select from the following available dates: ")

        const toolbarLocator = page.locator(".docs-sheet-container-bar [role='button']");
        const tabs = await toolbarLocator.all()
        console.log(tabs)
        for (const tab of tabs) {
          const text = await tab.locator(".docs-sheet-tab-name").innerText()
          if( text.includes(String(yearNumber)) )
            console.log(text)
        }
        const gottenFirstDate =  await tabs[1].locator(".docs-sheet-tab-name").innerText()
        const newDate = new Date()
        const newDayNumber = String(newDate.getDate()).padStart(2,'0')
        const newMonthNumber = String(newDate.getMonth() + 1).padStart(2,'0')
        const newDayWord = newDate.toLocaleDateString('es-ES', { weekday: "long" })
        const newFormattedDate = `${newDayWord} ${newDayNumber}/${newMonthNumber}/`
        button = await page.getByRole('button', { name: gottenFirstDate , exact: false})
        console.log("Didnt get button with given date, new button found: ", gottenFirstDate)
      }
      await button.click({delay: 100});
    }

    await openSchedulePageByDate(page, new Date(2026,4, 30))

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
    const alarmList = await fillAlarmStartEnd(rowValuesList, columnNameList, userID)


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
