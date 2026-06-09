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


        <v-row justify="space-evenly" >
            
            <v-col cols="6" md="3" v-for="alarm in alarms" >
                <alarm-card :name="alarm.name" :end="alarm.end || ''" :start="alarm.start || ''" :start-date="currDate"></alarm-card>
                <!-- </div> -->
            </v-col>
        </v-row>

    </v-container>
    <!-- </div> -->
</template>

<script setup lang="ts">
import type { Alarm } from '@backend/utils/scrapperUtils';
import { v } from 'vue-router/dist/index-BQLwgiyK.js';
import AlarmCard from '~/components/AlarmCard.vue';

const userName = ref("Manuel L Jackson")
const route = useRoute()
const currDate = new Date()
console.log("CurrDate in Alarm: ", currDate)
const alarms: Alarm[] = [
    { name: "Alarm 1", start: "8:00 AM", end: "9:00 AM"  , startDate: currDate },
    { name: "Alarm 2", start: "10:15 AM", end: "11:30 AM", startDate: currDate },
    { name: "Alarm 3", start: "12:00 PM", end: "01:00 PM", startDate: currDate },
    { name: "Alarm 4", start: "12:00 PM", end: "01:00 PM", startDate: currDate },
    { name: "Alarm 5", start: "02:00 PM", end: "03:00 PM", startDate: currDate },
    { name: "Alarm 6", start: "02:00 PM", end: "03:00 PM", startDate: currDate },
]

console.log("got route: ", route)
onMounted((val: any) => {
    console.log("Mounted site, got something: ", val)
})
</script>