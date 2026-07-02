import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CropData {
  x: number
  y: number
  width: number
  height: number
  rotate: number
  scaleX: number
  scaleY: number
}

export interface Adjustments {
  brightness: number  // 0–200, default 100
  contrast: number    // 0–200, default 100
  saturation: number  // 0–200, default 100
  filter: 'none' | 'grayscale' | 'sepia'
}

const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  filter: 'none',
}

export const useEditorStore = defineStore('editor', () => {
  // Original file — never mutated
  const originalFile = ref<File | null>(null)
  const originalDataUrl = ref<string | null>(null)

  // Cropped result — adjustments are derived on top of this
  const croppedDataUrl = ref<string | null>(null)
  const cropData = ref<CropData | null>(null)

  // Slider values and active filter
  const adjustments = ref<Adjustments>({ ...DEFAULT_ADJUSTMENTS })

  // CSS filter string applied to the preview <img> for real-time feedback
  const cssFilter = computed(() => {
    const { brightness, contrast, saturation, filter } = adjustments.value
    const parts = [
      `brightness(${brightness}%)`,
      `contrast(${contrast}%)`,
      `saturate(${saturation}%)`,
    ]
    if (filter === 'grayscale') parts.push('grayscale(100%)')
    if (filter === 'sepia') parts.push('sepia(100%)')
    return parts.join(' ')
  })

  // Show cropped image if available, fall back to original
  const previewSrc = computed(() => croppedDataUrl.value ?? originalDataUrl.value)

  function loadFile(file: File) {
    originalFile.value = file
    croppedDataUrl.value = null
    cropData.value = null
    adjustments.value = { ...DEFAULT_ADJUSTMENTS }

    const reader = new FileReader()
    reader.onload = (e) => {
      originalDataUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  function setCropped(dataUrl: string, data: CropData) {
    croppedDataUrl.value = dataUrl
    cropData.value = data
  }

  function resetEdits() {
    adjustments.value = { ...DEFAULT_ADJUSTMENTS }
    croppedDataUrl.value = null
    cropData.value = null
  }

  function resetAdjustments() {
    adjustments.value = { ...DEFAULT_ADJUSTMENTS }
  }

  function clearAll() {
    originalFile.value = null
    originalDataUrl.value = null
    croppedDataUrl.value = null
    cropData.value = null
    adjustments.value = { ...DEFAULT_ADJUSTMENTS }
  }

  return {
    originalFile,
    originalDataUrl,
    croppedDataUrl,
    cropData,
    adjustments,
    cssFilter,
    previewSrc,
    loadFile,
    setCropped,
    resetEdits,
    resetAdjustments,
    clearAll,
  }
})
