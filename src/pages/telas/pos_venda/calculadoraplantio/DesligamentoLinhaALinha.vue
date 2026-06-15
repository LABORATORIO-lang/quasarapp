<template>
  <q-page class="q-pa-md text-white bg-grey-10">
    <div class="row items-center q-mb-lg q-gutter-sm">
      <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
      <div class="text-h5 text-weight-bold">Desligamento Linha a Linha</div>
    </div>

    <div class="column q-gutter-md">
      <q-input
        v-model.number="plantWidth"
        type="number"
        label="Largura da barra (m)"
        dark
        filled
        color="orange-8"
      />
      <q-input
        v-model.number="measureOff"
        type="number"
        label="Medida OFF (cm)"
        dark
        filled
        color="orange-8"
      />
      <q-input
        v-model.number="measureOn"
        type="number"
        label="Medida ON (cm)"
        dark
        filled
        color="orange-8"
      />
      <q-input
        v-model.number="antennaHitch"
        type="number"
        label="Antena-Engate atual (m)"
        dark
        filled
        color="orange-8"
      />

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
        <div class="row items-center q-col-gutter-sm">
          <div class="col-12">
            <div class="text-caption text-grey-5">Novo Antena-Engate</div>
            <div class="text-h5" :style="{ color: resultColor }">{{ resultFinal }}</div>
          </div>
        </div>
        <div class="q-mt-md text-body2" style="white-space: pre-line">{{ resultFeedback }}</div>
      </q-card>

      <q-card class="bg-grey-9 q-pa-sm">
        <canvas ref="canvasRef" class="full-width" style="height: 320px; width: 100%" />
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const plantWidth = ref(null)
const measureOff = ref(null)
const measureOn = ref(null)
const antennaHitch = ref(null)

const calculated = ref(false)
const resultFinal = ref('')
const resultFeedback = ref('')
const resultColor = ref('#1976D2')

const canvasRef = ref(null)

const hasValidData = computed(() => {
  return (
    plantWidth.value != null &&
    measureOff.value != null &&
    measureOn.value != null &&
    antennaHitch.value != null
  )
})

function calculate() {
  if (!hasValidData.value) {
    $q.notify({ message: 'Preencha todos os campos', color: 'negative' })
    return
  }

  const plantWidthM = Number(plantWidth.value)
  const measureOffCm = Number(measureOff.value)
  const measureOnCm = Number(measureOn.value)
  const antennaHitchM = Number(antennaHitch.value)

  if (isNaN(plantWidthM) || isNaN(measureOffCm) || isNaN(measureOnCm) || isNaN(antennaHitchM)) {
    $q.notify({ message: 'Valores inválidos', color: 'negative' })
    return
  }

  const internalOff = -measureOffCm
  const internalOn = -measureOnCm

  const anticipationError = (internalOff - internalOn) / 2.0
  const newAntennaHitch = antennaHitchM - anticipationError / 100.0

  const sameSign = (internalOff > 0 && internalOn > 0) || (internalOff < 0 && internalOn < 0)
  const symmetryDiff = Math.abs(internalOff + internalOn)
  const isAsymmetric = symmetryDiff > 5.0

  const sb = []

  if (sameSign) {
    resultColor.value = '#D32F2F'
    sb.push('🚨 ALERTA DE CONFIGURAÇÃO 🚨\n')
    if (internalOff > 0) {
      sb.push('Detectado FALHA tanto na Entrada quanto na Saída.\n')
    } else {
      sb.push('Detectado SOBREPOSIÇÃO tanto na Entrada quanto na Saída.\n')
    }
    sb.push(
      'Isso indica que a LARGURA configurada está errada ou a EMENDA DE PLANTIO precisa de calibração.\n',
    )
    sb.push('👉 Confira a LARGURA no monitor.\n👉 Refaça a calibração da EMENDA DE PLANTIO.')
  } else {
    if (isAsymmetric) {
      resultColor.value = '#F57C00'
      sb.push('⚠️ ALERTA DE ASSIMETRIA\n')
      sb.push(`Diferença (${symmetryDiff.toFixed(1)} cm) acima da tolerância de 5 cm.\n`)
      sb.push('Verifique se a velocidade foi constante ou se houve erro na medição.\n')
    } else {
      resultColor.value = '#1976D2'
    }

    if (Math.abs(anticipationError) < 1.0) {
      sb.push('✅ Calibração Excelente! Ajuste não necessário.')
    } else {
      if (anticipationError > 0) {
        sb.push('⚠️ Sistema Antecipado (Config > Real).\n')
        sb.push(`Diminuir a medida Antena-Engate em ${Math.abs(anticipationError).toFixed(1)} cm.`)
      } else {
        sb.push('⚠️ Sistema Atrasado (Config < Real).\n')
        sb.push(`Aumentar a medida Antena-Engate em ${Math.abs(anticipationError).toFixed(1)} cm.`)
      }
    }
  }

  resultFinal.value = newAntennaHitch.toFixed(3) + ' m'
  resultFeedback.value = sb.join('\n')

  calculated.value = true
  nextTick(() => drawCanvas(internalOff, internalOn, plantWidthM))
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
}

