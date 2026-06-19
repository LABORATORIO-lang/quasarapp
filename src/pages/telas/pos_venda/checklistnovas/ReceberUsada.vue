<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center justify-between q-mb-xl q-col-gutter-sm">
      <div class="row items-center q-gutter-sm">
        <q-btn flat round icon="arrow_back" color="orange-8" @click="voltar" />
        <div>
          <div class="text-h5 text-weight-bold">
            {{ modoForm ? 'Receber Máquina Usada' : 'Receber Usada' }}
          </div>
          <div class="text-caption text-grey-5">
            {{
              modoForm
                ? 'Confira os itens e confirme o recebimento'
                : 'Máquinas chegando nesta unidade'
            }}
          </div>
        </div>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="carregando" class="flex flex-center q-py-xl">
      <q-spinner color="orange-8" size="48px" />
    </div>

    <!-- LISTA -->
    <div v-else-if="!modoForm">
      <div v-if="despachos.length === 0" class="flex flex-center column q-py-xl text-center">
        <q-icon name="inventory_2" size="72px" color="green-7" class="q-mb-md" />
        <div class="text-h6 text-grey-5 q-mb-sm">Nenhuma máquina para receber</div>
        <div class="text-body2 text-grey-6">
          Não há máquinas usadas em trânsito para esta unidade.
        </div>
      </div>

      <div v-else class="q-gutter-md">
        <q-card
          v-for="d in despachos"
          :key="d.id"
          class="bg-grey-9 text-white"
          style="border-radius: 12px; border: 1px solid #424242"
        >
          <q-card-section>
            <div class="row items-start justify-between no-wrap">
              <div class="col">
                <div class="text-h6 text-weight-bold text-orange-8">{{ d.modelo }}</div>
                <div class="text-caption text-grey-5">Série: {{ d.serie }}</div>
                <div class="text-caption text-grey-5 q-mt-xs">
                  <q-icon name="person" size="13px" color="grey-5" class="q-mr-xs" />
                  Vendedor: {{ d.cliente || 'N/A' }}
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  <q-icon name="schedule" size="13px" color="grey-5" class="q-mr-xs" />
                  Carregado em {{ formatarData(d.dataCarregamento) }}
                </div>
              </div>
              <div class="col-auto q-ml-sm">
                <q-badge color="green-8" text-color="white" rounded class="q-px-sm q-py-xs">
                  Chegando
                </q-badge>
              </div>
            </div>
          </q-card-section>
          <q-separator color="grey-8" />
          <q-card-actions align="right" class="bg-grey-10 q-pa-sm">
            <q-btn
              color="orange-8"
              text-color="black"
              icon="download_done"
              label="Receber"
              @click="abrirFormulario(d)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- FORMULÁRIO DE RECEBIMENTO -->
    <div v-else>
      <q-card class="bg-grey-9 q-mb-md" style="border: 1px solid #ff9800; border-radius: 8px">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold text-orange-8 q-mb-sm">Dados da Máquina</div>
          <div class="text-caption text-grey-4">
            Modelo: <strong class="text-white">{{ despacho.modelo }}</strong>
          </div>
          <div class="text-caption text-grey-4">
            Série: <strong class="text-white">{{ despacho.serie }}</strong>
          </div>
          <div class="text-caption text-grey-4 q-mt-xs">
            Origem: <strong class="text-white">{{ despacho.unidadeOrigem }}</strong>
          </div>
          <div class="text-caption text-grey-4">
            Destino: <strong class="text-white">{{ despacho.unidadeDestino }}</strong>
          </div>
          <div class="text-caption text-grey-4">
            Motorista: <strong class="text-white">{{ despacho.motoristaNome }}</strong>
          </div>
        </q-card-section>
      </q-card>

      <div v-if="checklistExibido.length > 0" class="row items-center justify-between q-mb-sm">
        <div class="text-subtitle2 text-grey-5">ITENS DE VERIFICAÇÃO</div>
        <q-badge color="orange-8" class="text-black text-weight-bold">
          {{ itensVerificados }} / {{ totalItens }} verificados
        </q-badge>
      </div>

      <q-card
        v-if="checklistExibido.length > 0"
        class="bg-grey-9 q-mb-md"
        style="border: 1px solid #333; border-radius: 8px"
      >
        <q-list separator>
          <template v-for="(item, idx) in checklistExibido" :key="idx">
            <q-item>
              <q-item-section>
                <q-item-label class="text-white">{{ item.texto || 'Item sem nome' }}</q-item-label>
                <q-item-label caption>
                  <q-badge :color="corStatus(item.resposta)" class="q-mr-xs">
                    Vendedor: {{ item.resposta || 'N/A' }}
                  </q-badge>
                  <span v-if="item.observacao && item.observacao !== '-'" class="text-grey-5">
                    {{ item.observacao }}
                  </span>
                </q-item-label>
              </q-item-section>
              <q-item-section side class="row items-center">
                <q-checkbox
                  v-model="respostasRecebedor[idx]"
                  :true-value="true"
                  :false-value="false"
                  dark
                  dense
                  color="orange-8"
                  keep-color
                  class="q-ma-none"
                  :indeterminate="false"
                />
              </q-item-section>
            </q-item>
            <div class="q-px-md q-pb-sm">
              <q-input
                v-model="observacoesRecebedor[idx]"
                label="Observação do recebedor"
                dark
                dense
                filled
                color="orange-8"
                bg-color="grey-10"
              />
            </div>
            <q-separator dark />
          </template>
        </q-list>
      </q-card>

      <div class="text-subtitle2 text-weight-bold text-uppercase q-mb-sm q-ml-xs q-mt-lg">
        Assinatura do Responsável
      </div>
      <q-card
        class="bg-grey-10"
        style="border-radius: 8px; border: 1px solid #555"
        :style="assinado ? 'border-color: #4caf50; box-shadow: 0 0 8px rgba(76, 175, 80, 0.2)' : ''"
      >
        <q-card-section class="q-pa-md">
          <div class="flex justify-between items-center q-mb-md">
            <div class="text-subtitle2 text-weight-bold text-white flex items-center">
              <q-icon name="person" class="q-mr-sm text-orange-8" size="sm" /> Recebedor
            </div>
            <q-badge
              :color="assinado ? 'green-8' : 'grey-8'"
              :text-color="assinado ? 'white' : 'grey-4'"
              rounded
              class="q-px-sm q-py-xs text-weight-bold"
            >
              <q-icon :name="assinado ? 'check_circle' : 'pending'" class="q-mr-xs" size="14px" />
              {{ assinado ? 'Assinado' : 'Pendente' }}
            </q-badge>
          </div>

          <q-input
            v-model="nomeRecebedor"
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

          <q-input
            v-model="nomeMotorista"
            label="Nome do Motorista (opcional)"
            dark
            filled
            dense
            color="orange-8"
            bg-color="grey-9"
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="person_pin" size="xs" color="grey-5" />
            </template>
          </q-input>

          <q-btn
            :color="assinado ? 'grey-8' : 'orange-8'"
            :text-color="assinado ? 'white' : 'black'"
            :icon="assinado ? 'draw' : 'gesture'"
            :label="assinado ? 'Refazer Assinatura' : 'Coletar Assinatura'"
            class="full-width text-weight-bold"
            unelevated
            style="border-radius: 6px"
            @click="abrirDialogAssinatura('responsavel')"
          />
        </q-card-section>
      </q-card>

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
                <q-avatar
                  icon="draw"
                  color="orange-8"
                  text-color="black"
                  size="md"
                  class="q-mr-sm"
                />
                <div>
                  <div class="text-h6 text-white" style="line-height: 1.2">
                    {{
                      tipoAssinaturaAtual === 'motorista'
                        ? 'Assinatura do Motorista'
                        : 'Assinatura do Recebedor'
                    }}
                  </div>
                  <div class="text-caption text-orange-8">Assine no espaço em branco abaixo</div>
                </div>
              </div>
              <div class="row items-center">
                <q-segment
                  v-model="tipoAssinaturaAtual"
                  dense
                  rounded
                  color="orange-8"
                  text-color="white"
                >
                  <q-segment-item name="responsavel">Recebedor</q-segment-item>
                  <q-segment-item name="motorista">Motorista</q-segment-item>
                </q-segment>
                <q-btn
                  flat
                  round
                  dense
                  icon="close"
                  color="grey-5"
                  @click="dialogAssinaturaAberto = false"
                />
              </div>
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

      <q-card class="bg-grey-9 q-mb-md" style="border: 1px solid #333; border-radius: 8px">
        <q-card-section>
          <div class="text-subtitle2 text-grey-5 q-mb-xs">OBSERVAÇÃO GERAL</div>
          <q-input
            v-model="observacaoGeral"
            type="textarea"
            dark
            outlined
            color="orange-8"
            placeholder="Escreva aqui se necessário..."
            autogrow
          />
        </q-card-section>
      </q-card>

      <q-btn
        class="full-width q-mt-md"
        color="green-7"
        text-color="white"
        icon="check_circle"
        label="Confirmar Recebimento"
        size="lg"
        :loading="salvando"
        :disable="!podeConfirmar"
        @click="confirmarRecebimento"
      />
      <div v-if="!podeConfirmar" class="text-caption text-center text-grey-5 q-mt-sm">
        Verifique todos os itens, preencha nome completo e assine para confirmar
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, toRaw, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import {
  doc,
  getDoc,
  updateDoc,
  Timestamp,
  arrayUnion,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import localforage from 'localforage'
import { gerarChecklistPdf } from 'src/utils/pdfGenerator'
import { salvarChecklistLogistica, verificarStatusServidor } from 'src/utils/ServidorApi'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const carregando = ref(true)
const modoForm = ref(false)
const despacho = ref(null)
const despachos = ref([])
const respostasRecebedor = ref({})
const observacoesRecebedor = ref({})
const nomeRecebedor = ref('')
const observacaoGeral = ref('')
const assinado = ref(false)
const tipoAssinaturaAtual = ref('responsavel')
const assinaturaMotoristaImagem = ref(null)
const assinadoMotorista = ref(false)
const nomeMotorista = ref('')
const salvando = ref(false)
const minhaUnidade = ref('')

const canvasRef = ref(null)
const isDrawing = ref(false)
let lastX = 0
let lastY = 0
const assinaturaImagem = ref(null)
const dialogAssinaturaAberto = ref(false)

const totalItens = computed(() => (checklistExibido.value || []).length)
const itensVerificados = computed(() => {
  return Object.values(respostasRecebedor.value).filter((v) => v === true).length
})

const podeConfirmar = computed(() => {
  const nomeOk = nomeRecebedor.value.trim().length > 2
  const assinaOk = assinado.value
  const lista = checklistExibido.value || []
  const todosRespondidos = lista.every((_, idx) => respostasRecebedor.value[idx] === true)
  return nomeOk && assinaOk && todosRespondidos
})

const corStatus = (resposta) => {
  const map = {
    BOM: 'positive',
    ATENCAO: 'warning',
    ATENÇÃO: 'warning',
    RUIM: 'negative',
    SIM: 'positive',
    NAO: 'negative',
    NÃO: 'negative',
    OK: 'positive',
    FALTA: 'negative',
  }
  return map[resposta] || 'grey'
}

const checklistExibido = computed(() => {
  if (!despacho.value) return []
  const itensVendedor = Array.isArray(despacho.value.checklistAvaliacao)
    ? despacho.value.checklistAvaliacao
    : []
  const obsMotorista = despacho.value.observacoesMotorista || {}
  return itensVendedor.map((item, idx) => ({
    ...(item || {}),
    obsMotorista: obsMotorista[idx] || null,
  }))
})

const formatarData = (iso) => {
  if (!iso) return ''
  try {
    const d = iso.toDate ? iso.toDate() : new Date(iso)
    return d.toLocaleDateString('pt-BR')
  } catch {
    return ''
  }
}

// === MODO LISTA ===
const carregarLista = async () => {
  console.log('CARREGANDO LISTA para unidade:', minhaUnidade.value)
  carregando.value = true
  try {
    const sessao = await localforage.getItem('user_session')
    minhaUnidade.value = sessao?.unidade || sessao?.cidade || ''
    if (!minhaUnidade.value) {
      $q.notify({ type: 'warning', message: 'Unidade não identificada.' })
      return
    }

    const q = query(
      collection(db, 'despachos_usados'),
      where('status', '==', 'carregado'),
      where('unidadeDestino', '==', minhaUnidade.value),
    )
    const snap = await getDocs(q)
    despachos.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    console.log('DESPACHOS ENCONTRADOS:', despachos.value.length)
  } catch (e) {
    console.error('Erro ao carregar lista:', e)
    $q.notify({ type: 'negative', message: 'Erro ao carregar usadas.' })
  } finally {
    carregando.value = false
  }
}

// === MODO FORM ===
const carregarDespacho = async (id) => {
  carregando.value = true
  try {
    const snap = await getDoc(doc(db, 'despachos_usados', id))
    if (!snap.exists()) {
      $q.notify({ type: 'warning', message: 'Despacho não encontrado.' })
      voltar()
      return
    }
    const d = snap.data()
    if (d.status !== 'carregado') {
      $q.notify({ type: 'warning', message: 'Este despacho ainda não foi carregado.' })
      voltar()
      return
    }
    despacho.value = { id: snap.id, ...d }
  } catch (e) {
    console.error('Erro ao carregar despacho:', e)
    $q.notify({ type: 'negative', message: 'Erro ao carregar despacho.' })
  } finally {
    carregando.value = false
  }
}

const abrirFormulario = (d) => {
  // Muda para modo form sem mudar de rota (simula query param)
  modoForm.value = true
  despacho.value = d
  respostasRecebedor.value = {}
  observacoesRecebedor.value = {}
  const itens = Array.isArray(d.checklistAvaliacao) ? d.checklistAvaliacao : []
  itens.forEach((_, idx) => {
    respostasRecebedor.value[idx] = false
  })
  // Inicializa nomes e assinaturas se vierem no despacho
  nomeRecebedor.value = ''
  nomeMotorista.value = d.motoristaNome || ''
  assinaturaMotoristaImagem.value = d.motoristaImagem || null
}

const abrirDialogAssinatura = async (tipo = 'responsavel') => {
  tipoAssinaturaAtual.value = tipo
  dialogAssinaturaAberto.value = true
  await nextTick()
  initCanvas()
}

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
  // Se já existe uma assinatura para o tipo atual, desenha-a no canvas
  const imgSrc =
    tipoAssinaturaAtual.value === 'motorista'
      ? assinaturaMotoristaImagem.value
      : assinaturaImagem.value
  if (imgSrc) {
    const img = new Image()
    img.onload = () => {
      // limpar canvas e desenhar a assinatura existente
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      // desenhar centrado e ajustado
      ctx.drawImage(img, 0, 0, canvas.width / (ratio || 1), canvas.height / (ratio || 1))
      // marcar como assinada localmente
      if (tipoAssinaturaAtual.value === 'motorista') assinadoMotorista.value = true
      else assinado.value = true
    }
    img.src = imgSrc
  } else {
    // canvas limpo
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
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
  if (tipoAssinaturaAtual.value === 'motorista') {
    if (!assinado.value) {
      $q.notify({ type: 'warning', message: 'Faça a assinatura do motorista antes de confirmar.' })
      return
    }
    assinaturaMotoristaImagem.value = canvasRef.value.toDataURL('image/png')
    assinadoMotorista.value = true
    dialogAssinaturaAberto.value = false
    $q.notify({ type: 'positive', message: 'Assinatura do motorista confirmada.' })
    return
  }

  // assinatura do recebedor (padrão)
  if (!assinado.value) {
    $q.notify({ type: 'warning', message: 'Faça a assinatura antes de confirmar.' })
    return
  }
  assinaturaImagem.value = canvasRef.value.toDataURL('image/png')
  assinado.value = true
  dialogAssinaturaAberto.value = false
  $q.notify({ type: 'positive', message: 'Assinatura confirmada.' })
}

// Recarregar canvas ao trocar tipo de assinatura
watch(tipoAssinaturaAtual, () => {
  initCanvas()
})

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
  if (tipoAssinaturaAtual.value === 'motorista') assinadoMotorista.value = true
  else assinado.value = true
}

