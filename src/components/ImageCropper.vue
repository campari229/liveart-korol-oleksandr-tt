<script setup lang="ts">
import { ref, shallowRef, watch, onMounted, nextTick, onBeforeUnmount } from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import { useEditorStore } from '../stores/editor'

const store = useEditorStore()

const imgEl = ref<HTMLImageElement | null>(null)
const cropper = shallowRef<Cropper | null>(null)

function setupCropper(src: string) {
  if (!imgEl.value) return
  imgEl.value.src = src
  imgEl.value.onload = () => {
    destroyCropper()
    cropper.value = new Cropper(imgEl.value!, {
      viewMode: 1,
      autoCropArea: 1,
      movable: true,
      zoomable: true,
      ready() {
        // Restore previous crop box when returning from adjustments (not a full reset)
        if (store.cropData) {
          cropper.value?.setData(store.cropData)
        }
      },
    })
  }
}

// DOM is ready on mount — initialize the cropper immediately
onMounted(() => {
  if (store.originalDataUrl) {
    setupCropper(store.originalDataUrl)
  }
})

// Re-initialize if a new image is loaded while the cropper is already visible
watch(
  () => store.originalDataUrl,
  async (src) => {
    if (!src) return
    await nextTick()
    setupCropper(src)
  }
)

function applyCrop() {
  if (!cropper.value) return
  const canvas = cropper.value.getCroppedCanvas()
  const data = cropper.value.getData(true)
  store.setCropped(canvas.toDataURL('image/png'), data)
}

function resetCrop() {
  cropper.value?.reset()
  store.resetEdits()
}

function destroyCropper() {
  cropper.value?.destroy()
  cropper.value = null
}

onBeforeUnmount(destroyCropper)
</script>

<template>
  <div>
    <!-- Fixed-height wrapper required by cropperjs -->
    <div class="cropper-wrapper">
      <img ref="imgEl" alt="source" />
    </div>

    <!-- Zoom & rotate toolbar -->
    <div class="d-flex align-center ga-2 mt-3">
      <v-btn-group variant="outlined" density="comfortable">
        <v-btn icon="mdi-magnify-plus-outline" @click="cropper?.zoom(0.1)" />
        <v-btn icon="mdi-magnify-minus-outline" @click="cropper?.zoom(-0.1)" />
      </v-btn-group>

      <v-btn-group variant="outlined" density="comfortable">
        <v-btn icon="mdi-rotate-left" @click="cropper?.rotate(-90)" />
        <v-btn icon="mdi-rotate-right" @click="cropper?.rotate(90)" />
      </v-btn-group>

      <v-spacer />

      <v-btn color="primary" prepend-icon="mdi-crop" @click="applyCrop">
        Apply crop
      </v-btn>
      <v-btn variant="outlined" prepend-icon="mdi-restore" @click="resetCrop">
        Reset all
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.cropper-wrapper {
  width: 100%;
  max-height: 480px;
  overflow: hidden;
  border-radius: 8px;
  background: #f5f5f5;
}

.cropper-wrapper img {
  display: block;
  max-width: 100%;
}
</style>
