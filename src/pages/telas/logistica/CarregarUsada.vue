<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center justify-between q-mb-xl q-col-gutter-sm">
      <div class="row items-center q-gutter-sm">
        <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
        <div>
          <div class="text-h5 text-weight-bold">Carregar Usada</div>
          <div class="text-caption text-grey-5">Máquinas de negociação para transporte</div>
        </div>
      </div>
    </div>

    <div v-if="carregando" class="flex flex-center q-py-xl">
      <q-spinner color="orange-8" size="48px" />
    </div>

    <div v-else-if="despachos.length === 0" class="flex flex-center column q-py-xl text-center">
      <q-icon name="check_circle" size="72px" color="green-7" class="q-mb-md" />
      <div class="text-h6 text-grey-5 q-mb-sm">Nenhum despacho pendente</div>
      <div class="text-body2 text-grey-6">Você não tem máquinas para carregar no momento.</div>
    </div>

    <div v-else class="q-gutter-md">
      <q-card
        v-for="d in despachos"
        :key="d.id"
        class="bg-grey-9 text-white"
        style="border-radius: 12px; border: 1px solid #424242"
      >
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <div class="text-h6 text-weight-bold text-orange-8">{{ d.modelo }}</div>
              <div class="text-caption text-grey-5">Série: {{ d.serie }}</div>
              <div class="text-caption text-grey-5 q-mt-xs">
                <q-icon name="place" size="13px" color="grey-5" class="q-mr-xs" />
                Origem: {{ d.unidadeOrigem }} → {{ d.unidadeDestino }}
              </div>
            </div>
            <q-badge color="purple-6" rounded class="q-px-sm q-py-xs text-white text-weight-bold">
              Aguardando Carga
            </q-badge>
          </div>
        </q-card-section>

        <q-separator color="grey-8" />

        <q-card-actions align="right" class="bg-grey-10 q-pa-sm">
          <q-btn
            flat
            color="purple-4"
            icon="visibility"
            label="Ver Itens"
            @click="abrirDetalhe(d)"
          />
          <q-btn
            color="purple-6"
            text-color="white"
            icon="local_shipping"
            label="Iniciar Carga"
            @click="abrirCarga(d)"
          />
        </q-card-actions>
      </q-card>
    </div>

    <!-- Dialog de Detalhe (visão apenas) -->
    <q-dialog
      v-model="dialogDetalheAberto"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-10 text-white">
        <q-card-section class="bg-grey-9 row items-center justify-between">
          <div class="text-h6 text-orange-8">{{ maquinaSelecionada?.modelo }}</div>
          <q-btn
            flat
            round
            dense
            icon="close"
            color="grey-5"
            @click="dialogDetalheAberto = false"
          />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="text-caption text-grey-5 q-mb-md">Itens avaliados pelo vendedor:</div>
          <q-list separator>
            <q-item v-for="(item, idx) in maquinaSelecionada?.checklistAvaliacao || []" :key="idx">
              <q-item-section>
                <q-item-label class="text-white">{{ item.texto }}</q-item-label>
                <q-item-label caption v-if="item.observacao">
                  <span class="text-grey-5">{{ item.observacao }}</span>
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge :color="corStatus(item.resposta)">
                  {{ item.resposta || 'N/A' }}
                </q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog de Carga (confirmação + assinatura) -->
    <q-dialog
      v-model="dialogCargaAberto"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-10 text-white column full-height">
        <q-card-section class="col-shrink bg-grey-9 row items-center shadow-2">
          <div>
            <div class="text-h6 text-orange-8">Confirmar Carregamento</div>
            <div class="text-caption text-grey-5">
              {{ maquinaSelecionada?.modelo }} — {{ maquinaSelecionada?.serie }}
            </div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" color="grey-5" @click="dialogCargaAberto = false" />
        </q-card-section>

        <q-card-section class="col q-pa-md scroll">
          <div class="text-subtitle2 text-grey-5 q-mb-sm">ITENS AVALIADOS PELO VENDEDOR</div>
          <q-card class="bg-grey-9 q-mb-md" style="border: 1px solid #333; border-radius: 8px">
            <q-list separator>
              <q-item
                v-for="(item, idx) in maquinaSelecionada?.checklistAvaliacao || []"
                :key="idx"
              >
                <q-item-section>
                  <q-item-label class="text-white">{{ item.texto }}</q-item-label>
                  <q-item-label caption>
                    <q-badge :color="corStatus(item.resposta)" class="q-mr-xs">
                      Vendedor: {{ item.resposta || 'N/A' }}
                    </q-badge>
                    <span v-if="item.observacao && item.observacao !== '-'" class="text-grey-5">
                      {{ item.observacao }}
                    </span>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-checkbox v-model="itensConferidos[idx]" :val="true" color="purple-6" dark />
                </q-item-section>
              </q-item>

              <div class="q-px-md q-pb-sm">
                <q-input
                  v-model="observacoesMotorista[idx]"
                  label="Observação do motorista"
                  dark
                  dense
                  filled
                  color="purple-6"
                  bg-color="grey-10"
                />
              </div>
              <q-separator dark />
            </q-list>
          </q-card>

          <div class="text-subtitle2 text-grey-5 q-mb-sm">ASSINATURA DO MOTORISTA</div>
          <q-card class="bg-grey-10" style="border-radius: 8px; border: 1px solid #555">
            <q-card-section class="q-pa-md">
              <div class="flex justify-between items-center q-mb-md">
                <div class="text-subtitle2 text-weight-bold text-white flex items-center">
                  <q-icon name="person" class="q-mr-sm text-purple-6" size="sm" />
                  Motorista
                </div>
                <q-badge
                  :color="assinado ? 'green-8' : 'grey-8'"
                  rounded
                  class="q-px-sm q-py-xs text-weight-bold"
                >
                  <q-icon
                    :name="assinado ? 'check_circle' : 'pending'"
                    class="q-mr-xs"
                    size="14px"
                  />
                  {{ assinado ? 'Assinado' : 'Pendente' }}
                </q-badge>
              </div>

              <q-btn
                :color="assinado ? 'grey-8' : 'purple-6'"
                :icon="assinado ? 'draw' : 'gesture'"
                :label="assinado ? 'Refazer Assinatura' : 'Coletar Assinatura'"
                class="full-width text-weight-bold"
                unelevated
                style="border-radius: 6px"
                @click="dialogAssinaturaAberto = true"
              />
            </q-card-section>
          </q-card>
        </q-card-section>

        <q-card-section class="col-shrink bg-grey-9 shadow-up-2 q-pa-md">
          <q-btn
            color="green-7"
            text-color="white"
            icon="check_circle"
            label="Confirmar Carregamento"
            class="full-width"
            size="lg"
            :loading="salvando"
            :disable="!podeConfirmar"
            @click="confirmarCarregamento"
          />
          <div v-if="!podeConfirmar" class="text-caption text-center text-grey-5 q-mt-sm">
            Confera todos os itens e assine para confirmar
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog de Assinatura -->
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
              <q-avatar icon="draw" color="purple-6" text-color="white" size="md" class="q-mr-sm" />
              <div>
                <div class="text-h6 text-white" style="line-height: 1.2">
                  Assinatura do Motorista
                </div>
                <div class="text-caption text-purple-4">Assine no espaço em branco abaixo</div>
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
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import { getAuth } from 'firebase/auth'

