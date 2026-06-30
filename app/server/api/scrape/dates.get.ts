import { getAlarmData, getAvailableDates } from "../../../../src/scraper"

export default defineEventHandler(async (event): Promise<
    { success: true, data: Date[] } | { success: false, error: string }> => {

    try {
            
        const result = await getAvailableDates()

        return { success: true, data: result }
    } catch (e: any) {
        return {success: false, error: e.message || "Failed to GET available dates"} 

    }
})