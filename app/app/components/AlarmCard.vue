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

                        <!-- Start time picker -->
                        <v-col>
                            <alarm-time-picker ref="startTimePickerRef"
                                @time-picker-toggled="emit('childPickerToggled')" :time="startTime" :name="props.name"
                                :alarm-sound="alarmSound">

                            </alarm-time-picker>
                            <!-- <v-menu v-model="isStartMenuOpen" :persistent="true" :close-on-content-click="false"
                                :stick-to-target="true">
                                <template v-slot:activator="{ props: startMenuProps }">
                                    <div class="cursor-pointer text-center text-5xl" v-bind="startMenuProps"
                                        @click="onOpenTimePicker($event, startMenuProps.onClick, 'start')">
                                        {{ startTime }}
                                    </div>
                                </template>
                                <v-time-picker v-model="startTime" class="custom-compact-picker" rounded="xl">

                                    <template #actions>
                                        <v-row justify="end" class="center-text">
                                            <v-col>
                                                <v-btn size="large" id="menu-activator" class="bg-success">Ok</v-btn>
                                            </v-col>
                                            <v-col>
                                                <v-btn size="large" class="bg-error"
                                                    @click="cancelTimePicker">Cancel</v-btn>
                                            </v-col>
                                        </v-row>
                                    </template>
                                </v-time-picker>
                            </v-menu> -->
                        </v-col>

                        <!-- End time Picker -->
                        <v-col>
                            <alarm-time-picker ref="endTimePickerRef" @time-picker-toggled="emit('childPickerToggled')"
                                :time="endTime" :name="props.name" :alarm-sound="alarmSound">

                            </alarm-time-picker>
                            <!-- <v-menu v-model="isEndMenuOpen" :persistent="true" :close-on-content-click="false">
                                <template v-slot:activator="{ props: endMenuProps }">
                                    <div class="cursor-pointer text-center text-5xl" v-bind="endMenuProps"
                                        @click="onOpenTimePicker($event, endMenuProps.onClick, 'end')">
                                        {{ endTime }}
                                    </div>
                                </template>
                                <v-time-picker v-model="endTime" class="custom-compact-picker" rounded="xl">

                                    <template #actions>
                                        <v-row justify="end" class="center-text">
                                            <v-col>
                                                <v-btn size="large" id="menu-activator" class="bg-success"
                                                    @click="confirmTimePicker">Ok</v-btn>
                                            </v-col>
                                            <v-col>
                                                <v-btn size="large" class="bg-error"
                                                    @click="cancelTimePicker">Cancel</v-btn>
                                            </v-col>
                                        </v-row>
                                    </template>
                                </v-time-picker>
                            </v-menu> -->
                            <!-- {{ startTime }} -->

                        </v-col>
                        <!-- <div class="cursor-pointer">
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
                        </div> -->

                    </v-row>

                </v-card-text>
                <v-card-actions class="text-header-large d-flex justify-center text-5xl">
                    <v-row>
                        <v-col>
                            <v-btn block class="bg-error">Delete</v-btn>
                        </v-col>
                        <v-col>
                            <v-btn block v-tooltip="activeTooltipProps" v-if="isActive" @click="toggleActive"
                                class="bg-success text-5xl">Active</v-btn>
                            <v-btn block v-tooltip="inactiveTooltipProps" v-else @click="toggleActive"
                                class="bg-warning">Inactive</v-btn>
                        </v-col>
                    </v-row>
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
import { start } from 'node:repl'
import { type Variant } from 'vuetify/lib/composables/variant.mjs'
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
const isStartMenuOpen: Ref<boolean> = ref(false)
const isEndMenuOpen: Ref<boolean> = ref(false)
// const startTime: Ref<any> = ref(props.start)
const { hours: startHours, minutes: startMinutes } = getHoursMinutesFromString(props.start)
const { hours: endHours, minutes: endMinutes } = getHoursMinutesFromString(props.end)

const startString = String(startHours).padStart(2, "0") + ":" + String(startMinutes).padStart(2, "0")
const endString = String(endHours).padStart(2, "0") + ":" + String(endMinutes).padStart(2, "0")
/**
 * Real value when this alarm starts, display and editable in format HH:MM
 */
const startTime: Ref<string> = ref(startString)

/**
 * Real value when this alarm ends, display and editable in format HH:MM
 */
const endTime: Ref<string> = ref(endString)
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

const tmpTime: { time: string | null, source: "start" | "end" | null } = { time: null, source: null }
const startAlarmTimeoutId: Ref<NodeJS.Timeout | undefined> = ref()
const endAlarmTimeoutId: Ref<NodeJS.Timeout | undefined> = ref()
import AlarmTimePicker from '~/components/AlarmTimePicker.vue' // Adjust import path

