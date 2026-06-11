<template>
    <!-- <v-container> -->
    <!-- Outer caller has to have v-container -->
    <!-- <div class="h-50 w-50 rounded-lg inset-shadow-sm/50 inset-shadow-white">
        test
     </div> -->
<!-- inset-shadow-sm/50 inset-shadow-sm/50 inset-shadow-white -->
    <div class="rounded-lg ">
        <v-card :variant="cardVariant" :hover="isHover" class="rounded-lg">
            <v-card-item class="bg-slate-800" prepend-icon="mdi-clock" :title="name">
                <template v-slot:append>
                    <div class="text-body-small px-2">
                        {{ startDate?.getDate() }}/{{ startDate?.getMonth() }}/{{ startDate?.getFullYear() }}
                    </div>
                </template>
            </v-card-item>
            <!-- <v-card-title class="px-4 bg-slate-800 ">

            <div class="text-title-large">
                {{ name }}
            </div>
        </v-card-title> -->
            <div class="bg-sky-900 px-4">

                <v-card-text class="pa-2 ">

                    <v-row class="text-nowrap">
                        <v-col cols="12" sm="6" class="text-title-large text-center">
                            <div>
                                {{ start }}
                            </div>
                            <div class="text-title-small text-center">Start</div>
                        </v-col>
                        <v-col cols="12" sm="6" class="text-title-large text-center ">
                            <div>
                                {{ end }}
                            </div>
                            <div class="text-title-small text-center">End</div>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions class="text-header-large d-flex justify-center">
                    <v-btn class="bg-error">Delete</v-btn>
                    <v-btn v-tooltip="activeTooltipProps" v-if="isActive" @click="toggleActive"
                        class="bg-success">Active</v-btn>
                    <v-btn v-tooltip="inactiveTooltipProps" v-else @click="toggleActive"
                        class="bg-warning">Inactive</v-btn>
                </v-card-actions>
            </div>
        </v-card>
    </div>
    <!-- </v-container> -->
</template>

<script setup lang="ts">
import { useVariant, type Variant } from 'vuetify/lib/composables/variant.mjs'
const props = defineProps({
    name: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    startDate: Date
})

const tooltipProps = {
    openDelay: 400,
}

const inactiveTooltipProps = {
    ...tooltipProps,
    text: "Activate"
}
const activeTooltipProps = {
    ...tooltipProps,
    text: "Deactivate"
}
const cardVariant: Ref<Variant> = ref("text") //if inactive change to plain
const isActive: Ref<boolean> = ref(true)
const isHover: Ref<boolean> = ref(true)

function toggleActive() {
    console.log("Toggling active")
    if (cardVariant.value == "text") {
        cardVariant.value = "plain"
    } else {
        cardVariant.value = "text"
    }
    isActive.value = !isActive.value
    isHover.value = !isHover.value
}
//  Alarm sounding logic
const currDate = new Date()
const { hours: startHours, minutes: startMinutes } = formatTime(props.start)
const { hours: endHours, minutes: endMinutes } = formatTime(props.end)
const alarmStart: Date = new Date()
// TODO get date from each alarm from backend for day, month in case different than today
// Currently only check if alarm hours & minutes is before currentDate set for next day, else set for same day
const testDate = props.startDate
function formatTime(s: string): { hours: Number, minutes: Number } {
    let hours = 0
    let minutes = 0
    if (s.toLowerCase().includes("am")) {
        hours = Number(s.replace(" ", "").replace(/am/i, "").replace(/:(\d+)/, ""))
        minutes = Number(s.replace(" ", "").replace(/am/i, "").replace(/(\d+):/, ""))
    }
    else {
        hours = Number(s.replace(" ", "").replace(/pm/i, "").replace(/:(\d+)/, ""))
        minutes = Number(s.replace(" ", "").replace(/pm/i, "").replace(/(\d+):/, ""))
    }
    return { hours, minutes }
}
</script>