const $q = useQuasar()

const carregando = ref(true)
const despachos = ref([])
const dialogDetalheAberto = ref(false)
const dialogCargaAberto = ref(false)
const dialogAssinaturaAberto = ref(false)
const maquinaSelecionada = ref(null)
const itensConferidos = ref({})
const observacoesMotorista = ref({})
const assinado = ref(false)
const salvando = ref(false)

// Canvas
const canvasRef = ref(null)
const isDrawing = ref(false)
let lastX = 0
let lastY = 0
const assinaturaImagem = ref(null)

const podeConfirmar = computed(() => {
  const lista = maquinaSelecionada.value?.checklistAvaliacao || []
  const todosConferidos = lista.every((_, idx) => itensConferidos.value[idx] === true)
  return assinado.value && todosConferidos
})

const corStatus = (resposta) => {
  const map = {
    BOM: 'positive',
    ATENCAO: 'warning',
    RUIM: 'negative',
    SIM: 'positive',
    NAO: 'negative',
    OK: 'positive',
    FALTA: 'negative',
  }
  return map[resposta] || 'grey'
}

const buscarDespachos = async () => {
  carregando.value = true
  try {
    const uid = getAuth().currentUser?.uid
    if (!uid) {
      carregando.value = false
      return
    }
    const q = query(
      collection(db, 'despachos_usados'),
      where('motoristaUid', '==', uid),
      where('status', '==', 'despachado'),
    )
    const snap = await getDocs(q)
    despachos.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('Erro ao buscar despachos:', e)
    $q.notify({ type: 'negative', message: 'Erro ao carregar despachos.' })
  } finally {
    carregando.value = false
  }
}

const abrirDetalhe = (d) => {
  maquinaSelecionada.value = d
  dialogDetalheAberto.value = true
}

const abrirCarga = (d) => {
  maquinaSelecionada.value = d
  itensConferidos.value = {}
  observacoesMotorista.value = {}
  assinado.value = false
  assinaturaImagem.value = null
  dialogCargaAberto.value = true
}

// Canvas
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
  let clientX, clientY
  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX
    clientY = e.touches[0].clientY
  } else {
    clientX = e.clientX
    clientY = e.clientY
  }
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

const stopDrawing = () => {
  isDrawing.value = false
}

const confirmarAssinatura = () => {
  if (!assinado.value) {
    $q.notify({ type: 'warning', message: 'Faça a assinatura antes de confirmar.' })
    return
  }
  assinaturaImagem.value = canvasRef.value.toDataURL('image/png')
  dialogAssinaturaAberto.value = false
  $q.notify({ type: 'positive', message: 'Assinatura confirmada.' })
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
  assinado.value = true
}

const limparAssinatura = () => {
  const ctx = canvasRef.value.getContext('2d')
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  assinado.value = false
  assinaturaImagem.value = null
}

const confirmarCarregamento = async () => {
  salvando.value = true
  try {
    const docRef = doc(db, 'despachos_usados', maquinaSelecionada.value.id)
    await updateDoc(docRef, {
      status: 'carregado',
      dataCarregamento: Timestamp.now(),
      assinaturaMotoristaImagem: assinaturaImagem.value,
      observacoesMotorista: { ...observacoesMotorista.value },
      itensConferidos: { ...itensConferidos.value },
    })

    // Atualiza cardálogo local (opcional, mas já faz parte do flow de entrega)
    $q.notify({ type: 'positive', message: 'Carregamento confirmado com sucesso!' })
    dialogCargaAberto.value = false
    await buscarDespachos()
  } catch (e) {
    console.error('Erro ao confirmar carregamento:', e)
    $q.notify({ type: 'negative', message: 'Erro ao confirmar carregamento.' })
  } finally {
    salvando.value = false
  }
}

onMounted(buscarDespachos)
</script>

<style scoped>
.signature-container {
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
}
</style>
