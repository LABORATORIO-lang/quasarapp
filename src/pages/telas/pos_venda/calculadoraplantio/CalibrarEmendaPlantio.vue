<template>
  <q-page class="q-pa-md text-white bg-grey-10">
    <div class="row items-center q-mb-lg q-gutter-sm">
      <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
      <div class="text-h5 text-weight-bold">Calibrar Emenda de Plantio</div>
    </div>

    <div class="column q-gutter-md">
      <q-input
        v-model.number="totalLines"
        type="number"
        label="Número de linhas"
        dark
        filled
        color="orange-8"
      />
      <q-input
        v-model.number="spacing"
        type="number"
        label="Espaçamento entre linhas (cm)"
        dark
        filled
        color="orange-8"
      />
      <q-input
        v-model.number="currentWidth"
        type="number"
        label="Largura atual no GPS (m)"
        dark
        filled
        color="orange-8"
        :error="!!widthError"
        :error-message="widthError"
      />
      <q-input
        v-model.number="currentOffset"
        type="number"
        label="Deslocamento atual no GPS (cm)"
        dark
        filled
        color="orange-8"
      />
      <q-input
        v-model.number="gapRight"
        type="number"
        label="Folga medida à direita (cm)"
        dark
        filled
        color="orange-8"
      />
      <q-input
        v-model.number="gapLeft"
        type="number"
        label="Folga medida à esquerda (cm)"
        dark
        filled
        color="orange-8"
      />

      <div class="q-gutter-sm">
        <div class="text-subtitle2 text-grey-4">Sentido do 1º Giro</div>
        <q-radio v-model="firstTurn" val="esquerda" label="Esquerda" dark color="orange-8" />
        <q-radio v-model="firstTurn" val="direita" label="Direita" dark color="orange-8" />
      </div>

      <q-btn
        label="Calcular"
        color="orange-8"
        class="full-width"
        @click="calculate"
        :disable="!hasValidData"
      />

      <q-separator dark class="q-my-md" />

      <q-card v-if="calculated" class="bg-grey-9 text-white q-pa-md">
        <div class="text-h6 text-weight-bold text-orange-8 q-mb-sm">Resultados</div>
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <div class="text-caption text-grey-5">Nova Largura</div>
            <div class="text-h6">{{ resultWidth }}</div>
            <div class="text-caption text-grey-6">{{ resultWidthCm }}</div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="text-caption text-grey-5">Novo Deslocamento</div>
            <div class="text-h6">{{ resultOffset }}</div>
            <div class="text-caption text-grey-6">{{ resultOffsetM }}</div>
            <div class="text-caption text-grey-4 q-mt-xs">
              {{ offsetExplanation }}
            </div>
          </div>
        </div>
        <div class="q-mt-md text-body2" style="white-space: pre-line">{{ resultFeedback }}</div>
      </q-card>

      <q-card class="bg-grey-9 q-pa-sm">
        <canvas ref="canvasRef" class="full-width" style="height: 380px; width: 100%" />
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const totalLines = ref(null)
const spacing = ref(null)
const currentWidth = ref(null)
const currentOffset = ref(0)
const gapRight = ref(null)
const gapLeft = ref(null)
const firstTurn = ref('esquerda')

const widthError = ref('')
const calculated = ref(false)
const resultWidth = ref('')
const resultWidthCm = ref('')
const resultOffset = ref('')
const resultOffsetM = ref('')
const offsetExplanation = ref('')
const resultFeedback = ref('')

const canvasRef = ref(null)

const hasValidData = computed(() => {
  return (
    totalLines.value != null &&
    spacing.value != null &&
    currentWidth.value != null &&
    gapRight.value != null &&
    gapLeft.value != null
  )
})

function validateWidth() {
  if (!totalLines.value || !spacing.value || currentWidth.value == null) {
    widthError.value = ''
    return
  }
  const expected = (totalLines.value * spacing.value) / 100.0
  widthError.value =
    currentWidth.value < expected - 0.1
      ? `Largura muito menor que a da plantadeira (${expected.toFixed(2)} m)`
      : ''
}

watch([totalLines, spacing, currentWidth], validateWidth)

watch(firstTurn, async () => {
  if (calculated.value) {
    await nextTick()
    drawCanvas()
  }
})

