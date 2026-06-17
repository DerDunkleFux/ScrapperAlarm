<template>
    <!-- <div class="d-flex flex-column min-h-(--main-with-header-footer) flex-grow-1  "> -->
    <div class="d-flex flex-column fill-height align-center flex-grow-1 bg-blue-grey-darken-4">
        <v-row justify="center" align-content="center" class="fill-height w-1/2 flex-grow-1">
            <v-col class="text-center w-full " cols="12">

          
                <!-- <div class="h-5"></div> -->


                <v-card class="elevation-6 rounded-lg d-flex flex-column pa-6 " color="" variant="outlined">
                    <v-card-item class="text-center flex-grow-0">
                        <v-card-title class="text-h5 font-weight-bold">Welcome to your alarms!</v-card-title>
                        <v-card-subtitle>Enter your ID and select a date to access the dashboard</v-card-subtitle>
                    </v-card-item>

                    <v-card-text class="d-flex flex-column justify-between flex-grow-1">
                        <v-form validate-on="submit" v-model="formValue"
                            class="d-flex flex-column justify-space-between fill-height"
                            @submit.prevent="handleFormSubmit">


                            <!-- User ID Field -->

                            <!-- if no userIdCookie -->
                            <div v-if="!userIdCookie" class="w-100 flex-grow-1" offset="2">
                                <v-spacer></v-spacer>
                                <v-text-field @update:model-value="onUserIDChange" label="User ID" :rules="userIDRules"
                                    prepend-inner-icon="mdi-account" variant="outlined" class="mb-4" />
                            </div>
                            <!-- If userIdCookie is set -->
                            <div v-else class="w-100 flex-grow-1" offset="2">
                                <div class="text-headline-medium text-bold mb-4"> Welcome user with id: {{ userIdCookie
                                    }}</div>
                            </div>
                            <div class="text-start font-thin mb-2 italic"> Please select a valid date
                            </div>
                            <v-spacer></v-spacer>

                            <div class="w-100">

                                <v-row v-if="datesRef.length === 1">
                                    <v-col v-for="date in datesRef" cols="12" md="12">
                                        <v-btn class="date-btn-wrap" type="submit" color="primary" block size="large"
                                            @click="chosenDate = date">
                                            {{ date }}
                                        </v-btn>
                                    </v-col>
                                </v-row>
                                <v-row v-else-if="datesRef.length">
                                    <v-col v-for="date in datesRef" cols="12" md="6">
                                        <v-btn class="date-btn-wrap" type="submit" color="primary" block size="large"
                                            @click="chosenDate = date">
                                            {{ date }}
                                        </v-btn>
                                    </v-col>
                                </v-row>
                                <div v-else>
                                    <v-btn loading :active="false">If doesn't load, contact IT please</v-btn>
                                </div>
                            </div>
                            <v-spacer></v-spacer>
                        </v-form>
                    </v-card-text>

                </v-card>
                <div class="h-5"></div>
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
    </div>

    <!-- </div> -->
</template>


<script setup lang="ts">

definePageMeta({
    layout
        : 'default',
})
const formValue = ref<any>(null)
const chosenDate: Ref<string> = ref("")
const datesRef: Ref<string[]> = ref([])
const userIdCookie = useCookie("userID", { maxAge: 60 * 60 * 12, secure: process.env.NODE_ENV === 'production' })

onMounted(async () => {
    // Load data for buttons
    datesRef.value = await createDateButtonData() || []

    //testData
    // datesRef.value = ["FuckMe 12/06/2026",]
})

const userIDRules = [
    (value: string | any) => {
        console.log("Testing rule in userID with value: ", value)
        if (value?.length >= 3) return true
        return 'First name must be at least 3 characters.'
    },
]

const userID = ref(userIdCookie.value || "")
function onUserIDChange(e: string) {
    console.log("Wrote userID and got value: ")
    console.log(e)
    userID.value = e
}

async function handleFormSubmit(e: any) {
    const event = await e

    if (event.valid) {
        console.log("The form passed!")
        console.log("Navigating to /alarm with params: date: ", chosenDate.value)
        userIdCookie.value = userID.value
        await navigateTo({
            path: '/alarm',
            query: {
                date: chosenDate.value
            }
        })
    } else {
        console.log("Form failed")
    }
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
        console.log(response)
        return response.data
    } else {
        console.log("Got error from scraper: ", response?.error)
    }
    return null
}

async function createDateButtonData() {
    const dateTexts: string[] = []
    console.log("OnMounted login")
    const resultDates = await getAvailableDates()
    console.log("Got resultDates: ", resultDates)
    if (!resultDates)
        return

    for (const rawDate of resultDates) {
        const currDate = new Date(rawDate)
        const dayWord = currDate.toLocaleDateString('en-US', { weekday: "long" })
        const dayNumber = String(currDate.getDate()).padStart(2, "0")
        const monthNumber = String(currDate.getMonth() + 1).padStart(2, "0")
        const yearNumber = String(currDate.getFullYear())
        dateTexts.push(dayWord + " " + dayNumber + "/" + monthNumber + "/" + yearNumber)
    }
    return dateTexts
}

</script>