<template>
        <!-- <div fluid class="d-flex fill-height flex-grow-1 bg-blue-grey-darken-4">
          <div> ehh about?</div>
        </div> -->
<!-- <AppHeader app></AppHeader>
<v-main>
    <v-container fluid class="pa-0 bg-red">
        <div> In custom!</div>
        <v-text-field>Input smth pls</v-text-field>
        </v-container>
    </v-main> -->
  <!-- <AppHeader app></AppHeader> -->
    <v-container fluid class="bg-blue-grey-darken-4 fill-height align-start pa-6">
    <div class="text-h4 text-white font-weight-bold">About This Platform</div>
  </v-container>
</template>

<script setup lang="ts">
// definePageMeta({
//   layout
//   : 'custom',
// })
import type { Alarm } from '@backend/utils/scrapperUtils';
useFetch('/api/scrape/testDB', {
  method: 'GET',
  query: {
    name: 'Manuel'
  }
})
// const { data, error: fetchError } = await useFetch('/api/scrape')
// // const alarms = [{name: "TestAlarm", start:"8:00 AM", end:"2:00 PM"},{name: "TestAlarm", start:"8:00 AM", end:"2:00 PM"},]
// const alarms = ref<Alarm[]>([])
// if (data.value && data.value.success) {
//     console.log("Got data:")
//     console.log(data.value)
//     alarms.value = data.value.data
// } else {
//     console.log("Got error from scraper: ", data.value?.error || fetchError.value)
// }
</script>
