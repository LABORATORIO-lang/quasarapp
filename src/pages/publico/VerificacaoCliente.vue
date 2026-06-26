<template>
  <div class="q-pa-lg bg-grey-10 text-white" style="min-height: 100vh">
    <div v-if="carregando" class="text-center q-mt-xl">
      <q-spinner color="orange-8" size="40px" />
      <div class="text-grey-5 q-mt-sm">Carregando dados...</div>
    </div>

    <div v-else-if="erro" class="text-center q-mt-xl">
      <q-icon name="error_outline" size="64px" color="red-5" />
      <div class="text-h6 text-red-5 q-mt-md">{{ erro }}</div>
    </div>

    <div v-else-if="dados.status === 'assinado'" class="text-center q-mt-xl">
      <q-icon name="check_circle" size="64px" color="green-5" />
      <div class="text-h6 text-green-5 q-mt-md">Recebimento já confirmado!</div>
      <div class="text-caption text-grey-5 q-mt-sm">Este link já foi utilizado.</div>
    </div>

    <div v-else>
      <div class="text-center q-mb-lg">
        <div class="text-h5 text-weight-bold text-orange-8">Verificação de Recebimento</div>
        <div class="text-caption text-grey-5">
          Confira os dados da máquina, tire as fotos e assine para confirmar
        </div>
      </div>

      <q-card class="bg-grey-9 q-mb-md" style="border: 1px solid #ff9800; border-radius: 8px">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold text-orange-8 q-mb-sm">Dados da Máquina</div>
          <div class="text-caption text-grey-4">
            Modelo: <strong class="text-white">{{ dados.modelo }}</strong>
          </div>
          <div class="text-caption text-grey-4">
            Série: <strong class="text-white">{{ dados.serie }}</strong>
          </div>
          <div v-if="dados.marca" class="text-caption text-grey-4">
            Marca: <strong class="text-white">{{ dados.marca }}</strong>
          </div>
          <div v-if="dados.ano" class="text-caption text-grey-4">
            Ano: <strong class="text-white">{{ dados.ano }}</strong>
          </div>
          <div v-if="dados.horimetro" class="text-caption text-grey-4">
            Horímetro: <strong class="text-white">{{ dados.horimetro }}</strong>
          </div>
          <div class="text-caption text-grey-4 q-mt-xs">
            Origem: <strong class="text-white">{{ dados.unidadeOrigem }}</strong>
          </div>
          <div class="text-caption text-grey-4">
            Cliente: <strong class="text-white">{{ dados.cliente }}</strong>
          </div>
        </q-card-section>
      </q-card>

      <!-- FOTOS DA ENTREGA -->
      <div class="text-subtitle2 text-weight-bold text-uppercase q-mb-sm q-ml-xs">
        Fotos da Entrega (Obrigatório)
      </div>
      <q-card class="bg-grey-9 q-mb-md" style="border: 1px solid #333; border-radius: 8px">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div
              class="col-6 col-md-3"
              v-for="posicao in ['Frente', 'Direita', 'Traseira', 'Esquerda']"
              :key="posicao"
            >
              <div class="text-center">
                <div
                  class="bg-grey-10 flex flex-center cursor-pointer shadow-2"
                  style="
                    height: 100px;
                    border-radius: 8px;
                    border: 1px dashed #555;
                    position: relative;
                  "
                  @click="abrirCameraFoto(posicao)"
                >
                  <q-img
                    v-if="fotosGerais[posicao]"
                    :src="fotosGerais[posicao]"
                    style="height: 100%; border-radius: 8px"
                  />
                  <q-icon v-else name="add_a_photo" color="orange-8" size="md" />
                  <q-btn
                    v-if="fotosGerais[posicao]"
                    round
                    dense
                    color="red"
                    icon="close"
                    size="xs"
                    style="position: absolute; top: -5px; right: -5px"
                    @click.stop="removerFoto(posicao)"
                  />
                </div>
                <div class="text-grey-4 text-caption q-mt-xs text-uppercase">{{ posicao }}</div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        id="file-input-entrega"
        style="display: none"
        @change="processarFoto"
      />

      <div class="row items-center justify-between q-mb-sm">
        <div class="text-subtitle2 text-grey-5">ITENS DE VERIFICAÇÃO</div>
        <q-badge color="orange-8" class="text-black text-weight-bold">
          {{ itensVerificados }} / {{ totalItens }} verificados
        </q-badge>
      </div>
      <q-card class="bg-grey-9 q-mb-md" style="border: 1px solid #333; border-radius: 8px">
        <q-list separator>
          <template v-for="(item, idx) in dados.checklistEntrada" :key="idx">
            <q-item>
              <q-item-section side>
                <q-checkbox
                  v-model="respostasCliente[idx]"
                  true-value="VERIFICADO"
                  false-value=""
                  color="orange-8"
                  dark
                />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-white text-weight-medium">{{ item.texto }}</q-item-label>
              </q-item-section>
            </q-item>

            <div class="q-px-md q-pb-sm">
              <q-input
                v-model="observacoesCliente[idx]"
                label="Observação (opcional)"
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

      <div class="text-subtitle2 text-weight-bold text-uppercase q-mb-sm q-ml-xs">
        Dados do Recebedor
      </div>
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
            v-model="cpfCnpjRecebedor"
            label="CPF do Recebedor"
            dark
            filled
            dense
            color="orange-8"
            bg-color="grey-10"
            mask="###.###.###-##"
          />
        </q-card-section>
      </q-card>

      <div class="text-subtitle2 text-weight-bold text-uppercase q-mb-sm q-ml-xs">
        Dados do Motorista / Entregador
      </div>
      <q-card class="bg-grey-9 q-mb-md" style="border: 1px solid #333; border-radius: 8px">
        <q-card-section class="q-gutter-y-sm">
          <q-input
            v-model="nomeMotoristaTerceiro"
            label="Nome do Motorista Terceiro"
            dark
            filled
            dense
            color="orange-8"
            bg-color="grey-10"
          />
        </q-card-section>
      </q-card>

      <div class="text-subtitle2 text-weight-bold text-uppercase q-mb-sm q-ml-xs q-mt-lg">
        Validação e Assinatura
      </div>

      <q-card
        class="bg-grey-9 shadow-5 q-mb-lg"
        style="border-radius: 12px; border: 1px solid #424242"
      >
        <q-card-section class="q-pt-md">
          <div class="row q-col-gutter-md">
            <!-- CLIENTE / RECEBEDOR -->
            <div class="col-12 col-md-6">
              <q-card
                class="bg-grey-10"
                style="border-radius: 8px; border: 1px solid #555; transition: all 0.3s ease"
                :style="
                  assinado
                    ? 'border-color: #4caf50; box-shadow: 0 0 8px rgba(76, 175, 80, 0.2)'
                    : ''
                "
              >
                <q-card-section class="q-pa-md">
                  <div class="flex justify-between items-center q-mb-md">
                    <div class="text-subtitle2 text-weight-bold text-white flex items-center">
                      <q-icon name="person" class="q-mr-sm text-orange-8" size="sm" />
                      Cliente / Recebedor
                    </div>
                    <q-badge
                      :color="assinado ? 'green-8' : 'grey-8'"
                      :text-color="assinado ? 'white' : 'grey-4'"
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
                    :color="assinado ? 'grey-8' : 'orange-8'"
                    :text-color="assinado ? 'white' : 'black'"
                    :icon="assinado ? 'draw' : 'gesture'"
                    :label="assinado ? 'Refazer Assinatura' : 'Coletar Assinatura'"
                    class="full-width text-weight-bold"
                    unelevated
                    style="border-radius: 6px"
                    @click="abrirDialogAssinatura('cliente')"
                  />
                </q-card-section>
              </q-card>
            </div>

            <!-- MOTORISTA TERCEIRO -->
            <div class="col-12 col-md-6">
              <q-card
                class="bg-grey-10"
                style="border-radius: 8px; border: 1px solid #555; transition: all 0.3s ease"
                :style="
                  assinadoMotorista
                    ? 'border-color: #4caf50; box-shadow: 0 0 8px rgba(76, 175, 80, 0.2)'
                    : ''
                "
              >
                <q-card-section class="q-pa-md">
                  <div class="flex justify-between items-center q-mb-md">
                    <div class="text-subtitle2 text-weight-bold text-white flex items-center">
                      <q-icon name="local_shipping" class="q-mr-sm text-orange-8" size="sm" />
                      Motorista / Entregador
                    </div>
                    <q-badge
                      :color="assinadoMotorista ? 'green-8' : 'grey-8'"
                      :text-color="assinadoMotorista ? 'white' : 'grey-4'"
                      rounded
                      class="q-px-sm q-py-xs text-weight-bold"
                    >
                      <q-icon
                        :name="assinadoMotorista ? 'check_circle' : 'pending'"
                        class="q-mr-xs"
                        size="14px"
                      />
                      {{ assinadoMotorista ? 'Assinado' : 'Pendente' }}
                    </q-badge>
                  </div>

                  <q-btn
                    :color="assinadoMotorista ? 'grey-8' : 'orange-8'"
                    :text-color="assinadoMotorista ? 'white' : 'black'"
                    :icon="assinadoMotorista ? 'draw' : 'gesture'"
                    :label="assinadoMotorista ? 'Refazer Assinatura' : 'Coletar Assinatura'"
                    class="full-width text-weight-bold"
                    unelevated
                    style="border-radius: 6px"
                    @click="abrirDialogAssinatura('motorista')"
                  />
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>

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
                    Assinatura do {{ assinaturaAtual === 'motorista' ? 'Motorista' : 'Cliente' }}
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
        Tire as 4 fotos, verifique os itens, preencha nome, CPF válido e as duas assinaturas para
        confirmar
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { doc, getDoc, updateDoc, Timestamp, arrayUnion } from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import { getAuth /*signInAnonymously*/ } from 'firebase/auth'
import { gerarChecklistPdf } from 'src/utils/pdfGenerator'
import { salvarTransferenciaPosVenda, verificarStatusServidor } from 'src/utils/ServidorApi'