function calculate() {
  if (!hasValidData.value) {
    $q.notify({ message: 'Por favor, preencha todos os campos.', color: 'negative' })
    return
  }
  const expected = (totalLines.value * spacing.value) / 100.0
  if (currentWidth.value < expected - 0.1) {
    validateWidth()
    $q.notify({ message: 'Largura configurada no GPS é inválida.', color: 'negative' })
    return
  }

  // CÁLCULO DA LARGURA
  const avgGap = (gapRight.value + gapLeft.value) / 2.0
  const correctionCm = avgGap - spacing.value
  const newW = currentWidth.value - correctionCm / 100.0

  // CÁLCULO DO DESLOCAMENTO (OFFSET)
  // Fórmula: novoOffset = offsetAtual + ((folgaEsq - folgaDir) / 2)
  const offCorr = (gapLeft.value - gapRight.value) / 2.0
  const newO = (currentOffset.value || 0) + offCorr

  // Explicação clara
  const dirText = newO > 0 ? 'DIREITA (valor positivo)' : 'ESQUERDA (valor negativo)'
  offsetExplanation.value = `Coloque ${Math.abs(newO).toFixed(1)} cm para a ${dirText} no GPS.`

  const lines = []
  lines.push(`Média: ${avgGap.toFixed(1)} cm (Alvo: ${spacing.value.toFixed(1)} cm)`)
  if (Math.abs(correctionCm) < 0.1) lines.push('✅ Largura correta.')
  else if (correctionCm > 0)
    lines.push(`⚠️ Trator abrindo. Diminuir ${Math.abs(correctionCm).toFixed(1)} cm.`)
  else lines.push(`⚠️ Trator fechando. Aumentar ${Math.abs(correctionCm).toFixed(1)} cm.`)

  lines.push('')
  if (Math.abs(offCorr) < 0.1) lines.push('✅ Deslocamento correto.')
  else {
    const dir = offCorr > 0 ? 'Direita (+)' : 'Esquerda (-)'
    lines.push(`⚠️ Centralizar ${Math.abs(offCorr).toFixed(1)} cm para a ${dir}.`)
  }

  resultWidth.value = newW.toFixed(3) + ' m'
  resultWidthCm.value = (newW * 100).toFixed(1) + ' cm'
  resultOffset.value = `${newO > 0 ? '+' : ''}${newO.toFixed(1)} cm`
  resultOffsetM.value = (newO / 100).toFixed(3) + ' m'
  resultFeedback.value = lines.join('\n')
  calculated.value = true
  nextTick(drawCanvas)
}

function resizeCanvas() {
  const c = canvasRef.value
  if (!c) return
  const dpr = window.devicePixelRatio || 1
  const r = c.getBoundingClientRect()
  c.width = r.width * dpr
  c.height = r.height * dpr
}