const limparAssinatura = () => {
  const ctx = canvasRef.value.getContext('2d')
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  if (tipoAssinaturaAtual.value === 'motorista') {
    assinadoMotorista.value = false
    assinaturaMotoristaImagem.value = null
  } else {
    assinado.value = false
    assinaturaImagem.value = null
  }
}

const confirmarRecebimento = async () => {
  salvando.value = true
  try {
    $q.loading.show({ message: 'Finalizando recebimento...' })
    const d = despacho.value
    const serie = d.serie

    // Gerar dados para PDF
    const agora = new Date()
    const dataHoraFormatada =
      agora.toLocaleDateString('pt-BR') +
      ' às ' +
      agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

    const dadosParaPdf = {
      id: Date.now().toString(),
      tipoPdf: 'recebimento_usada',
      nomeMaquina: d.modelo,
      dadosFormulario: {
        serie: d.serie,
        modelo: d.modelo,
        marca: d.marca || '',
        ano: d.ano || '',
        unidadeOrigem: d.unidadeOrigem,
        unidadeDestino: d.unidadeDestino,
      },
      respostasChecklist: (checklistExibido.value || []).map((item, idx) => ({
        texto: item.texto,
        resposta: respostasRecebedor.value[idx] === true ? 'OK' : 'FALTOU',
        observacao: observacoesRecebedor.value[idx] || '',
      })),
      assinaturas: {
        responsavelNome: nomeRecebedor.value,
        responsavelImagem: assinaturaImagem.value,
        // incluir dados do motorista quando disponíveis (prefere valores coletados localmente)
        motoristaNome: nomeMotorista.value || d.motoristaNome || '',
        motoristaImagem: assinaturaMotoristaImagem.value || d.motoristaImagem || null,
      },
      dataConclusao: agora.toLocaleDateString('pt-BR'),
      dataHoraFormatada,
      // Use unidade emissora (origem) para o cabeçalho do PDF
      unidadeUsuario: d.unidadeOrigem || d.unidadeDestino,
      observacaoGeral: observacaoGeral.value,
    }

    // Gerar PDF
    const dadosLimpos = JSON.parse(JSON.stringify(toRaw(dadosParaPdf)))
    const arquivoPdfBase64 = await gerarChecklistPdf(dadosLimpos, true)
    const base64Limpo = arquivoPdfBase64.includes(',')
      ? arquivoPdfBase64.split(',')[1]
      : arquivoPdfBase64

    // Obter número de ação
    const maquinaRef = doc(db, 'maquinas', serie)
    const maquinaSnap = await getDoc(maquinaRef)
    const historicoAtual = maquinaSnap.exists() ? maquinaSnap.data().historico || [] : []
    const numeroAcao = historicoAtual.length + 1
    const pdfNome = `${serie}-${numeroAcao}-recebimento-usada`

    // Salvar PDF no servidor local se online
    try {
      const servidorOnline = await verificarStatusServidor()
      if (servidorOnline.online) {
        await salvarChecklistLogistica(d.unidadeDestino, pdfNome, base64Limpo)
        console.log('✅ PDF de recebimento enviado ao servidor.')
      }
    } catch (errServidor) {
      console.warn('Servidor local offline:', errServidor.message)
    }

    const itemHistorico = {
      tipo: 'recebimento_usada',
      cliente: d.cliente || '',
      unidade: d.unidadeDestino,
      data: new Date().toISOString().slice(0, 10),
      responsavel: nomeRecebedor.value,
      numero: numeroAcao,
      pdfNome: pdfNome,
      observacaoGeral: observacaoGeral.value,
      de: d.unidadeOrigem,
      para: d.unidadeDestino,
      motorista: nomeMotorista.value || d.motoristaNome,
      idUnicoAcao: dadosParaPdf.id,
    }

    const payloadFirebase = {
      status: 'recebido',
      dataRecebimento: Timestamp.now(),
      recebidoPor: nomeRecebedor.value,
      // Assinaturas e nomes: armazenamos nomes e imagens das assinaturas (base64) conforme solicitado
      assinaturaRecebedor: assinaturaImagem.value || null,
      motoristaNome: nomeMotorista.value || null,
      assinaturaMotorista: assinaturaMotoristaImagem.value || null,
      pdfRecebimentoNome: pdfNome,
      checklistRecebimento: (checklistExibido.value || []).map((item, idx) => ({
        texto: item.texto,
        respostaVendedor: item.resposta,
        respostaRecebedor: respostasRecebedor.value[idx] === true ? 'OK' : '',
        observacaoRecebedor: observacoesRecebedor.value[idx] || '',
      })),
      observacaoGeral: observacaoGeral.value,
    }

    // Atualizar despacho
    if (navigator.onLine) {
      try {
        console.log('Payload a ser enviado para despachos_usados:', payloadFirebase)
        await updateDoc(doc(db, 'despachos_usados', d.id), payloadFirebase)
        console.log('Payload salvo em despachos_usados com sucesso:', payloadFirebase)

        // Atualizar máquina
        if (!maquinaSnap.exists()) {
          await setDoc(maquinaRef, {
            serie,
            modelo: d.modelo,
            marca: d.marca || '',
            ano: d.ano || '',
            horimetro: d.horimetro || '',
            unidadeAtual: d.unidadeDestino,
            status: 'recebida_usada',
            origem: 'negociacao',
            checklistEntrada: (checklistExibido.value || []).map((item, idx) => ({
              texto: item.texto,
              resposta: respostasRecebedor.value[idx] === true ? 'OK' : item.resposta || '',
              observacao: observacoesRecebedor.value[idx] || item.observacao || '-',
            })),
            historico: [itemHistorico],
            ultimaAtualizacao: Timestamp.now(),
            dataEntrada: Timestamp.now(),
          })
        } else {
          const flagDuplicado = historicoAtual.some(
            (h) => h.idUnicoAcao === itemHistorico.idUnicoAcao,
          )
          if (!flagDuplicado) {
            await updateDoc(maquinaRef, {
              status: 'recebida_usada',
              unidadeAtual: d.unidadeDestino,
              ultimaAtualizacao: Timestamp.now(),
              historico: arrayUnion(itemHistorico),
            })
          }
        }

        // Atualizar avaliação
        await updateDoc(doc(db, 'avaliacoes_usadas', serie), {
          status: 'recebida',
          dataRecebimento: Timestamp.now(),
          unidadeAtual: d.unidadeDestino,
        })

        console.log('✅ Recebimento gravado com sucesso online.')
      } catch (fbError) {
        console.warn('Falha ao gravar online, enfileirando operação...', fbError)
        await empilharOperacaoOffline(serie, d.id, payloadFirebase, itemHistorico)
      }
    } else {
      await empilharOperacaoOffline(serie, d.id, payloadFirebase, itemHistorico)
    }

    $q.notify({ type: 'positive', message: 'Máquina recebida com sucesso!' })
    router.push('/inicio/pos-venda/maquinas')
  } catch (e) {
    console.error('Erro ao confirmar recebimento:', e)
    $q.notify({ type: 'negative', message: 'Erro ao confirmar recebimento.' })
  } finally {
    $q.loading.hide()
    salvando.value = false
  }
}

const empilharOperacaoOffline = async (serie, despachoCpfId, payloadMaquinas, itemHistorico) => {
  const pendentes = (await localforage.getItem('firebase_pendentes')) || []
  pendentes.push({
    colecao: 'despachos_usados',
    docId: despachoCpfId,
    maquinaDocId: serie,
    tipoDados: 'recebimento_usada',
    dadosDespacho: payloadMaquinas,
    historicoMaquina: itemHistorico,
    criadoEm: new Date().toISOString(),
  })
  await localforage.setItem('firebase_pendentes', pendentes)
  console.log('📦 Operação de recebimento enfileirada para sincronização posterior.')
}

const voltar = () => {
  if (modoForm.value) {
    modoForm.value = false
    despacho.value = null
    respostasRecebedor.value = {}
    observacoesRecebedor.value = {}
  } else {
    router.push('/inicio/pos-venda/maquinas')
  }
}

onMounted(async () => {
  const id = route.query.id
  console.log('ReceberUsada MONTADO. ID:', id)
  if (id) {
    modoForm.value = true
    await carregarDespacho(id)
  } else {
    modoForm.value = false
    await carregarLista()
  }
})
</script>

<style scoped>
.signature-container {
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
}
</style>
