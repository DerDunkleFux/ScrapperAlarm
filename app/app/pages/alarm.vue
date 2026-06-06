<template>
    <!-- <div class="d-flex flex-column min-h-(--main-with-header-footer) flex-grow-1 bg-blue-grey-darken-4 "> -->
    <v-container fluid class="d-flex flex-column fill-height align-center flex-grow-1 bg-blue-grey-darken-4">
        <v-row justify="center" align-content="center" class="fill-height w-1/2 flex-grow-1">
            <v-col>
                In Alarms
            </v-col>
        </v-row>
    </v-container>
    <!-- </div> -->
</template>

<script setup lang="ts">

const route = useRoute()
console.log("got route: ", route)
onMounted((val: any) => {
    console.log("Mounted site, got something: ", val)
})
</script>