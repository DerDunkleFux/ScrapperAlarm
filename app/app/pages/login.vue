<template>
    <v-app-bar style="">
        <v-app-bar-title>
            <v-icon icon="mdi-clock"></v-icon> YourAlarms
        </v-app-bar-title>
        <template #append>
            <v-btn prepend-icon="mdi-update" @click="realoadDates()">Reload Dates</v-btn>
        </template>
    </v-app-bar>

    <v-main class="d-flex flex-column h-screen">
        <v-container fluid class="bg-orange fill-height d-flex flex-column  align-center">
            <v-row justify="center" align-content="center" class="fill-height w-5/6">
                <v-col class="text-center w-full" cols="12">
                    <v-card class="elevation-6 rounded-lg ">
                        <v-card-item class="text-center">
                            <v-card-title class="text-h5 font-weight-bold">Welcome to your alarms!</v-card-title>
                            <v-card-subtitle>Enter your ID and select a date to access the dashboard</v-card-subtitle>
                        </v-card-item>

                        <v-card-text class="mt-4">
                            <v-form>
                                <v-text-field @update:model-value="onUserIDChange" label="User ID"
                                    prepend-inner-icon="mdi-account" variant="outlined" class="mb-4" />
                                <div v-if="dates.length">
                                    <v-btn color="primary" block size="large" v-for="date in dates">
                                        {{ date }}
                                    </v-btn>
                                </div>
                                <div v-else>
                                    <v-btn :active="false"> No valid date found, contact it</v-btn>
                                </div>
                            </v-form>
                        </v-card-text>

                    </v-card>
                </v-col>
            </v-row>
            <!-- <v-row>
                <v-col>
                   <div>
                        test 2
                   </div>
                </v-col>
            </v-row> -->

            <!-- <v-row justify="end" align="end" class="flex-grow-0"> 
                <v-col class="text-end">
                    <div> about </div>
                </v-col>
            </v-row> -->
        </v-container>
        <v-footer class="justify-end bg-blue px-6 py-2 flex-grow-0">
            <div> about </div>
        </v-footer>
    </v-main>
</template>

<script setup lang="ts">

// const userID = ref("")
function onUserIDChange(e: String) {
    console.log("Wrote userID and got value: ")
    console.log(e)
}
function realoadDates() {
    console.log("Should reload dates")
}


/**
 * 
 * @returns Promise of Date array or empty array if none found
 */ 
async function getAvailableDates(): Promise<string[] | null> {

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

const dates: Ref<string[]>= ref([])

onMounted(async () => {
    console.log("OnMounted login")
    const resultDates = await getAvailableDates()
    console.log("Got resultDates: ", resultDates)
    if (!resultDates) 
        return
    dates.value = []
    for (const rawDate of resultDates) {
        const currDate = new Date(rawDate)
        const dayWord = currDate.toLocaleDateString('es-ES', { weekday: "long" })
        const dayNumber = String(currDate.getDate()).padStart(2,"0")
        const monthNumber = String(currDate.getMonth() + 1).padStart(2, "0")
        const yearNumber = String(currDate.getFullYear())
        dates.value.push(dayWord + " " + dayNumber + "/" + monthNumber + "/"+ yearNumber)
    }
})
</script>