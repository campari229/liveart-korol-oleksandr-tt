<script setup lang="ts">
import { useEditorStore } from './stores/editor'
import ImageUploader from './components/ImageUploader.vue'
import ImageCropper from './components/ImageCropper.vue'
import AdjustmentPanel from './components/AdjustmentPanel.vue'

const store = useEditorStore()

function goBackToCrop() {
  store.croppedDataUrl = null
}
</script>

<template>
  <v-app>
    <v-app-bar v-if="store.originalDataUrl" flat border="b" density="compact">
      <v-app-bar-title>
        <span class="text-body-2 text-grey">{{ store.originalFile?.name }}</span>
      </v-app-bar-title>
      <template #append>
        <v-btn
          variant="text"
          prepend-icon="mdi-image-remove-outline"
          size="small"
          class="mr-2"
          @click="store.clearAll()"
        >
          Change image
        </v-btn>
      </template>
    </v-app-bar>

    <v-main>
      <v-container class="py-8">
        <ImageUploader v-if="!store.originalDataUrl" />

        <ImageCropper v-else-if="!store.croppedDataUrl" />

        <AdjustmentPanel
          v-else
          @back-to-crop="goBackToCrop"
        />
      </v-container>
    </v-main>
  </v-app>
</template>

