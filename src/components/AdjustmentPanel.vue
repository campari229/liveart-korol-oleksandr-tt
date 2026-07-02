<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '../stores/editor'

const store = useEditorStore()

const filterOptions = [
  { label: 'None', value: 'none' },
  { label: 'Grayscale', value: 'grayscale' },
  { label: 'Sepia', value: 'sepia' },
]

const isDefaultAdjustments = computed(() => {
  const { brightness, contrast, saturation, filter } = store.adjustments
  return brightness === 100 && contrast === 100 && saturation === 100 && filter === 'none'
})

defineEmits<{ 'back-to-crop': [] }>()

function buildOperationsJson() {
  const ops = []

  if (store.cropData) {
    const { x, y, width, height, rotate, scaleX, scaleY } = store.cropData
    ops.push({ type: 'crop', x, y, width, height, rotate, scaleX, scaleY })
  }

  const { brightness, contrast, saturation } = store.adjustments
  if (brightness !== 100 || contrast !== 100 || saturation !== 100) {
    ops.push({ type: 'adjustments', brightness, contrast, saturation })
  }

  if (store.adjustments.filter !== 'none') {
    ops.push({ type: 'filter', name: store.adjustments.filter })
  }

  return JSON.stringify(
    { version: '1.0', exportedAt: new Date().toISOString(), operations: ops },
    null,
    2
  )
}

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'application/json' })
  const link = document.createElement('a')
  link.download = filename
  link.href = URL.createObjectURL(blob)
  link.click()
  URL.revokeObjectURL(link.href)
}

function exportImage() {
  const src = store.previewSrc
  if (!src) return

  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight

    const ctx = canvas.getContext('2d')!
    ctx.filter = store.cssFilter
    ctx.drawImage(img, 0, 0)

    const link = document.createElement('a')
    link.download = 'edited-image.png'
    link.href = canvas.toDataURL('image/png')
    link.click()

    // Download the operations JSON alongside the image
    downloadText(buildOperationsJson(), 'operations.json')
  }
  img.src = src
}
</script>

<template>
  <div class="d-flex flex-column flex-md-row ga-6">

    <!-- Left column: preview -->
    <div class="preview-col">
      <div class="preview-wrapper">
        <img
          :src="store.previewSrc!"
          :style="{ filter: store.cssFilter }"
          alt="preview"
          class="preview-img"
        />
      </div>
    </div>

    <!-- Right column: controls -->
    <div class="controls-col">

      <p class="text-subtitle-1 font-weight-bold mb-4">Adjustments</p>

      <p class="text-caption text-grey mb-1">
        Brightness: {{ store.adjustments.brightness }}%
      </p>
      <v-slider
        v-model="store.adjustments.brightness"
        min="0" max="200" step="1"
        color="primary" hide-details
        class="mb-4"
      />

      <p class="text-caption text-grey mb-1">
        Contrast: {{ store.adjustments.contrast }}%
      </p>
      <v-slider
        v-model="store.adjustments.contrast"
        min="0" max="200" step="1"
        color="primary" hide-details
        class="mb-4"
      />

      <p class="text-caption text-grey mb-1">
        Saturation: {{ store.adjustments.saturation }}%
      </p>
      <v-slider
        v-model="store.adjustments.saturation"
        min="0" max="200" step="1"
        color="primary" hide-details
        class="mb-6"
      />

      <p class="text-subtitle-2 mb-2">Filter</p>
      <v-btn-toggle
        v-model="store.adjustments.filter"
        mandatory
        color="primary"
        class="mb-6"
      >
        <v-btn
          v-for="opt in filterOptions"
          :key="opt.value"
          :value="opt.value"
          size="small"
        >
          {{ opt.label }}
        </v-btn>
      </v-btn-toggle>

      <v-divider class="mb-4" />

      <div class="d-flex flex-column ga-2">
        <v-btn
          color="primary"
          prepend-icon="mdi-download"
          @click="exportImage"
        >
          Download
        </v-btn>
        <v-btn
          variant="outlined"
          prepend-icon="mdi-crop"
          @click="$emit('back-to-crop')"
        >
          Back to crop
        </v-btn>
        <v-btn
          variant="text"
          color="error"
          prepend-icon="mdi-refresh"
          :disabled="isDefaultAdjustments"
          @click="store.resetAdjustments()"
        >
          Reset adjustments
        </v-btn>
        <v-btn
          variant="text"
          color="grey"
          prepend-icon="mdi-image-off-outline"
          @click="store.resetEdits()"
        >
          Reset to original
        </v-btn>
      </div>

    </div>
  </div>
</template>

<style scoped>
.preview-col {
  flex: 1 1 0;
  min-width: 0;
}

.preview-wrapper {
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.preview-img {
  max-width: 100%;
  max-height: 600px;
  display: block;
  object-fit: contain;
}

.controls-col {
  width: 280px;
  flex-shrink: 0;
}
</style>
