<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center q-gutter-sm q-mb-lg">
      <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
      <div>
        <div class="text-h5 text-weight-bold">Editar Checklist</div>
        <div class="text-caption text-grey-5">{{ serie }} — {{ modelo }}</div>
      </div>
    </div>

    <div v-if="carregando" class="text-center q-mt-xl">
      <q-spinner color="orange-8" size="40px" />
    </div>

    <div v-else-if="itens.length === 0" class="text-center q-mt-xl">
      <q-icon name="playlist_remove" size="48px" color="grey-6" />
      <div class="text-grey-5 q-mt-sm">Nenhum checklist encontrado para esta máquina.</div>
    </div>

    <div v-else class="column q-gutter-md">
      <!-- Lista de itens editáveis -->
      <q-card class="bg-grey-9" style="border-radius: 8px; border: 1px solid #424242">
        <q-card-section>
          <div class="text-subtitle2 text-weight-bold text-orange-8 q-mb-md">
            Itens do Checklist
          </div>

          <div v-for="(item, idx) in itens" :key="idx" class="q-mb-md">
            <div class="row items-center justify-between">
              <div class="text-white text-body2">{{ item.texto }}</div>
              <q-btn-toggle
                v-model="item.novaResposta"
                toggle-color="orange-8"
                :options="opcoesResposta(item)"
                size="sm"
                dense
                class="q-ml-sm"
              />
            </div>
            <q-separator color="grey-8" class="q-mt-sm" />
          </div>
        </q-card-section>
      </q-card>

      <!-- Observação -->
      <q-card class="bg-grey-9" style="border-radius: 8px; border: 1px solid #424242">
        <q-card-section>
          <q-input
            v-model="observacao"
            label="Observação (motivo da alteração)"
            dark
            outlined
            color="orange-8"
            type="textarea"
            rows="3"
          />
        </q-card-section>
      </q-card>

      <!-- Assinatura -->
      <div class="text-subtitle2 text-weight-bold text-uppercase q-mb-sm q-ml-xs">
        Validação e Assinatura
      </div>

      <q-card
        class="bg-grey-9 shadow-5 q-mb-lg"
        style="border-radius: 12px; border: 1px solid #424242"
      >
        <q-card-section class="q-pt-md">
          <q-card
            class="bg-grey-10"
            style="border-radius: 8px; border: 1px solid #555; transition: all 0.3s ease"
            :style="
              assinaturaImagem
                ? 'border-color: #4caf50; box-shadow: 0 0 8px rgba(76, 175, 80, 0.2)'
                : ''
            "
          >
            <q-card-section class="q-pa-md">
              <div class="flex justify-between items-center q-mb-md">
                <div class="text-subtitle2 text-weight-bold text-white flex items-center">
                  <q-icon name="engineering" class="q-mr-sm text-orange-8" size="sm" />
                  Responsável pela Alteração
                </div>
                <q-badge
                  :color="assinaturaImagem ? 'green-8' : 'grey-8'"
                  :text-color="assinaturaImagem ? 'white' : 'grey-4'"
                  rounded
                  class="q-px-sm q-py-xs text-weight-bold"
                >
                  <q-icon
                    :name="assinaturaImagem ? 'check_circle' : 'pending'"
                    class="q-mr-xs"
                    size="14px"
                  />
                  {{ assinaturaImagem ? 'Assinado' : 'Pendente' }}
                </q-badge>
              </div>

              <q-input
                v-model="nomeResponsavel"
                label="Nome completo digitado"
                dark
                filled
                dense
                color="orange-8"
                bg-color="grey-9"
                class="q-mb-md"
              >
                <template v-slot:prepend>
                  <q-icon name="edit_square" size="xs" color="grey-5" />
                </template>
              </q-input>

              <q-btn
                :color="assinaturaImagem ? 'grey-8' : 'orange-8'"
                :text-color="assinaturaImagem ? 'white' : 'black'"
                :icon="assinaturaImagem ? 'draw' : 'gesture'"
                :label="assinaturaImagem ? 'Refazer Assinatura' : 'Coletar Assinatura'"
                class="full-width text-weight-bold"
                unelevated
                style="border-radius: 6px"
                @click="dialogAssinaturaAberto = true"
              />
            </q-card-section>
          </q-card>
        </q-card-section>
      </q-card>

      <!-- Dialog Assinatura -->
      <q-dialog
        v-model="dialogAssinaturaAberto"
        persistent
        maximized
        @show="initCanvas"
        transition-show="slide-up"
        transition-hide="slide-down"
      >
        <q-card class="bg-grey-10 text-white column full-height">
          <q-card-section class="col-shrink bg-grey-9 shadow-2">
            <div class="row items-center justify-between">
              <div class="row items-center">
                <q-avatar
                  icon="draw"
                  color="orange-8"
                  text-color="black"
                  size="md"
                  class="q-mr-sm"
                />
                <div>
                  <div class="text-h6 text-white" style="line-height: 1.2">
                    Assinatura do Responsável
                  </div>
                  <div class="text-caption text-orange-8">Assine no espaço em branco abaixo</div>
                </div>
              </div>
              <q-btn
                flat
                round
                dense
                icon="close"
                color="grey-5"
                @click="dialogAssinaturaAberto = false"
              />
            </div>
          </q-card-section>

          <q-card-section class="col relative-position q-pa-md flex flex-center bg-grey-10">
            <div
              class="signature-container bg-white fit shadow-5"
              style="
                border-radius: 12px;
                border: 2px dashed #ccc;
                overflow: hidden;
                position: relative;
              "
            >
              <div
                class="absolute-center text-grey-4 text-h4 text-weight-bold"
                style="opacity: 0.3; pointer-events: none"
              >
                ASSINE AQUI
              </div>

              <canvas
                ref="canvasRef"
                class="fit absolute-top-left"
                style="z-index: 10"
                @mousedown="startDrawing"
                @mousemove="draw"
                @mouseup="stopDrawing"
                @mouseleave="stopDrawing"
                @touchstart="startDrawingTouch"
                @touchmove="drawTouch"
                @touchend="stopDrawing"
              />

              <q-btn
                round
                unelevated
                icon="delete_outline"
                color="red-1"
                text-color="red-8"
                class="absolute-top-right q-ma-sm"
                style="z-index: 20; border: 1px solid #ffcdd2"
                @click="limparAssinatura"
              >
                <q-tooltip>Limpar assinatura</q-tooltip>
              </q-btn>
            </div>
          </q-card-section>

          <q-card-section class="col-shrink row q-col-gutter-md bg-grey-9 shadow-up-2">
            <div class="col-6">
              <q-btn
                outline
                label="Cancelar"
                color="grey-5"
                icon="close"
                class="full-width"
                style="border-radius: 8px; height: 50px"
                @click="dialogAssinaturaAberto = false"
              />
            </div>
            <div class="col-6">
              <q-btn
                color="green-6"
                icon="check_circle"
                label="Confirmar"
                class="full-width text-weight-bold"
                style="border-radius: 8px; height: 50px"
                @click="confirmarAssinatura"
              />
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- Histórico de edições anteriores -->
      <q-card
        v-if="edicoesAnteriores.length > 0"
        class="bg-grey-9"
        style="border-radius: 8px; border: 1px solid #424242"
      >
        <q-card-section>
          <div class="text-subtitle2 text-weight-bold text-orange-8 q-mb-md">
            Histórico de Edições
          </div>
          <div v-for="(edicao, idx) in edicoesAnteriores" :key="idx" class="q-mb-md">
            <div class="text-caption text-grey-4">
              {{ formatarData(edicao.data) }} — {{ edicao.responsavel }}
            </div>
            <div v-if="edicao.observacao" class="text-caption text-grey-5 q-mt-xs">
              "{{ edicao.observacao }}"
            </div>
            <div
              v-for="(alt, i) in edicao.alteracoes"
              :key="i"
              class="text-caption text-orange q-mt-xs"
            >
              {{ alt.item }}: {{ alt.de }} → {{ alt.para }}
            </div>
            <q-separator color="grey-8" class="q-mt-sm" />
          </div>
        </q-card-section>
      </q-card>

      <!-- Botão salvar -->
      <q-btn
        color="orange-8"
        text-color="black"
        icon="save"
        label="Salvar Alterações"
        size="lg"
        class="full-width q-mb-xl"
        :disable="!temAlteracoes"
        @click="salvarEdicao"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from 'src/boot/firebase'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const serie = ref('')