// 1. Declare the exact instance type shape exposed by your child component
type TimePickerInstance = InstanceType<typeof AlarmTimePicker>
const startTimePickerRef = ref<TimePickerInstance | null>()
const endTimePickerRef = ref<TimePickerInstance | null>()

const alarmSound = ref()
onMounted(() => {
    alarmSound.value = '/alarmSounds/defaultAlarm.mp3' // to be able to change alarmsounds in future

})

const emit = defineEmits<{
    (e: 'childPickerToggled'): void
}>()

defineExpose({ toggleTimePickers, })
function toggleTimePickers() {
    startTimePickerRef.value?.toggleTimePicker()
    endTimePickerRef.value?.toggleTimePicker()
}

function onOpenTimePicker(e: Event, propsFunction: Function, source: "start" | "end") {
    console.log("opening time picker menu")
    if (!e.target || !(e.target instanceof HTMLElement)) {
        console.log("Event was no div with innerHTML time value!")
        console.log(e)
        return
    }
    console.log("Event.target.html: ", e.target.innerHTML)
    console.log("Function: ", propsFunction)
    if (source === "start") {
        console.log("isStartMenuOpen? ", isStartMenuOpen.value)
        // isStartMenuOpen.value = true

    } else {
        console.log("isEndMenuOpen? ", isEndMenuOpen.value)
    }

    // TODO temporary save old time value and if it cancels revert to it, othgerwise save to persistent
    tmpTime.time = e.target.innerHTML
    tmpTime.source = source

    // prevent all other clocks from being opened hmm
}

function cancelTimePicker(e: Event) {
    console.log("Should close and cancel menu")
    e.stopPropagation(); // since closing the v-menu with the v-model, and without the menu props, the event propagation has to be stopped manually
    if (tmpTime.source === "start") {
        isStartMenuOpen.value = false
        console.log("closed startMenu")
    } else {
        isEndMenuOpen.value = false
        console.log("closed endMenu")
    }

    if (tmpTime.source === "start" && tmpTime.time !== null) {
        startTime.value = tmpTime.time
    } else if (tmpTime.source === "end" && tmpTime.time !== null) {
        endTime.value = tmpTime.time
    }

    // clear tmp saved value to avoid accidental access
    tmpTime.source = null
    tmpTime.time = null
}

function confirmTimePicker() {
    console.log("Confirm new time")
    // clear tmp saved value to avoid accidental access
    tmpTime.source = null
    tmpTime.time = null

    if (tmpTime.source === "start") {
        isStartMenuOpen.value = false
    } else {
        isEndMenuOpen.value = false
    }

    deactivateAlarm() // Delete alarm with old startTime.value
    activateAlarm() // Activate alarm with new value

    //TODO when DB is implemented, update db alarm value with startTime.value and endTime.value
}

function toggleActive() {
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

function getHoursMinutesFromString(s: string): { hours: number, minutes: number } {
    let hours = 0
    let minutes = 0
    hours = Number(s.replace(" ", "").replace(/am/i, "").replace(/pm/i, "").replace(/:(\d+)/, ""))
    minutes = Number(s.replace(" ", "").replace(/am/i, "").replace(/pm/i, "").replace(/(\d+):/, ""))
    if (s.toLowerCase().includes("pm") && hours !== 12) {
        hours = hours + 12
    }

    return { hours, minutes }
}




function activateAlarm(): { startAlarmId: NodeJS.Timeout | undefined, endAlarmId: NodeJS.Timeout | undefined } {
    const currTime = new Date()
    //startTime is format HH:MM
    const { hours: startHours, minutes: startMinutes } = getHoursMinutesFromString(startTime.value)
    const alarmStartDate: Date = new Date(currTime.getFullYear(), currTime.getMonth(), currTime.getDate(), startHours, startMinutes)
    const startDeltaTime = alarmStartDate.getTime() - currTime.getTime()
    const alarmEndDate: Date = new Date(currTime.getFullYear(), currTime.getMonth(), currTime.getDate(), endHours, endMinutes)
    const endDeltaTime = alarmEndDate.getTime() - currTime.getTime()
    let startAlarmId = undefined
    if (startDeltaTime >= 0) {
        startAlarmId = setTimeout(() => {
            console.log("Should sound alarm with startTime: ", alarmStartDate)
            alert("Sounding your " + props.name + " start")
        }, startDeltaTime)
    }

    let endAlarmId = undefined
    if (endDeltaTime >= 0) {
        endAlarmId = setTimeout(() => {
            console.log("Should sound alarm with endTime: ", alarmEndDate)
            alert("Sounding your " + props.name + " end")
        }, endDeltaTime)
    }

    return { startAlarmId, endAlarmId }
}
function deactivateAlarm() {
    clearTimeout(startAlarmTimeoutId.value)
    clearTimeout(endAlarmTimeoutId.value)
}


</script>