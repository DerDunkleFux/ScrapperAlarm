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
  const oldValue = await page.locator('#t-formula-bar-input').textContent()
  await page.keyboard.press('ArrowRight', { delay: 75 });
  const newValue = await page.locator('#t-formula-bar-input').textContent()
  if ((oldValue === newValue && maxColIdx == undefined) || currIdx === maxColIdx) {
    if (maxColIdx != undefined)
      console.log("Got the maxColIdx: ", maxColIdx)
    return { cellValue: null, idx: currIdx };
  }
  return { cellValue: newValue, idx: currIdx + 1 }
}

/**
 * Retrieves all alarm names and their corresponding start idx
 * 
 * returns array of object with name and colIdx where that name was found
 */
async function getAlarmNameIdxList(page: Page): Promise<{ name: string, colIdx: number }[]> {
  let currIdx = 0
  let currCellName: string | null = ""
  type ColumnName = { name: string, colIdx: number }
  const columnNameList: ColumnName[] = []

  await page.keyboard.press('Control+f', { delay: 200 });
  await page.keyboard.type('WinID', { delay: 200 });
  await page.keyboard.press('Escape', { delay: 200 });
  const text = await page.locator('#t-formula-bar-input').textContent()

  if (text != "WinID")
    throw new Error("Couldn't find first line with 'WinID' to select the alarm names");

  while (true) {
    const result = await getCellValueByIdx(page, currIdx)
    currCellName = result.cellValue
    if (currCellName === null)
      break;
    currIdx = result.idx

    const currCol: ColumnName = { name: currCellName, colIdx: currIdx }
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

  const delay = 100
  await page.keyboard.press('Control+f', { delay: delay });
  await page.keyboard.type(userID, { delay: delay });
  await page.keyboard.press('Escape', { delay: delay });
  const text = await page.locator('#t-formula-bar-input').textContent()
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
async function fillAlarmStartEnd(rowValuesList: string[], columnNameList: { name: string; colIdx: number; }[], userID: string): Promise<Alarm[]> {
  const alarmList: Alarm[] = []

  for (const currCol of columnNameList) {
    let currAlarm: Alarm

    // special case: Offline activity end is before offline activity 2 start and offline activity 2 end, 
    // TODO: Fix excel sheet and THEN REMOVE this fix 
    const lowerName = currCol.name.toLowerCase()
    if (lowerName.includes("offline activity end")) {
      currAlarm = {
        idxStart: currCol.colIdx,
        name: currCol.name.replace(/ (start|end)/i, ""),
        start: rowValuesList[currCol.colIdx]
      }
      console.log("Found offline activity: ", currAlarm)
      alarmList.push(currAlarm)
      continue;
    } else if (lowerName.includes("offline activity 2 start")) {
      const currEndName = currCol.name.replace(/ 2 (start|end)/i, "")
      console.log("Trying to find alarm with name: ", currEndName)
      const foundAlarm = alarmList.find(findAlarm => findAlarm.name == currEndName)
      if (foundAlarm != undefined) {
        foundAlarm.idxEnd = currCol.colIdx
        foundAlarm.end = rowValuesList[currCol.colIdx]
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
        idxStart: currCol.colIdx,
        name: currCol.name.replace(/ (start|end)/i, ""),
        start: rowValuesList[currCol.colIdx]
      }
      alarmList.push(currAlarm)

    } else if (currCol.name.toLowerCase().includes("end")) {
      // for the end of an alarm we have to find the corresponding start, in this case by name since idx could be further apart
      const currEndName = currCol.name.replace(/ (start|end)/i, "")
      const foundAlarm = alarmList.find(findAlarm => findAlarm.name == currEndName)
      if (foundAlarm != undefined) {
        foundAlarm.idxEnd = currCol.colIdx
        // foundAlarm.end = await getCellValueByColIdx(page, currCol.colIdx, userID)
        foundAlarm.end = rowValuesList[currCol.colIdx]
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
    await page.goto(process.env.SPREADSHEET_URL ?? "");
    await page.getByRole('button', { name: 'Viernes 29/05/' }).click();

    const columnNameList = await getAlarmNameIdxList(page) // list with the column names and indices
    // Todo: Search all columns for start and end of each name
    const rowValuesList = await getRowValues(page, userID, columnNameList.length) // Array with all the values of one specific userID
    console.log("This is the rowValues: ", rowValuesList)
    const alarmList = await fillAlarmStartEnd(rowValuesList, columnNameList, userID)
    console.log("Now have list with idx and names: ", alarmList)

    // Select the text that appeared at the top bar which really exists in the DOM
    // The text isnide of the cells has to be accessed over the Google API with authorization of the organization
    // By selecting the top bar we circumvent the issue
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
