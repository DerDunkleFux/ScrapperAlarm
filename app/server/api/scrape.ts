// import { Alarm } from "@backend/utils/scrapperUtils"
// import { getAlarmData, getAvailableDates } from "../../../src/scraper"

// export default defineEventHandler(async (event): Promise<
//   { success: true; data: Alarm[] } | { success: false; error: string }> => {
//   console.log("Called scrape.ts")
//   let result: Alarm[] = []
//   try {
//     result = await getAlarmData()
//     return { success: true, data: result}
//   } catch (e: any) {
//     return { success: false, error: e.message || 'Unknown error occurred'}
//   }

// })