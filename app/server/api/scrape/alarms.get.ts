import { Alarm } from "@backend/utils/scrapperUtils";
import {
    getAlarmData as scrapeGetAlarmData, getAvailableDates
} from "../../../../src/scraper"

export default defineEventHandler(async (event): Promise<
    { success: true; data: Alarm[] } | { success: false; error: string }> => {
    try {

        const alarmsQuery = getQuery(event)
        console.log("Got this alarmsQuery: ", alarmsQuery)
        const alarmsQueryDate = alarmsQuery.date as string
        const alarmsQueryUserID = alarmsQuery.userID as string
        if (!alarmsQueryDate)
            throw new Error("Got no 'date' param in the /api/scrape/alarms/ request");
        // See if data exists on DB (Alarms for this day for this user)
        const alarmsDate = new Date(alarmsQueryDate)
        const query = `
        SELECT * FROM alarms
        WHERE user_id = '${alarmsQueryUserID}' AND start_date = '${alarmsQueryDate}'
        `
        console.log("Looking in DB for alarms with userID: ", alarmsQueryUserID, " and start_date: ", alarmsQueryDate)

        const alarms: [] | unknown = await fetchAll(db, query)
        console.log("got alarms: ", alarms, " from DB")
        let result = []
        if (Array.isArray(alarms) && alarms.length) {
            // Got result
            result = alarms
        } else {
            // no entry in DB, scrape and write into DB
            const currResult = await scrapeGetAlarmData(alarmsQueryDate, alarmsQueryUserID)
            console.log("Finished Scraping about to insert all of the values in the db")
            currResult.map(async (val: Alarm) => {
                const insertQuery = `
                INSERT INTO alarms(
                    user_id,
                    name,
                    start_time,
                    end_time ,
                    start_date)
                     VALUES(?, ?, ?, ?, ?)
                `
                await execute(db, insertQuery, [alarmsQueryUserID, val.name, val.start, val.end, val.startDate])
            })
        }
        result = [{ name: "test", startDate: new Date() }]
        return { success: true, data: result }
    } catch (e: any) {
        return { success: false, error: e.message || 'Failed to GET Alarms' }
    }
})