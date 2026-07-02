<script setup lang="ts">
import { ref } from 'vue'
import { useEditorStore } from '../stores/editor'

const store = useEditorStore()
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function onFileSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file && file.type.startsWith('image/')) {
    store.loadFile(file)
  }
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    store.loadFile(file)
  }
}
</script>

<template>
  <div
    class="upload-zone"
    :class="{ 'upload-zone--active': isDragging }"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="onDrop"
    @click="fileInput?.click()"
  >
    <v-icon size="64" color="grey-lighten-1">mdi-image-plus</v-icon>
    <p class="text-h6 text-grey mt-4">Drop an image here or click to browse</p>
    <p class="text-caption text-grey-lighten-1">PNG, JPG, WEBP</p>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="onFileSelected"
    />
  </div>
</template>

<style scoped>
.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #bdbdbd;
  border-radius: 12px;
  padding: 60px 40px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  user-select: none;
}

.upload-zone:hover,
.upload-zone--active {
  border-color: #1976d2;
  background: rgba(25, 118, 210, 0.04);
}
</style>
