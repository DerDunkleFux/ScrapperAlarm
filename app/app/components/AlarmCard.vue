<template>
    <v-container>
        <div class="d-flex justify-start flex-wrap bg-green ">
            <v-row>
                <v-col cols="6" class="text-title-large pa-2">
                    {{ name }}
                </v-col>
                <v-col cols="6" class="text-header-large pa-2">
                    <div>
                        Some other options here
                    </div>
                    <div>
                        Some Options here
                    </div>
                </v-col>
                <v-col class="text-title-large pa-2">
                    {{ start }}
                </v-col>
                <v-col class="text-title-large pa-2">
                    {{ end }}
                </v-col>
            </v-row>
        </div>
    </v-container>
</template>

<script setup lang="ts">
const props = defineProps({
    name: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
})
</script>