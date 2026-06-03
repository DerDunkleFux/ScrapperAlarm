<template>
  <div class="space-y-8">
    <header class="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-5 gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
          Scraped Monitor Logs
        </h1>
        <p class="text-sm text-slate-400 mt-1">
          Viewing automatically sync'd scheduling blocks.
        </p>
      </div>

      <div class="flex items-center gap-2 self-start md:self-auto bg-slate-800/60 border border-slate-700/50 px-3 py-1.5 rounded-xl">
        <span class="relative flex h-2 w-2">
          <span :class="data?.success ? 'bg-emerald-400' : 'bg-rose-400'" class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"></span>
          <span :class="data?.success ? 'bg-emerald-500' : 'bg-rose-500'" class="relative inline-flex rounded-full h-2 w-2"></span>
        </span>
        <span class="text-xs font-mono font-medium text-slate-300">
          {{ data?.success ? 'System Operational' : 'Fetch Alert' }}
        </span>
      </div>
    </header>

    <div v-if="!data?.success" class="bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl p-4 flex items-start gap-3 text-sm">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-rose-400 shrink-0 mt-0.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
      </svg>
      <div>
        <span class="font-bold">Scraper Connectivity Issue:</span>
        <p class="text-xs text-rose-400/90 mt-0.5">
          {{ data?.error || 'Failed to securely map incoming worker payload streams.' }}
        </p>
      </div>
    </div>

    <div v-if="alarms.length === 0" class="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-12 h-12 mx-auto text-slate-600 mb-3">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
      <p class="text-slate-400 text-sm font-medium">No alarms found in this runtime block.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div 
        v-for="alarm in alarms" 
        :key="alarm.name" 
        class="group relative bg-gradient-to-b from-slate-800/80 to-slate-950 border border-slate-800 hover:border-teal-500/40 rounded-2xl p-5 shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
      >
        <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-teal-500/5 to-transparent rounded-bl-full pointer-events-none group-hover:from-teal-500/10 transition-all"></div>

        <div class="flex items-start justify-between gap-4">
          <div class="space-y-3">
            <h3 class="font-bold text-slate-100 group-hover:text-teal-300 transition-colors text-base line-clamp-1">
              {{ alarm.name }}
            </h3>
            
            <div class="flex items-center gap-3 text-xs text-slate-400">
              <div class="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg">
                <span class="text-[10px] uppercase font-bold tracking-wider text-teal-400">Start</span>
                <span class="font-mono text-slate-200 font-semibold">{{ alarm.start }}</span>
              </div>

              <span class="text-slate-600 font-bold">→</span>

              <div class="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg">
                <span class="text-[10px] uppercase font-bold tracking-wider text-emerald-400">End</span>
                <span class="font-mono text-slate-200 font-semibold">{{ alarm.end }}</span>
              </div>
            </div>
          </div>

          <div class="p-2 bg-slate-900 border border-slate-800 rounded-xl text-teal-400/80 group-hover:text-teal-400 group-hover:border-teal-500/20 transition-all shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Alarm } from '@backend/utils/scrapperUtils';

const { data, error: fetchError } = await useFetch('/api/scrape')
// const alarms = [{name: "TestAlarm", start:"8:00 AM", end:"2:00 PM"},{name: "TestAlarm", start:"8:00 AM", end:"2:00 PM"},]
const alarms = ref<Alarm[]>([])
if (data.value && data.value.success) {
    console.log("Got data:")
    console.log(data.value)
    alarms.value = data.value.data
} else {
    console.log("Got error from scraper: ", data.value?.error || fetchError.value)
}
</script>
