<template>
    <!-- <v-container> -->
    <!-- Outer caller has to have v-container -->
    <!-- <div class="h-50 w-50 rounded-lg inset-shadow-sm/50 inset-shadow-white">
        test
     </div> -->
    <!-- inset-shadow-sm/50 inset-shadow-sm/50 inset-shadow-white -->
    <div class="rounded-lg ">
        <!-- :hover="isHover"  -->
        <v-card :variant="cardVariant" class="rounded-lg">
            <v-card-item class="bg-slate-800" prepend-icon="mdi-clock" :title="name">
                <template v-slot:append>
                    <div class="text-body-small px-2">
                        <!-- {{ startDate?.toLocaleDateString("es-ES", {weekday: "long"}) }} -->
                        {{ startDate?.toLocaleDateString("es-ES", { timeZone: "UTC" }) }}
                        <!-- {{ startDate?.getDate() }}/{{ startDate?.getMonth() }}/{{ startDate?.getFullYear() }} -->
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
                        <!-- <v-col cols="12" sm="6" class="text-title-large text-center">
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
                        </v-col> -->

                        <v-col cols="12" md="6" class="text-title-large text-center">
                            <div class="cursor-pointer">
                                {{ start }}
                                <v-menu activator="parent" :close-on-content-click="false">
                                    <v-time-picker :model-value="startTime" @update:model-value="updateTime"
                                        class="custom-compact-picker" rounded="xl">
                                        <!-- <template #actions>
                                            <v-row justify="space-evenly">
                                                <v-col>
                                                    <v-btn class="bg-success">Ok</v-btn>
                                                </v-col>
                                                <v-col>
                                                    <v-btn class="">Cancel</v-btn>
                                                </v-col>
                                            </v-row>
                                        </template> -->
                                    </v-time-picker>
                                </v-menu>
                                {{ startTime }}
                            </div>

                        </v-col>
                        <!-- <v-col cols="12" md="6" class="text-title-large text-center">
                            <div class="cursor-pointer">
                                {{ end }}
                                <v-menu activator="parent" :close-on-content-click="false">
                                    <v-time-picker :v-bind="endTime" @update:model-value="updateTime"
                                        class="custom-compact-picker" rounded="xl">
                                        <template #actions>
                                            <v-row>
                                                <v-col>
                                                    <v-btn class="bg-success">Ok</v-btn>
                                                </v-col>
                                                <v-col>
                                                    <v-btn class="bg-error">Cancel</v-btn>
                                                </v-col>
                                            </v-row>
                                        </template>
                                    </v-time-picker>
                                </v-menu>
                            </div>

                        </v-col> -->
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

<style scoped>
.custom-compact-picker :deep {
    /* Scales the clock graphics cleanly to fit smaller dimensions */
    transform: scale(0.8);
    /* --time-picker-width: 140px !important */
}
</style>
<script setup lang="ts">
import { useVariant, type Variant } from 'vuetify/lib/composables/variant.mjs'
const props = defineProps({
    name: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    /**
     * date of this Alarm in UTC
     */
    startDate: Date
})

const cardVariant: Ref<Variant> = ref("text") //if inactive change to plain
const isActive: Ref<boolean> = ref(true)
const isHover: Ref<boolean> = ref(true)
const isMenuOpen: Ref<boolean> = ref(false)
// const startTime: Ref<any> = ref(props.start)
const { hours: startHours, minutes: startMinutes } = formatTime(props.start)
const { hours: endHours, minutes: endMinutes } = formatTime(props.end)
console.log(startHours)
console.log(endHours)
const startString = String(startHours) + ":" + String(startMinutes).padStart(2,"0")
const endString = String(endHours) + ":" + String(endMinutes).padStart(2,"0")
console.log("StartString is: "+ startString)
console.log("endString is: "+ endString)
const startTime: Ref<any> = ref(startString)
const endTime: Ref<any> = ref()
// const endTime: Ref<any> = ref(String(endHours)+":"+String(endMinutes))
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

function updateTime(e: any) {
    console.log("updated time: ", e)
}
//  Alarm sounding logic

function formatTime(s: string): { hours: Number, minutes: Number } {
    let hours = 0
    let minutes = 0
    hours = Number(s.replace(" ", "").replace(/am/i, "").replace(/pm/i, "").replace(/:(\d+)/, ""))
    minutes = Number(s.replace(" ", "").replace(/am/i, "").replace(/pm/i, "").replace(/(\d+):/, ""))
    if (s.toLowerCase().includes("pm") && hours !== 12) {
        hours + 12
    }

    return { hours, minutes }
}
</script>