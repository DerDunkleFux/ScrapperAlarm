<template>
  <v-footer app class="bg-blue-grey-darken-2 px-1 ">
    <!-- <v-container class="mx-0 max-w-full w-full"> -->
    <v-container class="pa-0" >
      <v-row justify="end" align="baseline">
        <v-col>
          <div class="text-label-small pa-2">
            <v-icon icon="mdi-registered-trademark"></v-icon>
            Created By Manuel Pedraza M
          </div>
        </v-col>
        <v-col class="text-end">
          <!-- Vuetify button styling applied here too for seamless aesthetics -->
          <v-btn to="/about" variant="text" size="small" class="pa-2">about</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>