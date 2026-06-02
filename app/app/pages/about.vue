<template>
    <div>
        <h1>
        In About LOL
        </h1>

        <li v-for="alarm in alarms">
            {{alarm.name}}
        </li>


    </div>
 
</template>

<script setup lang="ts">
import type { Alarm } from '@backend/utils/scrapperUtils';

const { data, error: fetchError } = await useFetch('/api/scrape')
// const alarms = [{name: "TestAlarm", start:"8:00 AM", end:"2:00 PM"},{name: "TestAlarm", start:"8:00 AM", end:"2:00 PM"},]
const alarms = ref<Alarm[]>([])
if (data.value && data.value.success) {
    alarms.value = data.value.data
} else {
    console.log("Got error from scraper: ", data.value?.error || fetchError.value)
}
</script>