const modelo = ref('')
const itens = ref([])
const observacao = ref('')
const nomeResponsavel = ref('')
const carregando = ref(false)
const edicoesAnteriores = ref([])
const assinaturaImagem = ref(null)
const dialogAssinaturaAberto = ref(false)
// Canvas
const canvasRef = ref(null)
const isDrawing = ref(false)
const hasSigned = ref(false)
let lastX = 0
let lastY = 0

const temAlteracoes = computed(() => {
  return itens.value.some((item) => item.novaResposta !== item.resposta)
})

const opcoesResposta = (item) => {
  // Detecta tipo de opções baseado na resposta atual
  if (
    ['BOM', 'ATENCAO', 'RUIM'].includes(item.resposta) ||
    ['BOM', 'ATENCAO', 'RUIM'].includes(item.novaResposta)
  ) {
    return [
      { label: 'BOM', value: 'BOM' },
      { label: 'ATENÇÃO', value: 'ATENCAO' },
      { label: 'RUIM', value: 'RUIM' },
    ]
  }
  if (['SIM', 'NAO'].includes(item.resposta) || ['SIM', 'NAO'].includes(item.novaResposta)) {
    return [
      { label: 'SIM', value: 'SIM' },
      { label: 'NÃO', value: 'NAO' },
    ]
  }
  if (['OK', 'FALTA'].includes(item.resposta) || ['OK', 'FALTA'].includes(item.novaResposta)) {
    return [
      { label: 'OK', value: 'OK' },
      { label: 'FALTA', value: 'FALTA' },
    ]
  }
  return [
    { label: 'OK', value: 'OK' },
    { label: 'FALTA', value: 'FALTA' },
  ]
}
// Captura assinatura

