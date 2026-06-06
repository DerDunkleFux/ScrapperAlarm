<template>
    <div  class="d-flex flex-column min-h-(--main-with-header-footer) flex-grow-1 bg-blue-grey-darken-4 ">
        <v-container fluid class="d-flex flex-column fill-height align-center flex-grow-1">
            <v-row justify="center" align-content="center" class="fill-height w-5/6 flex-grow-1">
                <v-col class="text-center w-full " cols="12" >
                    <v-card class="elevation-6 rounded-lg d-flex flex-column pa-6 " color=""
                        variant="outlined">
                        <v-card-item class="text-center flex-grow-0">
                            <v-card-title class="text-h5 font-weight-bold">Welcome to your alarms!</v-card-title>
                            <v-card-subtitle>Enter your ID and select a date to access the dashboard</v-card-subtitle>
                        </v-card-item>

                        <v-card-text class="mt-6 d-flex flex-column justify-between flex-grow-1">
                            <v-form class="d-flex flex-column justify-space-between fill-height"
                                :disabled="formDisabled" validate-on="lazy">
                                <v-spacer></v-spacer>
                                <!-- User ID Field -->
                                <div class="w-100 flex-grow-1" offset="2">
                                    <v-text-field @update:model-value="onUserIDChange" label="User ID"
                                        :rules="userIDRules" prepend-inner-icon="mdi-account" variant="outlined"
                                        class="mb-4" />
                                </div>
                                <div class="text-start font-thin mb-2 italic"> Please select a valid date
                                </div>
                                <v-spacer></v-spacer>

                                <div class="w-100">

                                    <v-row v-if="dates.length">
                                        <v-col v-for="date in dates" cols="12" sm="6">
                                            <v-btn color="primary" block size="large" @click="clickDate(date, $event)"
                                                submit>
                                                {{ date }}
                                            </v-btn>
                                        </v-col>
                                    </v-row>
                                    <div v-else>
                                        <v-btn :active="false">No valid date found, contact it</v-btn>
                                    </div>
                                </div>
                                <v-spacer></v-spacer>
                            </v-form>
                        </v-card-text>

                    </v-card>
                </v-col>
            </v-row>
            <!-- <v-row>
                <v-col>

                    <div class="bg-alarm-safe text-white pa-2 rounded"> ehhhm new color?</div>
                </v-col>
            </v-row> -->
                   <!-- Use this to insert a new line -->


<!-- 
          <v-row justify="end" align="end" class="flex-grow-0"> 
                <v-col class="text-end">
                    <div> about </div>
                </v-col> -->
        </v-container>

    </div>
</template>

<script setup lang="ts">

import type { Mouse } from 'playwright'

const formDisabled = ref(false)
const userIDRules = [
    (value: string | any[]) => {
        console.log("Testing rule in userID with value: ", value)
        if (value?.length >= 3) return true
        return 'First name must be at least 3 characters.'
    },
]
// const userID = ref("")
function onUserIDChange(e: String) {
    console.log("Wrote userID and got value: ")
    console.log(e)
}
function realoadDates() {
    console.log("Should reload dates")
}

function clickDate(date: string, event: MouseEvent) {
    console.log('Clicked date text:', date)

    // Now you have complete access to the event properties
    console.log('Native event target:', event.target)
}
/**
 * 
 * @returns Promise of Date array or empty array if none found
 */
async function getAvailableDates(): Promise<string[] | null> {
    // currently opens playwright everytime this page gets loaded
    // TODO: change data to a sqlite db and only run playwright on special request or once every 2 hours via microservice or smth
    const response = await $fetch('/api/scrape/dates')
    console.log("Trying to load available dates")
    if (response && response.success) {
        console.log("Got data looking for dates:")
        console.log(response.data)
        return response.data
    } else {
        console.log("Got error from scraper: ", response?.error)
    }
    return null
}

const dates: Ref<string[]> = ref([])
async function createDateButtonData() {
    console.log("OnMounted login")
    const resultDates = await getAvailableDates()
    console.log("Got resultDates: ", resultDates)
    if (!resultDates)
        return
    dates.value = []
    for (const rawDate of resultDates) {
        const currDate = new Date(rawDate)
        const dayWord = currDate.toLocaleDateString('es-ES', { weekday: "long" })
        const dayNumber = String(currDate.getDate()).padStart(2, "0")
        const monthNumber = String(currDate.getMonth() + 1).padStart(2, "0")
        const yearNumber = String(currDate.getFullYear())
        dates.value.push(dayWord + " " + dayNumber + "/" + monthNumber + "/" + yearNumber)
    }
}
onMounted(async () => {
    // Load data for buttons
    createDateButtonData()
})
</script>