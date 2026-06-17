import { Alarm } from "@backend/utils/scrapperUtils";
import { getAlarmData, getAvailableDates } from "../../../../src/scraper"

export default defineEventHandler(async (event): Promise<
    { success: true; data: Alarm[] } | { success: false; error: string }> => {
    try {
        
        const alarmsQuery = getQuery(event)
        console.log("Got this alarmsQuery: ", alarmsQuery)
        const alarmsQueryDate = alarmsQuery.date as string
        const alarmsQueryUserID = alarmsQuery.userID as string
        if (!alarmsQueryDate)
            throw new Error("Got no 'date' param in the /api/scrape/alarms/ request");
        const result = await getAlarmData(alarmsQueryDate, alarmsQueryUserID)
        
        return { success: true, data: result }
    } catch (e: any) {
    return { success: false, error: e.message || 'Failed to GET Alarms' }
  }
})