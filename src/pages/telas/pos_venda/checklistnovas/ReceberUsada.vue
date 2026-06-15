<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center justify-between q-mb-xl q-col-gutter-sm">
      <div class="row items-center q-gutter-sm">
        <q-btn flat round icon="arrow_back" color="orange-8" @click="voltar" />
        <div>
          <div class="text-h5 text-weight-bold">Receber Máquina Usada</div>
          <div class="text-caption text-grey-5">Confira os itens e confirme o recebimento</div>
        </div>
      </div>
    </div>

    <div v-if="carregando" class="flex flex-center q-py-xl">
      <q-spinner color="orange-8" size="48px" />
    </div>

    <div v-else-if="!despacho" class="flex flex-center column q-py-xl text-center">
      <q-icon name="error_outline" size="72px" color="grey-7" class="q-mb-md" />
      <div class="text-h6 text-grey-5 q-mb-sm">Nenhuma máquina para receber</div>
      <div class="text-body2 text-grey-6">
        Não há máquinas usadas em trânsito para esta unidade.
      </div>
    </div>

    <div v-else>
      <!-- Dados da máquina -->
      <q-card class="bg-grey-9 q-mb-md" style="border: 1px solid #ff9800; border-radius: 8px">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold text-orange-8 q-mb-sm">Dados da Máquina</div>
          <div class="text-caption text-grey-4">
            Modelo: <strong class="text-white">{{ despacho.modelo }}</strong>
          </div>
          <div class="text-caption text-grey-4">
            Série: <strong class="text-white">{{ despacho.serie }}</strong>
          </div>
          <div v-if="despacho.marca" class="text-caption text-grey-4">
            Marca: <strong class="text-white">{{ despacho.marca }}</strong>
          </div>
          <div v-if="despacho.ano" class="text-caption text-grey-4">
            Ano: <strong class="text-white">{{ despacho.ano }}</strong>
          </div>
          <div v-if="despacho.horimetro" class="text-caption text-grey-4">
            Horímetro: <strong class="text-white">{{ despacho.horimetro }}</strong>
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

      <div class="row items-center justify-between q-mb-sm">
        <div class="text-subtitle2 text-grey-5">ITENS DE VERIFICAÇÃO</div>
        <q-badge color="orange-8" class="text-black text-weight-bold">
          {{ itensVerificados }} / {{ totalItens }} verificados
        </q-badge>
      </div>

      <q-card class="bg-grey-9 q-mb-md" style="border: 1px solid #333; border-radius: 8px">
        <q-list separator>
          <template v-for="(item, idx) in checklistExibido" :key="idx">
            <q-item>
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
                <q-item-label v-if="item.obsMotorista" caption class="text-purple-4">
                  <q-icon name="local_shipping" size="12px" class="q-mr-xs" />
                  Motorista: {{ item.obsMotorista }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-select
                  v-model="respostasRecebedor[idx]"
                  :options="['BOM', 'RUIM', 'ATENÇÃO', 'OK', 'FALTA']"
                  label="Recebimento"
                  dark
                  dense
                  filled
                  color="orange-8"
                  bg-color="grey-10"
                  style="min-width: 120px"
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

      <div class="text-subtitle2 text-grey-5 q-mb-sm">DADOS DO RECEBEDOR</div>
      <q-card class="bg-grey-9 q-mb-md" style="border: 1px solid #333; border-radius: 8px">
        <q-card-section class="q-gutter-y-sm">
          <q-input
            v-model="nomeRecebedor"
            label="Nome Completo"
            dark
            filled
            dense
            color="orange-8"
            bg-color="grey-10"
          />
          <q-input
            v-model="cpfRecebedor"
            label="CPF"
            dark
            filled
            dense
            color="orange-8"
            bg-color="grey-10"
            mask="###.###.###-##"
            unmasked-value
            :rules="[(val) => !val || validarCPF(val) || 'CPF inválido']"
            lazy-rules
          />
        </q-card-section>
      </q-card>

      <div class="text-subtitle2 text-weight-bold text-uppercase q-mb-sm q-ml-xs q-mt-lg">
        Assinatura do Responsável
      </div>
      <q-card
        class="bg-grey-10"
        style="border-radius: 8px; border: 1px solid #555; transition: all 0.3s ease"
        :style="assinado ? 'border-color: #4caf50; box-shadow: 0 0 8px rgba(76, 175, 80, 0.2)' : ''"
      >
        <q-card-section class="q-pa-md">
          <div class="flex justify-between items-center q-mb-md">
            <div class="text-subtitle2 text-weight-bold text-white flex items-center">
              <q-icon name="person" class="q-mr-sm text-orange-8" size="sm" />
              Recebedor
            </div>
            <q-badge
              :color="assinado ? 'green-8' : 'grey-8'"
              rounded
              class="q-px-sm q-py-xs text-weight-bold"
            >
              <q-icon :name="assinado ? 'check_circle' : 'pending'" class="q-mr-xs" size="14px" />
              {{ assinado ? 'Assinado' : 'Pendente' }}
            </q-badge>
          </div>
          <q-btn
            :color="assinado ? 'grey-8' : 'orange-8'"
            :icon="assinado ? 'draw' : 'gesture'"
            :label="assinado ? 'Refazer Assinatura' : 'Coletar Assinatura'"
            class="full-width text-weight-bold"
            unelevated
            style="border-radius: 6px"
            @click="dialogAssinaturaAberto = true"
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
                    Assinatura do Recebedor
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
        Verifique todos os itens, preencha nome, CPF válido e assine para confirmar
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { doc, getDoc, updateDoc, Timestamp, arrayUnion, setDoc } from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import { getAuth } from 'firebase/auth'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const carregando = ref(true)
const despacho = ref(null)
const respostasRecebedor = ref({})
const observacoesRecebedor = ref({})
const nomeRecebedor = ref('')
const cpfRecebedor = ref('')
const observacaoGeral = ref('')
const assinado = ref(false)
const salvando = ref(false)

// Canvas
const canvasRef = ref(null)
const isDrawing = ref(false)
let lastX = 0
let lastY = 0
const assinaturaImagem = ref(null)
const dialogAssinaturaAberto = ref(false)

const totalItens = computed(() => (checklistExibido.value || []).length)
const itensVerificados = computed(() => {
  return Object.values(respostasRecebedor.value).filter((v) => v && v !== '').length
})

const podeConfirmar = computed(() => {
  const docOk = validarCPF(cpfRecebedor.value)
  const nomeOk = nomeRecebedor.value.trim().length > 2
  const assinaOk = assinado.value
  const lista = checklistExibido.value || []
  const todosRespondidos = lista.every((_, idx) => {
    const r = (respostasRecebedor.value[idx] || '').toString().trim()
    return r !== ''
  })
  return nomeOk && docOk && assinaOk && todosRespondidos
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
  const itensVendedor = despacho.value.checklistAvaliacao || []
  const obsMotorista = despacho.value.observacoesMotorista || {}
  return itensVendedor.map((item, idx) => ({
    ...item,
    obsMotorista: obsMotorista[idx] || null,
  }))
})

const validarCPF = (cpf) => {
  if (!cpf) return false
  const str = cpf.replace(/\D/g, '')
  if (str.length !== 11 || /^(\d)\1{10}$/.test(str)) return false
  let soma = 0,
    resto
  for (let i = 1; i <= 9; i++) soma += parseInt(str.substring(i - 1, i)) * (11 - i)
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(str.substring(9, 10))) return false
  soma = 0
  for (let i = 1; i <= 10; i++) soma += parseInt(str.substring(i - 1, i)) * (12 - i)
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(str.substring(10, 11))) return false
  return true
}

