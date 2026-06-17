<template>
    <v-menu v-model="isMenuOpen" :persistent="true" :close-on-content-click="false" :stick-to-target="true"
        @update:model-value="onUpdateMenuModelValue" :disabled="isTimePickerDisabled">
        <template v-slot:activator="{ props: startMenuProps }">
            <div class="cursor-pointer text-center text-5xl" v-bind="startMenuProps"
                @click="onOpenTimePicker($event, startMenuProps.onClick)">
                {{ modelTime }} 
            </div>
        </template>
        <!-- @update:model-value="updateTime" -->
        <v-time-picker v-model="modelTime" format="24hr" class="custom-compact-picker" rounded="xl">

            <!-- <v-btn v-bind="menuProps" class="bg-success">Ok</v-btn> -->
            <template #actions>
                <v-row justify="end" class="center-text">
                    <v-col>
                        <!-- <div class="d-flex justify-end gap-2 w-100 pa-4 pt-0">
                </div> -->

                        <v-btn block size="large" id="menu-activator" class="bg-success w-full"
                            @click="confirmTimePicker">Ok</v-btn>

                    </v-col>
                    <v-col>
                        <v-btn block size="large" class="bg-error w-full" @click="cancelTimePicker">Cancel</v-btn>
                    </v-col>
                </v-row>
            </template>
        </v-time-picker>
    </v-menu>


</template>
<style scoped>
.custom-compact-picker :deep {
    /* Scales the clock graphics cleanly to fit smaller dimensions */
    transform: scale(0.8);
    /* --time-picker-width: 140px !important */
}
</style>
<script setup lang="ts">

const props = defineProps({
    time: { type: String, required: true },
    name: { type: String, required: true },
    alarmSound: { type: String, default: "hornse"}
})

const modelTime = ref(props.time)

const tmpTime: Ref<string | null> = ref(null)
const isMenuOpen: Ref<boolean> = ref(false)

const alarmTimeoutId: Ref<NodeJS.Timeout | undefined> = ref()
const preventDisable = ref(false)
const alarmSoundAudio = computed({
  get: () => new Audio(props.alarmSound),
  set: (val) => {
    console.log("Setting alarmSoundAudio cputed to new val: ", val, "but does currently nothing")
  }
})

    // () => new Audio(props.alarmSound))

const emit = defineEmits<{
    (e: 'timePickerToggled'): void
}>()
defineExpose({ toggleTimePicker, })

onMounted(() => {

    const alarmId = activateAlarm()

    alarmTimeoutId.value = alarmId

})



function onOpenTimePicker(e: Event, propsFunction: Function) {
    if (isTimePickerDisabled.value) return
    console.log("opening time picker menu")
    if (!e.target || !(e.target instanceof HTMLElement)) {
        console.log("Event was no div with innerHTML time value!")
        console.log(e)
        return
    }
    console.log("Event.target.html: ", e.target.innerHTML)
    console.log("Function: ", propsFunction)

    // temporary save old time value and if it cancels revert to it, othgerwise save to persistent
    tmpTime.value = e.target.innerHTML
    preventDisable.value = true // 
    emit('timePickerToggled')
    // prevent all other clocks from being opened hmm
}

function cancelTimePicker(e: Event) {
    console.log("Should close and cancel menu")
    e.stopPropagation(); // since closing the v-menu with the v-model, and without the menu props, the event propagation has to be stopped manually
    isMenuOpen.value = false
    if (tmpTime.value !== null) {
        modelTime.value = tmpTime.value
        // clear tmp saved value to avoid accidental access
    }
    tmpTime.value = null

    emit('timePickerToggled')
    preventDisable.value = false

}

function confirmTimePicker(e: Event) {
    console.log("Confirm new time")
    e.stopPropagation(); // since closing the v-menu with the v-model, and without the menu props, the event propagation has to be stopped manually
    // clear tmp saved value to avoid accidental access
    tmpTime.value = null

    isMenuOpen.value = false


    deactivateAlarm() // Delete alarm with old startTime.value
    alarmTimeoutId.value = activateAlarm() // Activate alarm with new value

    emit('timePickerToggled')
    preventDisable.value = false
    //TODO when DB is implemented, update db alarm value with startTime.value and endTime.value
}


function activateAlarm(): NodeJS.Timeout | undefined {
    const currTime = new Date()
    //startTime is format HH:MM
    const { hours: startHours, minutes: startMinutes } = getHoursMinutesFromString(modelTime.value)
    const alarmDate: Date = new Date(currTime.getFullYear(), currTime.getMonth(), currTime.getDate(), startHours, startMinutes)
    const deltaTime = alarmDate.getTime() - currTime.getTime()
    console.log("in activateAlarm got deltaTime: ", deltaTime)

    let alarmId = undefined
    if (deltaTime >= 0) {
        alarmId = setTimeout(() => {
            console.log("Should sound alarm with startTime: ", alarmDate)
            alarmSoundAudio.value.play()
            alert("Sounding your " + props.name + " start")
            alarmSoundAudio.value.pause()
        }, deltaTime)
        console.log("created new alarm with id: ", alarmId)
    }
    return alarmId
}

function getHoursMinutesFromString(s: string): { hours: number, minutes: number } {
    let hours = 0
    let minutes = 0
    hours = Number(s.replace(" ", "").replace(/am/i, "").replace(/pm/i, "").replace(/:(\d+)/, ""))
    minutes = Number(s.replace(" ", "").replace(/am/i, "").replace(/pm/i, "").replace(/(\d+):/, ""))
    if (s.toLowerCase().includes("pm") && hours !== 12) {
        hours + 12
    }

    return { hours, minutes }
}

function deactivateAlarm() {
    console.log("Clearing alarm with id: ", alarmTimeoutId.value)
    clearTimeout(alarmTimeoutId.value)
    alarmTimeoutId.value = undefined
    console.log("Cleared alarm with id: ", alarmTimeoutId.value)
}
function onUpdateMenuModelValue(val: any) {
    console.log("updated menu model value hmmm: ", val)
}

const isTimePickerDisabled: Ref<boolean> = ref(false)
/**
 * Toggles this components time picker
 * @returns boolean value of the new time pickers disabled status, false by default
 */
function toggleTimePicker(): boolean {
    console.log("Called to toggleTimePicker")
    if (!preventDisable.value) {
        isTimePickerDisabled.value = !isTimePickerDisabled.value
    }
    return isTimePickerDisabled.value
}

</script>