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
        
            const formattedDate = new Date(alarmsQueryDate).toISOString().split('T')[0] //yyyy-mm-dd
        const query = `
        SELECT * FROM alarms
        WHERE user_id = '${alarmsQueryUserID}' AND startDate = '${formattedDate}'
        `
        console.log("Looking in DB for alarms with userID: ", alarmsQueryUserID, " and startDate: ", alarmsQueryDate)

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
            await Promise.all(
                currResult.map(async (val: Alarm) => {
                    if (val.start || val.end) {
                        console.log("About to insert : ", val)
                        const insertQuery = `
                            INSERT INTO alarms(
                                user_id,
                                name,
                                start,
                                end,
                                startDate)
                                VALUES(?, ?, ?, ?, ?)
                            `
                        const formattedDate = val.startDate.toISOString().split('T')[0] //yyyy-mm-dd
                        console.log("To insert formattedDate: ", formattedDate)
                        await execute(db, insertQuery, [alarmsQueryUserID, val.name, val.start, val.end, formattedDate])
                    }
                })
            );

            const formattedDate = new Date(alarmsQueryDate).toISOString().split('T')[0] //yyyy-mm-dd

            const query_search = `
                    SELECT * FROM alarms
                    WHERE user_id = '${alarmsQueryUserID}' AND startDate = '${formattedDate}'
                    `
            const query_basic = `
            SELECT * FROM alarms
            WHERE user_id = '${alarmsQueryUserID}'
            `
            const alarms: [] | unknown = await fetchAll(db, query_search)
            const alarms_all: [] | unknown = await fetchAll(db, query_basic)
            console.log("got alarms: ", alarms, " from DB")
            console.log("got Basic Alarms w_o date: ", alarms_all, " from DB")
            if (Array.isArray(alarms) && alarms.length) {
                // Got result
                result = alarms
            }
            // result = [{ name: "test", startDate: new Date() }]
        }
        return { success: true, data: result }
    } catch (e: any) {
        return { success: false, error: e.message || 'Failed to GET Alarms' }
    }
})