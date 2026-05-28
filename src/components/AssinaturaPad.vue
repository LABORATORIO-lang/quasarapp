<template>
  <div class="pdf-no-break q-mb-md">
    <q-input
      v-model="nomeLocal"
      :label="label"
      dark
      outlined
      dense
      color="orange-8"
      class="q-mb-xs pdf-input"
      @update:model-value="atualizarNome"
      @input="$emit('alteracao')"
    />
    <div class="text-caption q-mb-xs pdf-text">Assinatura:</div>
    <div class="signature-container bg-white">
      <canvas
        :id="'canvas-' + id"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @touchstart="startDrawingTouch"
        @touchmove="drawTouch"
        @touchend="stopDrawing"
      ></canvas>
      <q-btn
        round
        dense
        flat
        icon="delete"
        color="red"
        class="clear-sig-btn hide-on-pdf"
        @click="clearSignature"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  id: String,
  label: String,
  nome: String,
})

const emit = defineEmits(['update:nome', 'alteracao'])
const nomeLocal = ref(props.nome)

const isDrawing = ref(false)
const hasSigned = ref(false)
let lastX = 0
let lastY = 0

watch(
  () => props.nome,
  (newVal) => {
    nomeLocal.value = newVal
  },
)

const atualizarNome = (val) => {
  emit('update:nome', val)
  emit('alteracao')
}

onMounted(() => {
  initCanvas()
})

const initCanvas = () => {
  const c = document.getElementById(`canvas-${props.id}`)
  if (!c) return
  const ctx = c.getContext('2d')
  // Ajuste para o tamanho do ecrã/container
  c.width = c.parentElement.clientWidth || 300
  c.height = 120
  ctx.strokeStyle = '#1a1a1a'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}

const startDrawing = (e) => {
  isDrawing.value = true
  const r = e.target.getBoundingClientRect()
  lastX = e.clientX - r.left
  lastY = e.clientY - r.top
}

const draw = (e) => {
  if (!isDrawing.value) return
  const ctx = document.getElementById(`canvas-${props.id}`).getContext('2d')
  const r = e.target.getBoundingClientRect()
  const x = e.clientX - r.left
  const y = e.clientY - r.top
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(x, y)
  ctx.stroke()
  lastX = x
  lastY = y
  hasSigned.value = true
  emit('alteracao')
}

const stopDrawing = () => {
  isDrawing.value = false
}

const startDrawingTouch = (e) => {
  if (e.touches.length !== 1) return
  isDrawing.value = true
  const r = e.target.getBoundingClientRect()
  lastX = e.touches[0].clientX - r.left
  lastY = e.touches[0].clientY - r.top
  e.preventDefault()
}

const drawTouch = (e) => {
  if (!isDrawing.value || e.touches.length !== 1) return
  const ctx = document.getElementById(`canvas-${props.id}`).getContext('2d')
  const r = e.target.getBoundingClientRect()
  const x = e.touches[0].clientX - r.left
  const y = e.touches[0].clientY - r.top
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(x, y)
  ctx.stroke()
  lastX = x
  lastY = y
  hasSigned.value = true
  emit('alteracao')
  e.preventDefault()
}

const clearSignature = () => {
  const c = document.getElementById(`canvas-${props.id}`)
  if (!c) return
  c.getContext('2d').clearRect(0, 0, c.width, c.height)
  hasSigned.value = false
  emit('alteracao')
}

// -------------------------------------------------------------
// NOVA FUNÇÃO: Transforma o desenho numa imagem Base64
// -------------------------------------------------------------
// Adicione esta função dentro do <script setup> do seu AssinaturaPad.vue
const extrairImagem = () => {
  const canvas = document.getElementById(`canvas-${props.id}`)
  if (!canvas) return null
  // Retorna a imagem em Base64
  return hasSigned.value ? canvas.toDataURL('image/png') : null
}

// Garanta que o defineExpose está assim:
defineExpose({ hasSigned, extrairImagem })

// -------------------------------------------------------------
// EXPORTAÇÃO PARA O COMPONENTE PAI (ChecklistForm)
// -------------------------------------------------------------
// Agora expomos o estado 'hasSigned' E a função 'extrairImagem'
defineExpose({
  hasSigned,
  extrairImagem,
})
</script>

<style scoped>
.signature-container {
  position: relative;
  width: 100%;
  height: 120px;
  border-radius: 8px;
  border: 1px solid #555;
  overflow: hidden;
}
.signature-container canvas {
  width: 100%;
  height: 100%;
  display: block;
  touch-action: none; /* Previne scroll no ecrã enquanto assina */
}
.clear-sig-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: rgba(255, 255, 255, 0.9);
}
</style>
