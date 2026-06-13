<template>
                                <v-time-picker v-model="modelTime" class="custom-compact-picker" rounded="xl">

                                    <!-- <v-btn id="menu-activator" class="bg-success">Ok</v-btn> -->
                                    <!-- <v-btn v-bind="menuProps" class="bg-success">Ok</v-btn> -->
                                    <template #actions>
                                        <v-row justify="space-evenly" class="center-text">
                                            <v-col>
                                            </v-col>
                                            <v-col>
                                                <v-btn class="bg-error" @click="cancelTimePicker">Cancel</v-btn>
                                            </v-col>
                                        </v-row>
                                    </template>
                                </v-time-picker>

</template>
<script setup lang="ts">

const props = defineProps({
    time: {type: String, required: true}
})

const modelTime = ref(props.time)

function cancelTimePicker(e: Event) {
    console.log("Should close and cancel menu")
    e.stopPropagation(); // since closing the v-menu with the v-model, and without the menu props, the event propagation has to be stopped manually
    // isMenuOpen.value = false
    //T
}

</script>