const buscarDespacho = async () => {
  carregando.value = true
  try {
    const q = new URLSearchParams(window.location.search)
    const id = route.query.id || q.get('id')
    if (!id) {
      carregando.value = false
      return
    }
    const snap = await getDoc(doc(db, 'despachos_usados', id))
    if (!snap.exists()) {
      carregando.value = false
      return
    }
    const d = snap.data()
    if (d.status !== 'carregado') {
      $q.notify({
        type: 'warning',
        message: 'Este despacho ainda não foi carregado pelo motorista.',
      })
      carregando.value = false
      return
    }
    despacho.value = { id: snap.id, ...d }
  } catch (e) {
    console.error('Erro ao buscar despacho:', e)
    $q.notify({ type: 'negative', message: 'Erro ao carregar despacho.' })
  } finally {
    carregando.value = false
  }
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

const confirmarRecebimento = async () => {
  if (!validarCPF(cpfRecebedor.value)) {
    $q.notify({ type: 'negative', message: 'CPF inválido.' })
    return
  }
  salvando.value = true
  try {
    const d = despacho.value
    const serie = d.serie

    // 1. Atualiza despacho como recebido
    await updateDoc(doc(db, 'despachos_usados', d.id), {
      status: 'recebido',
      dataRecebimento: Timestamp.now(),
      recebidoPor: nomeRecebedor.value,
      cpfRecebedor: cpfRecebedor.value,
      assinaturaRecebedorImagem: assinaturaImagem.value,
      checklistRecebimento: (checklistExibido.value || []).map((item, idx) => ({
        texto: item.texto,
        respostaVendedor: item.resposta,
        respostaRecebedor: respostasRecebedor.value[idx] || '',
        observacaoRecebedor: observacoesRecebedor.value[idx] || '',
      })),
      observacaoGeral: observacaoGeral.value,
    })

    // 2. Cria/Atualiza documento na coleção maquinas
    const maquinaRef = doc(db, 'maquinas', serie)
    const maquinaSnap = await getDoc(maquinaRef)
    const historicoAtual = maquinaSnap.exists() ? maquinaSnap.data().historico || [] : []
    const numeroAcao = historicoAtual.length + 1

    const itemHistorico = {
      tipo: 'recebimento_usada',
      cliente: d.cliente || '',
      unidade: d.unidadeDestino,
      data: new Date().toISOString().slice(0, 10),
      responsavel: nomeRecebedor.value,
      numero: numeroAcao,
      observacaoGeral: observacaoGeral.value,
      de: d.unidadeOrigem,
      para: d.unidadeDestino,
      motorista: d.motoristaNome,
    }

    if (!maquinaSnap.exists()) {
      // Cria máquina nova no estoque
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
          resposta: respostasRecebedor.value[idx] || item.resposta || '',
          observacao: observacoesRecebedor.value[idx] || item.observacao || '-',
        })),
        historico: [itemHistorico],
        ultimaAtualizacao: Timestamp.now(),
        dataEntrada: Timestamp.now(),
      })
    } else {
      // Atualiza máquina existente
      await updateDoc(maquinaRef, {
        status: 'recebida_usada',
        unidadeAtual: d.unidadeDestino,
        ultimaAtualizacao: Timestamp.now(),
        historico: arrayUnion(itemHistorico),
      })
    }

    // 3. Atualiza avaliacoes_usadas
    await updateDoc(doc(db, 'avaliacoes_usadas', serie), {
      status: 'recebida',
      dataRecebimento: Timestamp.now(),
      unidadeAtual: d.unidadeDestino,
    })

    $q.notify({ type: 'positive', message: 'Máquina recebida com sucesso!' })
    router.push('/inicio/pos-venda/maquinas')
  } catch (e) {
    console.error('Erro ao confirmar recebimento:', e)
    $q.notify({ type: 'negative', message: 'Erro ao confirmar recebimento.' })
  } finally {
    salvando.value = false
  }
}

const voltar = () => {
  router.push('/inicio/pos-venda/maquinas')
}

onMounted(buscarDespacho)
</script>

<style scoped>
.signature-container {
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
}
</style>