function drawCanvas(errorOffCm, errorOnCm, plantWidthM) {
  const canvas = canvasRef.value
  if (!canvas) return
  resizeCanvas()
  const ctx = canvas.getContext('2d')

  const dpr = window.devicePixelRatio || 1
  ctx.scale(dpr, dpr)

  const w = canvas.getBoundingClientRect().width
  const h = canvas.getBoundingClientRect().height
  const cx = w / 2
  const cy = h / 2

  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(0, 0, w, h)

  const refHeight = h * 0.3
  const refTop = cy - refHeight / 2
  const refBottom = cy + refHeight / 2

  const plantWidthPx = w * 0.4
  const scale = plantWidthPx / (plantWidthM * 100)

  // Reference bar
  ctx.fillStyle = '#B0BEC5'
  ctx.fillRect(0, refTop, w, refHeight)
  ctx.strokeStyle = '#555'
  ctx.lineWidth = 2
  ctx.strokeRect(0, refTop, w, refHeight)
  ctx.fillStyle = '#000'
  ctx.textAlign = 'left'
  ctx.font = '11px sans-serif'
  ctx.fillText('Passada 1 (Referência)', 10, cy + 5)

  // Current pass vertical green area
  const passLeft = cx - plantWidthPx / 2
  const passRight = cx + plantWidthPx / 2

  const stopY = refTop - errorOffCm * scale
  const startY = refBottom + errorOnCm * scale

  ctx.fillStyle = '#66BB6A'
  ctx.fillRect(passLeft, 0, plantWidthPx, stopY)
  ctx.fillRect(passLeft, startY, plantWidthPx, h - startY)

  // Ideal lines (dashed blue)
  ctx.strokeStyle = '#2196F3'
  ctx.lineWidth = 3
  ctx.setLineDash([8, 5])

  ctx.beginPath()
  ctx.moveTo(passLeft - 20, refTop)
  ctx.lineTo(passRight + 20, refTop)
  ctx.stroke()
  ctx.fillStyle = '#aaa'
  ctx.textAlign = 'left'
  ctx.fillText('Ideal', passRight + 25, refTop + 5)

  ctx.beginPath()
  ctx.moveTo(passLeft - 20, refBottom)
  ctx.lineTo(passRight + 20, refBottom)
  ctx.stroke()
  ctx.fillText('Ideal', passRight + 25, refBottom + 5)

  ctx.setLineDash([])

  // Real lines (solid red)
  ctx.strokeStyle = '#F44336'
  ctx.lineWidth = 3

  ctx.beginPath()
  ctx.moveTo(passLeft, stopY)
  ctx.lineTo(passRight, stopY)
  ctx.stroke()
  ctx.fillStyle = '#aaa'
  ctx.textAlign = 'right'
  ctx.fillText('Real', passLeft - 10, stopY + 5)

  ctx.beginPath()
  ctx.moveTo(passLeft, startY)
  ctx.lineTo(passRight, startY)
  ctx.stroke()
  ctx.fillText('Real', passLeft - 10, startY + 5)

  // Error labels
  ctx.font = 'bold 10px sans-serif'
  ctx.textAlign = 'center'
  if (errorOffCm !== 0) {
    const label = errorOffCm > 0 ? 'FALHA' : 'SOBREP.'
    ctx.fillStyle = '#F44336'
    ctx.fillText(label, cx, stopY - 10)
  }
  if (errorOnCm !== 0) {
    const label = errorOnCm > 0 ? 'FALHA' : 'SOBREP.'
    ctx.fillStyle = '#F44336'
    ctx.fillText(label, cx, startY + 20)
  }

  // Text ENTRADA / SAÍDA
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('ENTRADA', cx, 20)
  ctx.fillText('SAÍDA', cx, h - 10)
}

onMounted(() => {
  nextTick(() => drawCanvas(0, 0, 9))
})
</script>
