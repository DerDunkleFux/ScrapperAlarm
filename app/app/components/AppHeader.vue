<template>
    <v-app-bar :app="true">
        <!-- :elevation="1" -->
        <template #prepend>
            <v-app-bar-nav-icon to="/" icon="mdi-clock"> </v-app-bar-nav-icon>
        </template>
        <v-app-bar-title>
            Interactions-Alarms
        </v-app-bar-title>
        <template #append>
            <v-btn to="/"> Home </v-btn>
            <v-btn v-if="!userIdCookie">
                <NuxtLink to="/login"> Login </NuxtLink>
            </v-btn>

            <v-btn v-else @click="logout()">
                Logout
            </v-btn>
            <!-- <v-btn prepend-icon="mdi-update" @click="realoadDates()">Reload Dates</v-btn> -->
        </template>
    </v-app-bar>

</template>

<script setup lang="ts">

const userIdCookie = useCookie("userID")
function logout() {
    userIdCookie.value = null
    navigateTo("/login")
}
</script>