function drawCanvas() {
  const c = canvasRef.value
  if (!c) return
  resizeCanvas()
  const ctx = c.getContext('2d')
  const dpr = window.devicePixelRatio || 1
  ctx.scale(dpr, dpr)

  const W = c.getBoundingClientRect().width
  const H = c.getBoundingClientRect().height

  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, W, H)

  const idealGap = spacing.value || 50
  const leftGap = gapLeft.value || idealGap
  const rightGap = gapRight.value || idealGap
  const isLeft = firstTurn.value === 'esquerda'

  const passW = 65
  const gapMaxPx = 100
  const gapScale = gapMaxPx / Math.max(idealGap, leftGap, rightGap, 1)
  const leftIdealPx = idealGap * gapScale
  const leftRealPx = leftGap * gapScale
  const rightIdealPx = idealGap * gapScale
  const rightRealPx = rightGap * gapScale

  const fieldTop = 32
  const legendSpace = 90
  const fieldBottom = H - legendSpace

  const fieldH = fieldBottom - fieldTop

  const cx = W / 2
  const p2x = cx - passW / 2

  const p1IdealX = p2x - passW - leftIdealPx
  const p1RealX = p2x - passW - leftRealPx

  const p3IdealX = p2x + passW + rightIdealPx
  const p3RealX = p2x + passW + rightRealPx

  drawPassadaIdeal(ctx, p1IdealX, fieldTop, passW, fieldH)
  drawPassadaReal(
    ctx,
    p1RealX,
    fieldTop,
    passW,
    fieldH,
    isLeft ? '1ª PASSADA' : '3ª PASSADA',
    '↑',
    'ESQUERDO',
  )

  drawPassadaIdeal(ctx, p2x, fieldTop, passW, fieldH)
  drawPassadaReal(ctx, p2x, fieldTop, passW, fieldH, '(Referência)', '↓', null)

  drawPassadaIdeal(ctx, p3IdealX, fieldTop, passW, fieldH)
  drawPassadaReal(
    ctx,
    p3RealX,
    fieldTop,
    passW,
    fieldH,
    isLeft ? '3ª PASSADA' : '1ª PASSADA',
    '↑',
    'DIREITO',
  )

  drawGapLine(ctx, p1IdealX + passW, p2x, fieldTop, fieldH, '#2196F3', [6, 4])
  drawGapLine(ctx, p1RealX + passW, p2x, fieldTop, fieldH, '#616161', [3, 3])
  drawGapLine(ctx, p2x + passW, p3IdealX, fieldTop, fieldH, '#2196F3', [6, 4])
  drawGapLine(ctx, p2x + passW, p3RealX, fieldTop, fieldH, '#616161', [3, 3])

  const g1x = p1RealX + passW + (p2x - (p1RealX + passW)) * 0.5
  const g1y = fieldTop + fieldH * 0.45
  drawCircle(ctx, g1x, g1y - 30, idealGap, '#E3F2FD', '#2196F3', '#1565C0', 24)
  drawCircle(ctx, g1x, g1y + 50, leftGap, '#F5F5F5', '#9E9E9E', '#424242', 28)
  ctx.font = 'bold 10px sans-serif'
  ctx.fillStyle = '#757575'
  ctx.textAlign = 'center'
  ctx.fillText('DIREITO', g1x, g1y + 92)

  const g2x = p2x + passW + (p3RealX - (p2x + passW)) * 0.5
  const g2y = fieldTop + fieldH * 0.45
  drawCircle(ctx, g2x, g2y - 30, idealGap, '#E3F2FD', '#2196F3', '#1565C0', 24)
  drawCircle(ctx, g2x, g2y + 50, rightGap, '#F5F5F5', '#9E9E9E', '#424242', 28)
  ctx.font = 'bold 10px sans-serif'
  ctx.fillStyle = '#757575'
  ctx.textAlign = 'center'
  ctx.fillText('ESQUERDO', g2x, g2y + 92)

  const legY = H - 65

  ctx.textAlign = 'left'

  ctx.strokeStyle = '#2E7D32'
  ctx.lineWidth = 2
  ctx.strokeRect(12, legY - 12, 14, 14)

  ctx.fillStyle = '#2E7D32'
  ctx.font = 'bold 11px sans-serif'
  ctx.fillText('Verde = onde a plantadeira DEVERIA passar (ideal/GPS)', 36, legY)

  ctx.strokeStyle = '#000'
  ctx.setLineDash([6, 4])
  ctx.beginPath()
  ctx.moveTo(12, legY + 18)
  ctx.lineTo(26, legY + 18)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.fillStyle = '#000'
  ctx.fillText('Tracejado = onde a plantadeira REALMENTE passou', 36, legY + 22)
}

function drawPassadaIdeal(ctx, x, y, w, h) {
  ctx.fillStyle = '#A5D6A7'
  ctx.fillRect(x, y, w, h)
  ctx.strokeStyle = '#2E7D32'
  ctx.lineWidth = 3
  ctx.strokeRect(x, y, w, h)
  ctx.strokeStyle = 'rgba(46, 125, 50, 0.4)'
  ctx.lineWidth = 2
  ctx.setLineDash([3, 5])
  const count = 3
  const step = w / (count + 1)
  for (let l = 1; l <= count; l++) {
    const lx = x + step * l
    ctx.beginPath()
    ctx.moveTo(lx, y + 4)
    ctx.lineTo(lx, y + h - 4)
    ctx.stroke()
  }
  ctx.setLineDash([])
}

function drawPassadaReal(ctx, x, y, w, h, label, arrow) {
  ctx.strokeStyle = '#424242'
  ctx.lineWidth = 2
  ctx.setLineDash([6, 3])
  ctx.strokeRect(x, y, w, h)
  ctx.setLineDash([])

  if (label) {
    ctx.fillStyle = '#424242'
    ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, x + w / 2, y - 8)
  }

  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = 'bold 20px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(arrow, x + w / 2, y + h - 22)
}

function drawGapLine(ctx, x1, x2, y, h, color, dash) {
  const my = y + h / 2
  ctx.setLineDash(dash)
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x1, my)
  ctx.lineTo(x2, my)
  ctx.stroke()
  ctx.setLineDash([])
}

function drawCircle(ctx, x, y, val, fill, stroke, text, r) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.strokeStyle = stroke
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.fillStyle = text
  ctx.font = `bold ${r * 0.5}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(val.toString(), x, y + 1)
}

onMounted(() => {
  nextTick(drawCanvas)
})
</script>