const $q = useQuasar()
const route = useRoute()

// 1. VARIÁVEIS BASE
const carregando = ref(true)
const erro = ref('')
const salvando = ref(false)
const dados = ref({})
const respostasCliente = ref({})
const observacoesCliente = ref({})
const nomeRecebedor = ref('')
const cpfCnpjRecebedor = ref('')
const observacaoGeral = ref('')
const assinado = ref(false)
const assinadoMotorista = ref(false)
const nomeMotoristaTerceiro = ref('')
const assinaturaImagem = ref(null)
const assinaturaImagemMotorista = ref(null)
const dialogAssinaturaAberto = ref(false)
const assinaturaAtual = ref('cliente')
const fotosGerais = ref({ Frente: null, Direita: null, Traseira: null, Esquerda: null })
const fotoSelecionada = ref(null)
const canvasRef = ref(null)
const isDrawing = ref(false)
let lastX = 0
let lastY = 0

// 2. FUNÇÕES COMPUTADAS (As que estavam dando erro)

const totalItens = computed(() => {
  return (dados.value.checklistEntrada || []).length
})

const itensVerificados = computed(() => {
  return Object.values(respostasCliente.value).filter((item) => item === 'VERIFICADO').length
})

const podeConfirmar = computed(() => {
  const docLimpo = cpfCnpjRecebedor.value.replace(/\D/g, '')

  const nomeOk = nomeRecebedor.value.trim().length > 2
  const docOk = validarCPF(docLimpo)
  const motoristaOk = nomeMotoristaTerceiro.value.trim().length > 2
  const clienteAssinado = assinado.value
  const motoristaAssinado = assinadoMotorista.value
  const fotosOk = Object.values(fotosGerais.value).every((f) => f)

  const lista = dados.value.checklistEntrada || []

  const todosVerificados = lista.every((_, idx) => {
    return respostasCliente.value[idx] === 'VERIFICADO'
  })

  return (
    nomeOk &&
    docOk &&
    motoristaOk &&
    clienteAssinado &&
    motoristaAssinado &&
    fotosOk &&
    todosVerificados
  )
})

