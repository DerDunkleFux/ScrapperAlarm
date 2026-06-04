<template>
    <v-app-bar style="">
        <v-app-bar-title>
           <v-icon icon="mdi-clock"></v-icon> YourAlarms
        </v-app-bar-title>
        <template #append>
            <v-btn prepend-icon="mdi-update" @click="realoadDates()">Reload Dates</v-btn>
        </template>
    </v-app-bar>

    <v-main class="d-flex flex-column h-screen">
        <v-container fluid class="bg-orange fill-height d-flex flex-column  align-center">
            <v-row justify="center" align-content="center" class="fill-height w-5/6">
                <v-col class="text-center w-full" cols="12">
                    <v-card class="elevation-6 rounded-lg ">
                        <v-card-item class="text-center" >
                            <v-card-title class="text-h5 font-weight-bold">Welcome to your alarms!</v-card-title>
                            <v-card-subtitle>Enter your ID and select a date to access the dashboard</v-card-subtitle>
                        </v-card-item>

                        <v-card-text class="mt-4">
                            <v-form>
                                <v-text-field @update:model-value="onUserIDChange" label="User ID" prepend-inner-icon="mdi-account" variant="outlined"
                                    class="mb-4" />

                                <v-btn color="primary" block size="large">
                                    Login
                                </v-btn>
                            </v-form>
                        </v-card-text>

                    </v-card>
                </v-col>
            </v-row>
            <!-- <v-row>
                <v-col>
                   <div>
                        test 2
                   </div>
                </v-col>
            </v-row> -->

            <!-- <v-row justify="end" align="end" class="flex-grow-0"> 
                <v-col class="text-end">
                    <div> about </div>
                </v-col>
            </v-row> -->
        </v-container>
        <v-footer class="justify-end bg-blue px-6 py-2 flex-grow-0">
            <div> about </div>
        </v-footer>
    </v-main>
</template>

<script setup lang="ts">

// const userID = ref("")
function onUserIDChange(e: String) {
    console.log("Wrote userID and got value: ")
    console.log(e)
}
function realoadDates() {
    console.log("Should reload dates")
}
</script>