<template>
    <header>
        <v-app-bar >
            <template #prepend>
                <v-app-bar-nav-icon icon="mdi-clock"> </v-app-bar-nav-icon> 
            </template>
            <v-app-bar-title>
                Interactions-Alarms
            </v-app-bar-title>
        <template #append>
            <!-- <div class="mx-5"> -->

    <v-btn >
        <NuxtLink to="/"> Home </NuxtLink> 
    </v-btn>
    <v-btn>
        <NuxtLink to="/login"> Login </NuxtLink>   
    </v-btn>
                <!-- <v-spacer class="w-2"></v-spacer>
                <!-- <v-btn prepend-icon="mdi-update" @click="realoadDates()">Reload Dates</v-btn> -->
            <!-- </div> -->
        </template>
    </v-app-bar>
</header>
</template>