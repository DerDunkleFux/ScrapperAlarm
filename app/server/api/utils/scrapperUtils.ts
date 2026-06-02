import { Page } from "playwright";

/**
 * Type of the alarm = 
 */
export type Alarm = {
    name: string;
    idxStart?: number;
    idxEnd?: number;
    start?: string | null;
    end?: string | null;
}
/**
 * Default delay to be used in any input or click action on the page, so the browser can load
 */
const delay = 75
/**
 * Selects the text that appeared at the top bar upon selecting a cell. 
 * If no value was found throws error "Could not read cell value" [TODO Find out at what cell we were for error log]
 * 
 * The text inside of cells would have to be accessed over the Google API with authorization of the organization.
 * By selecting the cell and reading the top bar we avoid the Google Api
 * @param page 
 */

export async function getCurrCellData(page: Page): Promise<string> {
    const result = await page.locator('#t-formula-bar-input').textContent();
    if (result === null) {
        throw new Error("Could not read cell value from #t-formula-bar-input");
    }
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
export async function getCellValueByIdx(page: Page, currIdx: number, maxColIdx?: number): Promise<{ cellValue: string | null, idx: number }> {
    const oldValue = await getCurrCellData(page);
    await page.keyboard.press('ArrowRight', { delay: delay });
    const newValue = await getCurrCellData(page);
    if ((oldValue === newValue && maxColIdx == undefined) || currIdx === maxColIdx) {
        // return null when oldValue == newValue or if maximum Column Id is given
        return { cellValue: null, idx: currIdx };
    }
    return { cellValue: newValue, idx: currIdx + 1 }
}




export async function getValidDates(page: Page): Promise<Date[]> {
    const yearNumber = String(new Date().getFullYear())
    const toolbarLocator = page.locator(".docs-sheet-container-bar [role='button']");
    const tabs = await toolbarLocator.all()
    const resultList: Date[] = []
    for (const tab of tabs) {
        const text = await tab.locator(".docs-sheet-tab-name").innerText()
        const currMatch = text.match(/(\d+)\/(\d+)\/(\d+)/)
        if (currMatch) {
            const day = Number(currMatch[1])
            const month = Number(currMatch[2]) - 1
            const year = Number(currMatch[3])
            const newDate = new Date(year,month,day)
            resultList.push(newDate)
        }
    }
    return resultList
}

/**
 * opens the spreadsheet page at the given date.
 * If Date doesnt exist throws error
 * @param page 
 * @param date 
 */
export async function openSchedulePageByDate(page: Page, date: Date = new Date()) {
    // Create the correct format of the search date
    const dayNumber = String(date.getDate()).padStart(2,"0")
    const monthNumber = String(date.getMonth() + 1).padStart(2,"0")
    const dayWord = date.toLocaleDateString('es-ES', { weekday: "long" })
    const yearNumber = date.getFullYear() 
    // e.g 'lunes 01/06/2026' or 'Lunes ...'
    const formattedDate = `${dayWord} ${dayNumber}/${monthNumber}/${yearNumber}` 

    let buttonLocator = await page.getByRole('button', { name: formattedDate, exact: false })
    // Check if button exists, if not, the given date doesn't exist and we need to give the user the existing options to open the site
    if (! await buttonLocator.count()) {
        throw new Error("Could not find the button with date: " + formattedDate + " on Spreadsheet");
    }
    await buttonLocator.click({ delay: delay });
}

/**
 * Retrieves all column names and their corresponding idx
 * 
 * returns promise with array of object with name and idx 
 */
export async function getColumns(page: Page): Promise<{ name: string, idx: number }[]> {
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
    }

    return columnNameList
}

/**
 * Searches for userID and returns the whole row in an Array
 * @param page 
 * @param userID 
 * @returns promise of array with all of the cellvalues corresponding to that userID
 */
export async function getRowValues(page: Page, userID: string, maxColIdx: number): Promise<string[]> {

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
export async function getAlarmList(rowValuesList: string[], columnNameList: { name: string; idx: number; }[], userID: string): Promise<Alarm[]> {
    const alarmList: Alarm[] = []

    for (const currCol of columnNameList) {
        let currAlarm: Alarm

        // special case: Offline activity end is before offline activity 2 start and offline activity 2 end, 
        // TODO: FIX excel sheet and THEN REMOVE this fix 

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
            const foundAlarm = alarmList.find(findAlarm => findAlarm.name == currEndName)
            if (foundAlarm != undefined) {
                foundAlarm.idxEnd = currCol.idx
                foundAlarm.end = rowValuesList[currCol.idx]
            }
            continue
        }
        else if (lowerName.includes("offline activity 2 end")) {
            // This column is currently never being used
            continue
        }
        // End of fix

        if (currCol.name.toLowerCase().includes("start")) {
            // create new Alarm if column name has "start" 
            currAlarm = {
                idxStart: currCol.idx,
                name: currCol.name.replace(/ (start|end)/i, ""),
                start: rowValuesList[currCol.idx]
            }
            alarmList.push(currAlarm)

        } else if (currCol.name.toLowerCase().includes("end")) {
            // Find corresponding start by name and add data
            const currEndName = currCol.name.replace(/ (start|end)/i, "")
            const foundAlarm = alarmList.find(findAlarm => findAlarm.name == currEndName)
            if (foundAlarm != undefined) {
                foundAlarm.idxEnd = currCol.idx
                foundAlarm.end = rowValuesList[currCol.idx]
            }
            else {
                throw new Error("Got " + currEndName + " alarm end but no start");
            }
        }
    }

    return alarmList
}