function validarCPF(cpf) {
  if (!cpf || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false
  let soma = 0
  let resto
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i)
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cpf.substring(9, 10))) return false
  soma = 0
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i)
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cpf.substring(10, 11))) return false
  return true
}

// RESTO DAS FUNÇÕES (Fotos, Assinatura e Confirmar)
const abrirCameraFoto = (posicao) => {
  fotoSelecionada.value = posicao
  document.getElementById('file-input-entrega')?.click()
}

const processarFoto = (event) => {
  const file = event.target.files[0]
  const posicao = fotoSelecionada.value
  if (!file || !posicao) return
  const reader = new FileReader()
  reader.onload = (e) => {
    fotosGerais.value[posicao] = e.target.result
    fotoSelecionada.value = null
  }
  reader.readAsDataURL(file)
  event.target.value = ''
}

const removerFoto = (posicao) => {
  fotosGerais.value[posicao] = null
}

const initCanvas = () => {
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

const abrirDialogAssinatura = (tipo) => {
  assinaturaAtual.value = tipo
  dialogAssinaturaAberto.value = true
}

const confirmarAssinatura = () => {
  if (assinaturaAtual.value === 'cliente' && !assinado.value) {
    $q.notify({ type: 'warning', message: 'Faça a assinatura antes de confirmar.' })
    return
  }
  if (assinaturaAtual.value === 'motorista' && !assinadoMotorista.value) {
    $q.notify({ type: 'warning', message: 'Faça a assinatura antes de confirmar.' })
    return
  }
  if (assinaturaAtual.value === 'motorista') {
    assinaturaImagemMotorista.value = canvasRef.value.toDataURL('image/png')
  } else {
    assinaturaImagem.value = canvasRef.value.toDataURL('image/png')
  }
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

  if (assinaturaAtual.value === 'motorista') {
    assinadoMotorista.value = true
  } else {
    assinado.value = true
  }
}

const limparAssinatura = () => {
  const ctx = canvasRef.value.getContext('2d')
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  if (assinaturaAtual.value === 'motorista') {
    assinadoMotorista.value = false
    assinaturaImagemMotorista.value = null
  } else {
    assinado.value = false
    assinaturaImagem.value = null
  }
}

const confirmarRecebimento = async () => {
  const docLimpo = cpfCnpjRecebedor.value ? cpfCnpjRecebedor.value.replace(/\D/g, '') : ''
  if (!validarCPF(docLimpo)) {
    $q.notify({ type: 'negative', message: 'CPF inválido. Confira os números.' })
    return
  }

  salvando.value = true
  try {
    const token = route.params.token
    const serie = dados.value.serie

    const novaObsTexto = observacaoGeral.value.trim()
      ? `${nomeRecebedor.value}: ${observacaoGeral.value}`
      : ''
    const obsAntiga = dados.value.observacaoGeral || ''
    const observacaoAcumulada = [obsAntiga, novaObsTexto].filter(Boolean).join('\n')

    await updateDoc(doc(db, 'entregas_cliente', token), {
      status: 'assinado',
      nomeRecebedor: nomeRecebedor.value,
      cpfCnpjRecebedor: docLimpo,
      nomeMotoristaTerceiro: nomeMotoristaTerceiro.value,
      assinaturaCliente: assinaturaImagem.value,
      assinaturaMotorista: assinaturaImagemMotorista.value,
      observacoesCliente: { ...observacoesCliente.value },
      respostasCliente: { ...respostasCliente.value },
      observacaoGeral: observacaoAcumulada,
      dataAssinatura: Timestamp.now(),
    })

    const checklistAcumulado = (dados.value.checklistEntrada || []).map((item, idx) => {
      const notaCliente = (observacoesCliente.value[idx] || '').trim()
      const novaNota = notaCliente ? `${nomeRecebedor.value}: ${notaCliente}` : ''
      const notaAntiga = item.observacao && item.observacao !== '-' ? item.observacao : ''
      return {
        ...item,
        observacao: [notaAntiga, novaNota].filter(Boolean).join('\n') || '-',
      }
    })

    const maquinaRef = doc(db, 'maquinas', serie)
    const maquinaSnap = await getDoc(maquinaRef)
    const historicoAtual = maquinaSnap.exists() ? maquinaSnap.data().historico || [] : []
    const numeroAcao = historicoAtual.length + 1
    const pdfNome = `${serie}-${numeroAcao}-entrega-cliente`

    await updateDoc(maquinaRef, {
      status: 'entregue',
      observacaoGeral: observacaoAcumulada,
      checklistEntrada: checklistAcumulado,
      ultimaAtualizacao: Timestamp.now(),
      historico: arrayUnion({
        tipo: 'entrega_cliente',
        cliente: nomeRecebedor.value,
        unidade: dados.value.unidadeOrigem || '',
        data: new Date().toISOString().slice(0, 10),
        responsavel: nomeMotoristaTerceiro.value || dados.value.motorista || 'Motorista Terceiro',
        pdfNome: pdfNome,
        numero: numeroAcao,
        observacaoGeral: novaObsTexto,
      }),
    })

    try {
      const dadosParaPdf = {
        tipoPdf: 'entrega_cliente',
        nomeMaquina: `${dados.value.modelo} — ${dados.value.serie}`,
        observacaoGeral: observacaoAcumulada,
        dadosFormulario: {
          serie: dados.value.serie,
          modelo: dados.value.modelo,
          marca: dados.value.marca || '',
          ano: dados.value.ano || '',
          horimetro: dados.value.horimetro || '',
          unidadeAtual: dados.value.unidadeOrigem || '',
          cliente: nomeRecebedor.value,
        },
        respostasChecklist: (dados.value.checklistEntrada || []).map((item, index) => ({
          texto: item.texto,
          resposta: item.resposta,
          respostaCliente: respostasCliente.value[index] || '-',
          observacao: observacoesCliente.value[index] || item.observacao || '-',
        })),
        assinaturas: {
          responsavelNome: nomeRecebedor.value,
          responsavelImagem: assinaturaImagem.value,
          responsavelCpf: docLimpo,
          motoristaNome:
            nomeMotoristaTerceiro.value || dados.value.motorista || 'Motorista Terceiro',
          motoristaImagem: assinaturaImagemMotorista.value,
        },
        fotosGerais: fotosGerais.value,
        dataConclusao: new Date().toISOString(),
        dataHoraFormatada:
          new Date().toLocaleDateString('pt-BR') +
          ' às ' +
          new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      }

      const pdfBase64 = await gerarChecklistPdf(dadosParaPdf, true)
      const base64Limpo = pdfBase64.includes(',') ? pdfBase64.split(',')[1] : pdfBase64

      const servidorOnline = await verificarStatusServidor()
      if (servidorOnline.online) {
        await salvarTransferenciaPosVenda(
          dados.value.unidadeOrigem || 'Geral',
          pdfNome,
          base64Limpo,
        )
      }
    } catch (pdfError) {
      console.warn('⚠️ Falha ao gerar PDF de entrega técnica:', pdfError.message)
    }

    dados.value.status = 'assinado'
    $q.notify({ type: 'positive', message: 'Recebimento confirmado com sucesso!' })
  } catch (e) {
    console.error('Erro ao confirmar:', e)
    $q.notify({ type: 'negative', message: 'Erro ao confirmar. Tente novamente.' })
  } finally {
    salvando.value = false
  }
}

onMounted(async () => {
  try {
    // const auth = getAuth()
    //
    // if (!auth.currentUser) await signInAnonymously(auth)

    const token = route.params.token
    if (!token) {
      erro.value = 'Link inválido.'
      return
    }

    const docSnap = await getDoc(doc(db, 'entregas_cliente', token))
    if (!docSnap.exists()) {
      erro.value = 'Link não encontrado ou inválido.'
      return
    }

    const d = docSnap.data()
    if (d.expiraEm && new Date(d.expiraEm) < new Date()) {
      erro.value = 'Este link expirou. Solicite um novo ao vendedor.'
      return
    }

    dados.value = d
    if (d.checklistEntrada && Array.isArray(d.checklistEntrada)) {
      d.checklistEntrada.forEach((_, idx) => {
        observacoesCliente.value[idx] = observacoesCliente.value[idx] || ''
        respostasCliente.value[idx] = respostasCliente.value[idx] || ''
      })
    }
    if (d.cliente) nomeRecebedor.value = d.cliente
    if (d.cpfCnpj) cpfCnpjRecebedor.value = d.cpfCnpj
    if (d.motorista) nomeMotoristaTerceiro.value = d.motorista

    await nextTick()
    initCanvas()
  } catch (e) {
    console.error('Erro ao carregar verificação:', e)
    erro.value = 'Erro ao carregar os dados. Tente novamente.'
  } finally {
    carregando.value = false
  }
})

onUnmounted(() => {
  const auth = getAuth()
  if (auth.currentUser && auth.currentUser.isAnonymous) auth.signOut().catch(() => {})
})
</script>

<style scoped>
.signature-container {
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
}
</style>

<style scoped>
.signature-container {
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
}
</style>

<style scoped>
.signature-container {
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
}
</style>
