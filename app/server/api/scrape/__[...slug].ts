import { Alarm } from "@backend/utils/scrapperUtils"
import { getAlarmData, getAvailableDates } from "../../../../src/scraper"

/**
 * Used to catch the incoming api endpoint and redirect to correct function. eg. /api/scrape/alarms calls getAlarmData in src/scraper.ts
 */
const handlers: Record<string, (arg?: any, args?: any) => Promise<any>> = {
  'alarms': (dateString: string, userId: string) => getAlarmData(dateString, userId),
  'dates': getAvailableDates
}


export default defineEventHandler(async (event): Promise<
  { success: true; data: any } | { success: false; error: string }> => {

  const slug = event.context.params?.slug
  console.log(`[Router] Catch-all route hit for path: /api/scrape/${slug}`)

  const handler = slug ? handlers[slug] : null;

  if (!handler) {
    return {
      success: false,
      error: `Scraper action '${slug}' not found. Available endpoints: ${Object.keys(handlers).join(', ')}`,
    }
  } try {
    let result
    switch (slug) {
      case 'alarms':
        const alarmsQuery = getQuery(event)
        console.log("Got this alarmsQuery: ", alarmsQuery)
        const alarmsQueryDate = alarmsQuery.date as string
        const alarmsQueryUserID = alarmsQuery.userID as string
        if (!alarmsQueryDate)
          throw new Error("Got no 'date' param in the /api/scrape/alarms/ request");
        result = await handler(alarmsQueryDate, alarmsQueryUserID)
        break;
      default:
        result = await handler()
        break;
    }
    console.log("got result from slug: ",result)
    return { success: true, data: result }
  } catch (e: any) {
    return { success: false, error: e.message || 'Backend execution failure' }
  }
})