const confirmarAssinatura = () => {
  if (!hasSigned.value) {
    $q.notify({ type: 'warning', message: 'Faça a assinatura antes de confirmar.' })
    return
  }
  assinaturaImagem.value = canvasRef.value.toDataURL('image/png')
  dialogAssinaturaAberto.value = false
  $q.notify({ type: 'positive', message: 'Assinatura confirmada.' })
}

const carregarChecklist = async () => {
  carregando.value = true
  try {
    serie.value = route.query.serie
    if (!serie.value) return

    const docSnap = await getDoc(doc(db, 'maquinas', serie.value))
    if (!docSnap.exists()) return

    const dados = docSnap.data()
    modelo.value = dados.modelo || ''
    edicoesAnteriores.value = dados.edicoesChecklist || []

    if (dados.checklistEntrada && Array.isArray(dados.checklistEntrada)) {
      itens.value = dados.checklistEntrada.map((item) => ({
        ...item,
        novaResposta: item.resposta,
      }))
    }
  } catch (e) {
    console.error('Erro ao carregar checklist:', e)
    $q.notify({ type: 'negative', message: 'Erro ao carregar checklist.' })
  } finally {
    carregando.value = false
  }
}

const salvarEdicao = async () => {
  if (!nomeResponsavel.value) {
    $q.notify({ type: 'warning', message: 'Preencha o nome do responsável.' })
    return
  }
  if (!assinaturaImagem.value) {
    $q.notify({ type: 'warning', message: 'A assinatura é obrigatória.' })
    return
  }

  try {
    $q.loading.show({ message: 'Salvando alterações...' })

    const auth = getAuth()
    const user = auth.currentUser

    // Monta lista de alterações
    const alteracoes = []
    itens.value.forEach((item) => {
      if (item.novaResposta !== item.resposta) {
        alteracoes.push({
          item: item.texto,
          de: item.resposta,
          para: item.novaResposta,
        })
      }
    })

    if (alteracoes.length === 0) {
      $q.notify({ type: 'info', message: 'Nenhuma alteração detectada.' })
      return
    }

    // Monta registro da edição
    const registroEdicao = {
      data: new Date().toISOString(),
      responsavel: nomeResponsavel.value,
      uid: user?.uid || null,
      assinatura: assinaturaImagem.value,

      observacao: observacao.value || '',
      alteracoes,
    }

    // Atualiza checklistEntrada com as novas respostas
    const novoChecklist = itens.value.map((item) => {
      const { novaResposta, ...resto } = item
      return { ...resto, resposta: novaResposta }
    })

    // Atualiza Firebase
    const maquinaRef = doc(db, 'maquinas', serie.value)
    const docSnap = await getDoc(maquinaRef)
    const dadosAtuais = docSnap.data()
    const edicoesExistentes = dadosAtuais.edicoesChecklist || []

    await updateDoc(maquinaRef, {
      checklistEntrada: novoChecklist,
      edicoesChecklist: [...edicoesExistentes, registroEdicao],
    })

    $q.notify({ type: 'positive', message: 'Checklist atualizado com sucesso!' })
    router.back()
  } catch (e) {
    console.error('Erro ao salvar edição:', e)
    $q.notify({ type: 'negative', message: 'Erro ao salvar alterações.' })
  } finally {
    $q.loading.hide()
  }
}

// ===== CANVAS =====
const initCanvas = async () => {
  await nextTick()
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const ratio = window.devicePixelRatio || 1
  canvas.width = rect.width * ratio
  canvas.height = rect.height * ratio
  const ctx = canvas.getContext('2d')
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  ctx.strokeStyle = '#1a1a1a'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}

const getPosition = (e) => {
  const rect = canvasRef.value.getBoundingClientRect()
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  return { x: clientX - rect.left, y: clientY - rect.top }
}

const startDrawingTouch = (e) => {
  if (e.touches.length === 1) startDrawing(e)
}
const drawTouch = (e) => {
  if (e.touches.length === 1) draw(e)
}

const startDrawing = (e) => {
  isDrawing.value = true
  const pos = getPosition(e)
  lastX = pos.x
  lastY = pos.y
}

const draw = (e) => {
  if (!isDrawing.value) return
  const ctx = canvasRef.value.getContext('2d')
  const pos = getPosition(e)
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(pos.x, pos.y)
  ctx.stroke()
  lastX = pos.x
  lastY = pos.y
  hasSigned.value = true
}

const stopDrawing = () => {
  isDrawing.value = false
}

const limparAssinatura = () => {
  const ctx = canvasRef.value.getContext('2d')
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  hasSigned.value = false
}

const formatarData = (dataStr) => {
  if (!dataStr) return ''
  return new Date(dataStr).toLocaleDateString('pt-BR')
}

onMounted(() => {
  carregarChecklist()
  nextTick(() => initCanvas())
})
</script>
<style scoped>
.signature-container {
  position: relative;
  border: 2px solid #e65100;
  border-radius: 8px;
  overflow: hidden;
}
.signature-container canvas {
  width: 100%;
  height: 100%;
  display: block;
  touch-action: none;
}
</style>
