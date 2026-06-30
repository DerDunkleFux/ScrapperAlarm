<template>
    <!-- <div class="d-flex flex-column min-h-(--main-with-header-footer) flex-grow-1 bg-blue-grey-darken-4 "> -->
    <v-container fluid class="fill-height  bg-blue-grey-darken-4">
        <!-- Display name and options -->
        <v-row justify="space-between">
            <v-col cols="12" sm="5" class="text-headline-medium"> Welcome {{ userName }}</v-col>
            <v-col cols="12" sm="7">
                <div>
                    Reload changes
                </div>
                <div>
                    Add Alarm
                </div>
                <div>
                    Mute / Sound On
                </div>
            </v-col>
        </v-row>

        <!-- justify="center" align-content="center"  -->
        <!-- All Alarms -->


        <v-row justify="start">

            <v-col cols="12" md="6" v-for="(alarm, index) in alarms">
                <alarm-card :ref="(el) => { if (el) alarmCardRefs[index] = el as any }"
                    @child-picker-toggled="handleGlobalPickerLockout" :name="alarm.name" :end="alarm.end || ''"
                    :start="alarm.start || ''" :start-date="formattedDate"></alarm-card>
                <!-- </div> -->
            </v-col>
        </v-row>

    </v-container>
    <!-- </div> -->
</template>

<script setup lang="ts">
import type { Alarm } from '@backend/utils/scrapperUtils';
import { isStringLiteral } from 'typescript';
import AlarmCard from '~/components/AlarmCard.vue';
// const route = useRoute()
const formattedDate = formatQueryDate(useRoute().query.date)
console.log("fetching with date: ", formattedDate)
const response = await useFetch<{
    success: boolean
    data?: Alarm[]
    error?: string
}>('/api/scrape/alarms', {
    method: "GET",
    query: {
        date: formattedDate.toJSON(),
        userID: useCookie("userID"),
    }
})
console.log("got response from in frontend: ", response.data.value)
const userName = ref("Manuel L Jackson")
const alarms: Ref<Alarm[]> = ref([])
const currDate = new Date()
const alarmCardRefs = ref<InstanceType<typeof AlarmCard>[]>([])


if (response.data.value?.success && response.data.value.data) {
    const alarmResult = response.data.value.data
    // console.log("Got alarmresult: ", alarmResult)
    alarms.value = purgeAlarms(alarmResult)
    console.log("Set alarms.value: ", alarms.value)
} else {
    // testData
    alarms.value = [{ name: "test1", startDate: currDate, start: "19:08", end: "19:10" }, { name: "test2", startDate: currDate, start: "15:45", end: "16:05" }]
}


// console.log("Route params: ", useRoute().query)
onMounted(async (val: any) => {
    console.log("Mounted site, got something: ", val)
})

/**
 * Returns a dateobject based on query datastring like 'Domingo 13/06/2026'
 * @param dateString 
 */
function formatQueryDate(dateString: any = null): Date {
    //Todo
    console.log("Typeof dateString: ", typeof dateString === 'string')
    if (!dateString || typeof dateString !== 'string') throw new Error("No Date Param was recieved, could not load alarms");
    console.log("formatting date param: ", dateString)
    const currMatch = dateString.match(/(\d+)\/(\d+)\/(\d+)/)
    if (!currMatch) {
        throw new Error("Date param doesnt match format [dayName-ES] dd/mm/yyyy");
    }
    const day = Number(currMatch[1])
    const month = Number(currMatch[2]) - 1
    const year = Number(currMatch[3])
    return new Date(Date.UTC(year, month, day))

}
/**
 * Returns alarm array without empty start or end fields
 * @param alarms alarm array to be purged
 */
function purgeAlarms(alarms: Alarm[]): Alarm[] {
    if (!alarms) {
        throw new Error("No alarms found for your ID on that day");
    }
    const newAlarms = []
    for (const alarm of alarms) {
        if (alarm.start || alarm.end)
            newAlarms.push(alarm)
    }
    console.log("Returning new alarms: ", newAlarms)
    return newAlarms
}

function handleGlobalPickerLockout() {
    console.log("A time picker was opened somewhere lulz")
    alarmCardRefs.value.forEach((el) => {
        console.log("Should disable timepicker for: ", el)
        el.toggleTimePickers()
    })
}
</script>