<template>
  <q-page class="q-pa-md bg-grey-10 text-white">
    <div class="row items-center q-mb-md">
      <q-btn flat round icon="arrow_back" color="orange-8" @click="verificarSaida" />
      <div class="text-h6 text-weight-bold text-uppercase text-orange-8 q-ml-sm">
        {{ tituloTipo }}
      </div>
    </div>

    <div class="text-subtitle2 text-weight-bold text-uppercase q-mb-sm q-ml-xs">
      Dados da Máquina
    </div>
    <q-card
      class="bg-grey-9 shadow-3 q-mb-lg"
      style="border-radius: 12px; border: 1px solid #424242"
    >
      <q-card-section class="q-gutter-y-md">
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="formulario.data"
              type="date"
              label="Data"
              dark
              outlined
              dense
              color="orange-8"
              @update:model-value="temAlteracoes = true"
            />
          </div>
        </div>
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-input
              v-model="formulario.serie"
              label="Nº de Série"
              :readonly="modoTransferencia"
              dark
              outlined
              dense
              color="orange-8"
              @update:model-value="temAlteracoes = true"
            />
          </div>
          <div class="col-6">
            <q-input
              v-model="formulario.modelo"
              label="Modelo"
              :readonly="modoTransferencia"
              dark
              outlined
              dense
              color="orange-8"
              @update:model-value="temAlteracoes = true"
            />
          </div>
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                v-model="formulario.marca"
                label="Marca"
                dark
                outlined
                dense
                color="orange-8"
                @update:model-value="temAlteracoes = true"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="formulario.ano"
                label="Ano de Fabricação"
                :rules="regrasAno"
                dark
                outlined
                dense
                color="orange-8"
                @update:model-value="temAlteracoes = true"
              />
            </div>
          </div>
        </div>
        <q-input
          v-model="formulario.descricao"
          label="Descrição (Opcional)"
          dark
          outlined
          dense
          color="orange-8"
          @update:model-value="temAlteracoes = true"
        />
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-select
              v-model="formulario.unidadeAtual"
              :options="['Campo Novo do Parecis', 'Tangará da Serra', 'Nova Mutum', 'Juína']"
              label="Unidade Atual"
              :disable="modoEntregaCliente"
              dark
              outlined
              dense
              color="orange-8"
              @update:model-value="temAlteracoes = true"
              @blur="verificarSerieImediata"
            />
          </div>
          <div class="col-6">
            <q-input
              v-model="formulario.horimetro"
              type="number"
              label="Horímetro"
              dark
              outlined
              dense
              color="orange-8"
              @update:model-value="temAlteracoes = true"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div class="text-subtitle2 text-weight-bold text-uppercase text-grey-5 q-mb-sm q-ml-xs">
      Fotos Gerais (Obrigatório)
    </div>
    <q-card
      class="bg-grey-9 shadow-3 q-mb-lg"
      style="border-radius: 12px; border: 1px solid #424242"
    >
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
                @click="abrirCameraFotoGeral(posicao)"
              >
                <q-img
                  v-if="fotosGerais[posicao]"
                  :src="fotosGerais[posicao]"
                  style="height: 100%; border-radius: 8px"
                />
                <q-icon v-else name="add_a_photo" color="grey-6" size="sm" />
                <q-btn
                  v-if="fotosGerais[posicao]"
                  round
                  dense
                  color="red"
                  icon="close"
                  size="xs"
                  style="position: absolute; top: -5px; right: -5px"
                  @click.stop="removerFotoGeral(posicao)"
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
      id="file-input-geral-pos"
      style="display: none"
      @change="processarFotoGeral"
    />

    <div class="text-subtitle2 text-weight-bold text-uppercase q-mb-sm q-ml-xs">
      Itens de Verificação
    </div>
    <q-card
      class="bg-grey-9 shadow-3 q-mb-lg"
      style="border-radius: 12px; border: 1px solid #424242"
    >
      <ItemVerificacao
        v-for="(item, index) in itens"
        :key="index"
        :item="item"
        :index="index"
        @update:item="itens[index] = $event"
        @alteracao="temAlteracoes = true"
      />
    </q-card>

    <div class="text-subtitle2 text-weight-bold text-uppercase q-mb-sm q-ml-xs">
      Validação e Assinaturas
    </div>

    <q-card
      class="bg-grey-9 shadow-5 q-mb-lg"
      style="border-radius: 12px; border: 1px solid #424242"
    >
      <q-card-section class="q-pt-md">
        <div class="row q-col-gutter-md">
          <div
            class="col-12 col-md-6"
            v-for="(item, index) in [
              { key: 'responsavel', label: 'Responsável Técnico', icon: 'engineering' },
              {
                key: 'motorista',
                label: modoEntregaCliente ? 'Cliente / Recebedor' : 'Motorista',
                icon: modoEntregaCliente ? 'person' : 'agriculture',
              },
            ]"
            :key="index"
          >
            <q-card
              class="bg-grey-10"
              style="border-radius: 8px; border: 1px solid #555; transition: all 0.3s ease"
              :style="
                assinaturas[item.key + 'Imagem']
                  ? 'border-color: #4caf50; box-shadow: 0 0 8px rgba(76, 175, 80, 0.2)'
                  : ''
              "
            >
              <q-card-section class="q-pa-md">
                <div class="flex justify-between items-center q-mb-md">
                  <div class="text-subtitle2 text-weight-bold text-white flex items-center">
                    <q-icon :name="item.icon" class="q-mr-sm text-orange-8" size="sm" />
                    {{ item.label }}
                  </div>
                  <q-badge
                    :color="assinaturas[item.key + 'Imagem'] ? 'green-8' : 'grey-8'"
                    :text-color="assinaturas[item.key + 'Imagem'] ? 'white' : 'grey-4'"
                    rounded
                    class="q-px-sm q-py-xs text-weight-bold"
                  >
                    <q-icon
                      :name="assinaturas[item.key + 'Imagem'] ? 'check_circle' : 'pending'"
                      class="q-mr-xs"
                      size="14px"
                    />
                    {{ assinaturas[item.key + 'Imagem'] ? 'Assinado' : 'Pendente' }}
                  </q-badge>
                </div>

                <q-input
                  v-model="assinaturas[item.key + 'Nome']"
                  label="Nome completo digitado"
                  dark
                  filled
                  dense
                  color="orange-8"
                  bg-color="grey-9"
                  class="q-mb-md"
                  @update:model-value="temAlteracoes = true"
                >
                  <template v-slot:prepend>
                    <q-icon name="edit_square" size="xs" color="grey-5" />
                  </template>
                </q-input>

                <q-input
                  v-if="item.key === 'motorista'"
                  v-model="assinaturas[item.key + 'Cpf']"
                  label="CPF (Obrigatório)"
                  dark
                  filled
                  dense
                  color="orange-8"
                  bg-color="grey-9"
                  class="q-mb-md"
                  mask="###.###.###-##"
                >
                  <template v-slot:prepend>
                    <q-icon name="badge" size="xs" color="grey-5" />
                  </template>
                </q-input>

                <q-btn
                  :color="assinaturas[item.key + 'Imagem'] ? 'grey-8' : 'orange-8'"
                  :text-color="assinaturas[item.key + 'Imagem'] ? 'white' : 'black'"
                  :icon="assinaturas[item.key + 'Imagem'] ? 'draw' : 'gesture'"
                  :label="
                    assinaturas[item.key + 'Imagem'] ? 'Refazer Assinatura' : 'Coletar Assinatura'
                  "
                  class="full-width text-weight-bold"
                  unelevated
                  style="border-radius: 6px"
                  @click="abrirDialogAssinatura(item.key)"
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
              <q-avatar icon="draw" color="orange-8" text-color="black" size="md" class="q-mr-sm" />
              <div>
                <div class="text-h6 text-white" style="line-height: 1.2">
                  {{ tituloAssinaturaAtual }}
                </div>
                <div class="text-caption text-orange-8">Assine no espaço em branco abaixo</div>
              </div>
            </div>
            <q-btn flat round dense icon="close" color="grey-5" @click="fecharDialogAssinatura" />
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
              @click="clearSignature"
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
              @click="fecharDialogAssinatura"
            />
          </div>
          <div class="col-6">
            <q-btn
              color="green-6"
              icon="check_circle"
              label="Confirmar"
              class="full-width text-weight-bold"
              style="border-radius: 8px; height: 50px"
              @click="confirmarAssinaturaDialog"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-btn
      color="orange-8"
      label="Salvar e Gerar PDF"
      icon="save"
      class="full-width q-mb-xl"
      size="lg"
      @click="salvarChecklistNoTelemovel"
    />
  </q-page>
</template>

<script setup>
// ================= 1. IMPORTAÇÕES E CONFIGURAÇÕES =================
import { ref, computed, onMounted, onUnmounted, nextTick, toRaw, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { doc, getDoc, setDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import { getAuth } from 'firebase/auth'
import localforage from 'localforage'
import { gerarChecklistPdf } from 'src/utils/pdfGenerator'
import ItemVerificacao from 'src/components/ItemVerificacao.vue'
import { salvarChecklistPosVenda, verificarStatusServidor } from 'src/utils/ServidorApi'

const modoEntregaCliente = computed(() => route.query.modo === 'entrega_cliente')
const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const modoTransferencia = computed(() => route.query.modo === 'transferencia')

// ================= 2. ESTADOS DO FORMULÁRIO =================
const temAlteracoes = ref(false)
const nomeMaquina = ref('')
const itens = ref([])
const rascunhoId = ref(null)
const bloqueioWatchUnidade = ref(false)

const userName = ref('')
const cidadeUsuario = ref('')
const regrasAno = [(val) => (val >= 1900 && val <= 2100) || 'Ano inválido']
const hojeLocal = () => {
  const d = new Date()
  const ano = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

const formulario = ref({
  data: hojeLocal(),
  serie: '',
  modelo: '',
  marca: '',
  ano: '',
  descricao: '',
  unidadeAtual: '',
  horimetro: '',
})

const fotosGerais = ref({ Frente: null, Direita: null, Traseira: null, Esquerda: null })
const fotoGeralSelecionada = ref(null)

// ================= 3. ESTADOS DO CANVAS E ASSINATURAS =================
const assinaturas = ref({
  responsavelNome: '',
  responsavelCpf: '',
  motoristaNome: '',
  motoristaCpf: '',
  responsavelImagem: null,
  motoristaImagem: null,
})

const dialogAssinaturaAberto = ref(false)
const tipoAssinaturaAtual = ref('')
const nomeAssinaturaAtual = ref('')
const tituloAssinaturaAtual = ref('')
const labelNomeAssinaturaAtual = ref('')

const canvasRef = ref(null)
const isDrawing = ref(false)
const hasSigned = ref(false)
let lastX = 0
let lastY = 0

let larguraAnterior = window.innerWidth

const tiposNomes = {
  recebimento: 'Recebimento de Máquina',
  transferencia: 'Transferência de Máquina',
  venda: 'Venda de Máquina',
}
const tituloTipo = computed(() => {
  if (modoEntregaCliente.value) return 'Entrega ao Cliente'
  if (modoTransferencia.value) return 'Recebimento de Transferência'
  return tiposNomes[route.params.tipo] || 'Checklist Pós-Venda'
})

watch(
  () => formulario.value.serie,
  (novo) => {
    const limpo = (novo || '').toUpperCase().replace(/\s/g, '').trim()
    if (novo !== limpo) {
      formulario.value.serie = limpo
    }
  },
)

watch(
  () => formulario.value.unidadeAtual,
  (nova) => {
    if (bloqueioWatchUnidade.value) return
    if (!cidadeUsuario.value || !nova) return
    if (nova === cidadeUsuario.value) return

    $q.dialog({
      dark: true,
      title: '⚠️ Atenção',
      message: `Você selecionou a unidade "${nova}", mas seu cadastro é em "${cidadeUsuario.value}". Tem certeza que deseja continuar?`,
      cancel: { label: 'Voltar para minha unidade', color: 'grey-5', flat: true },
      ok: { label: 'Sim, continuar', color: 'orange-8', flat: true },
      color: 'orange-8',
      persistent: true,
    })
      .onOk(() => {
        temAlteracoes.value = true
      })
      .onCancel(() => {
        bloqueioWatchUnidade.value = true
        formulario.value.unidadeAtual = cidadeUsuario.value
        nextTick(() => {
          bloqueioWatchUnidade.value = false
        })
      })
  },
)

// Watcher para Auto-Save (Proteção contra bloqueio/minimização)
watch(
  [formulario, itens, fotosGerais, assinaturas],
  () => {
    if (temAlteracoes.value) {
      salvarRascunhoSilencioso()
    }
  },
  { deep: true },
)

// ================= 4. CICLO DE VIDA =================
onMounted(async () => {
  window.addEventListener('resize', handleResize)
  nomeMaquina.value = tituloTipo.value

  try {
    const sessao = await localforage.getItem('user_session')
    if (sessao) {
      if (sessao.cidade) cidadeUsuario.value = sessao.cidade
      if (sessao.nome) userName.value = sessao.nome
    }

    if (navigator.onLine && getAuth().currentUser) {
      const user = getAuth().currentUser
      const docRef = doc(db, 'usuarios', user.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const dados = docSnap.data()
        if (dados.cidade) {
          cidadeUsuario.value = dados.cidade
          await localforage.setItem('user_session', {
            ...(sessao || {}),
            cidade: dados.cidade,
          })
        }
        if (dados.nome) {
          userName.value = dados.nome
          await localforage.setItem('user_session', {
            ...(sessao || {}),
            nome: dados.nome,
          })
        }
      }
    }
  } catch (e) {
    console.error('Erro ao buscar dados do usuário:', e)
  }

  try {
    $q.loading.show({ message: 'A carregar checklist...' })

    // Se for modo transferência ou entrega, priorizamos o carregamento dos itens do localforage
    if (modoTransferencia.value || modoEntregaCliente.value) {
      const key = modoTransferencia.value ? 'transferencia_pendente' : 'entrega_cliente_pendente'
      const pendente = await localforage.getItem(key)

      const serieQuery = (route.query.serie || '').toString().trim().toUpperCase()
      const seriePendente = (pendente?.serie || '').toString().trim().toUpperCase()

      if (pendente && (seriePendente === serieQuery || !serieQuery)) {
        if (pendente.modelo) {
          formulario.value.modelo = pendente.modelo
          nomeMaquina.value = pendente.modelo
        }
        if (pendente.serie) formulario.value.serie = pendente.serie
        if (pendente.marca) formulario.value.marca = pendente.marca
        if (pendente.ano) formulario.value.ano = pendente.ano
        if (pendente.horimetro) formulario.value.horimetro = pendente.horimetro

        if (pendente.checklistEntrada && pendente.checklistEntrada.length > 0) {
          itens.value = pendente.checklistEntrada
        } else {
          await carregarPerguntas()
        }
        await localforage.removeItem(key)
      } else {
        await carregarPerguntas()
      }
    } else {
      await carregarPerguntas()
    }

    const idRascunho = route.query.rascunho
    if (idRascunho) {
      await carregarRascunho(idRascunho)
    } else {
      // Tenta recuperar rascunho automático baseado na série ou tipo
      const serieUrl = route.query.serie || formulario.value.serie
      const chaveAuto = serieUrl
        ? `auto_save_pos_${serieUrl}`
        : `auto_save_pos_temp_${route.params.tipo}`
      const recuperado = await localforage.getItem(chaveAuto)
      if (recuperado) {
        await carregarRascunho(chaveAuto, true)
      }
    }
  } catch (error) {
    console.error('Erro geral ao carregar a tela:', error)
    $q.notify({ type: 'negative', message: 'Erro ao carregar os dados.' })
  } finally {
    $q.loading.hide()
  }

  // Configuração final de campos automáticos
  if (modoEntregaCliente.value) {
    if (route.query.de) formulario.value.unidadeAtual = route.query.de
  } else if (!formulario.value.unidadeAtual && cidadeUsuario.value) {
    formulario.value.unidadeAtual = cidadeUsuario.value
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const handleResize = () => {
  if (dialogAssinaturaAberto.value) {
    const larguraAtual = window.innerWidth
    if (larguraAtual !== larguraAnterior) {
      initCanvas()
      larguraAnterior = larguraAtual
    }
  }
}

// ================= 5. LÓGICA DO CANVAS =================
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
  temAlteracoes.value = true
}

const stopDrawing = () => {
  isDrawing.value = false
}
const clearSignature = () => {
  const ctx = canvasRef.value.getContext('2d')
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  hasSigned.value = false
}

// ================= 6. CONTROLE DO MODAL DE ASSINATURA =================
const abrirDialogAssinatura = (tipo) => {
  // Melhoria #9: Títulos e Labels dinâmicos no Modal de Assinatura
  const roles = {
    responsavel: {
      nome: assinaturas.value.responsavelNome,
      titulo: 'Assinatura do Responsável Técnico',
      label: 'Nome do Responsável',
    },
    motorista: {
      nome: assinaturas.value.motoristaNome,
      titulo: modoEntregaCliente.value
        ? 'Assinatura do Cliente / Recebedor'
        : 'Assinatura do Motorista / Operador',
      label: modoEntregaCliente.value ? 'Nome do Cliente' : 'Nome do Motorista',
    },
  }

  tipoAssinaturaAtual.value = tipo
  nomeAssinaturaAtual.value = roles[tipo].nome
  tituloAssinaturaAtual.value = roles[tipo].titulo
  labelNomeAssinaturaAtual.value = roles[tipo].label

  hasSigned.value = false
  dialogAssinaturaAberto.value = true

  nextTick(() => {
    initCanvas()
  })
}

const fecharDialogAssinatura = () => {
  dialogAssinaturaAberto.value = false
  tipoAssinaturaAtual.value = ''
  nomeAssinaturaAtual.value = ''
}

const confirmarAssinaturaDialog = () => {
  const tipo = tipoAssinaturaAtual.value
  if (!hasSigned.value) {
    $q.notify({ type: 'warning', message: 'Faça a assinatura antes de confirmar.' })
    return
  }

  const imagem = canvasRef.value.toDataURL('image/png')
  if (tipo === 'responsavel') assinaturas.value.responsavelImagem = imagem
  if (tipo === 'motorista') assinaturas.value.motoristaImagem = imagem

  fecharDialogAssinatura()
  temAlteracoes.value = true
  $q.notify({ type: 'positive', message: 'Assinatura confirmada.' })
}

// ================= 7. COMUNICAÇÃO COM FIREBASE =================
const normalizarSetor = (setor, caminho = route.path) => {
  if (setor && setor !== 'undefined') return setor === 'pos-venda' ? 'pos_venda' : setor
  const urlAtual = (caminho || '').toLowerCase()
  if (urlAtual.includes('comercial')) return 'comercial'
  if (urlAtual.includes('pos_venda') || urlAtual.includes('pos-venda')) return 'pos_venda'
  if (urlAtual.includes('logistica')) return 'logistica'
  return 'geral'
}

const carregarPerguntas = async () => {
  let tipo = route.params.tipo

  // Se for um recebimento genérico (transferência), tenta identificar o modelo real pela query
  if (tipo === 'recebimento' && route.query.modelo) {
    tipo = route.query.modelo
  }

  if (!tipo) {
    nomeMaquina.value = 'Máquina Desconhecida'
    return
  }
  try {
    const setor = normalizarSetor(route.params.setor)
    const colecaoModelos = setor === 'comercial' ? 'modelos_checklists' : 'checklists_pos_venda'
    const docSnap = await getDoc(doc(db, colecaoModelos, tipo))
    if (docSnap.exists()) {
      const dadosRef = docSnap.data()
      nomeMaquina.value = dadosRef.nome || tipo
      if (dadosRef.itens && Array.isArray(dadosRef.itens)) {
        itens.value = dadosRef.itens.map((i) => ({
          ...i,
          resposta: null,
          observacao: '',
          fotos: [],
        }))
      }
    } else {
      nomeMaquina.value = 'Modelo não encontrado'
    }
  } catch (e) {
    console.error(e)
    nomeMaquina.value = 'Erro ao carregar nome'
  }
}

// ================= 8. LÓGICA DE RASCUNHOS =================
const carregarRascunho = async (id) => {
  try {
    const dadosRascunho = await localforage.getItem(`rascunho_pos_venda_${id}`)
    if (!dadosRascunho) return

    rascunhoId.value = id
    if (dadosRascunho.formulario)
      formulario.value = { ...formulario.value, ...dadosRascunho.formulario }
    if (dadosRascunho.fotosGerais)
      fotosGerais.value = { ...fotosGerais.value, ...dadosRascunho.fotosGerais }
    if (dadosRascunho.assinaturas)
      assinaturas.value = { ...assinaturas.value, ...dadosRascunho.assinaturas }
    if (dadosRascunho.nomeMaquina) nomeMaquina.value = dadosRascunho.nomeMaquina
    if (dadosRascunho.itens && Array.isArray(dadosRascunho.itens)) itens.value = dadosRascunho.itens

    temAlteracoes.value = false
    $q.notify({ type: 'info', message: 'Rascunho carregado. Continue de onde parou.' })
  } catch (e) {
    console.error(e)
  }
}

const salvarRascunhoSilencioso = async () => {
  try {
    const chave = formulario.value.serie
      ? `auto_save_pos_${formulario.value.serie}`
      : `auto_save_pos_temp_${route.params.tipo}`

    await salvarRascunhoNoBanco(chave)
  } catch (e) {
    console.error('Erro no auto-save:', e)
  }
}

const salvarRascunho = async () => {
  const sucesso = await salvarRascunhoNoBanco()
  if (sucesso) temAlteracoes.value = false
  return sucesso
}

const salvarRascunhoNoBanco = async (idPersonalizado = null) => {
  try {
    const id = idPersonalizado || rascunhoId.value || Date.now().toString()
    if (!idPersonalizado) rascunhoId.value = id

    const setor = normalizarSetor(route.params.setor)
    const dadosRascunho = {
      id,
      tipo: route.params.tipo || 'Desconhecido',
      nomeMaquina: nomeMaquina.value,
      modelo: formulario.value.modelo,
      setor,
      formulario: JSON.parse(JSON.stringify(toRaw(formulario.value))),
      fotosGerais: JSON.parse(JSON.stringify(toRaw(fotosGerais.value))),
      assinaturas: JSON.parse(JSON.stringify(toRaw(assinaturas.value))),
      itens: JSON.parse(JSON.stringify(toRaw(itens.value))),
      data: new Date().toISOString(),
    }
    const chave = idPersonalizado || `rascunho_pos_venda_${id}`
    await localforage.setItem(chave, dadosRascunho)
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

const removerRascunho = async (id) => {
  try {
    await localforage.removeItem(`rascunho_pos_venda_${id}`)
  } catch (e) {
    console.error(e)
  }
}

// ================= 9. LÓGICA DE FOTOS GERAIS =================
const abrirCameraFotoGeral = (posicao) => {
  fotoGeralSelecionada.value = posicao
  document.getElementById('file-input-geral-pos')?.click()
}

const processarFotoGeral = (event) => {
  const file = event.target.files[0]
  const posicaoFoto = fotoGeralSelecionada.value
  if (!file || !posicaoFoto) return

  const reader = new FileReader()
  reader.onload = (e) => {
    fotosGerais.value[posicaoFoto] = e.target.result
    fotoGeralSelecionada.value = null
    temAlteracoes.value = true
  }
  reader.readAsDataURL(file)
  event.target.value = ''
}

const removerFotoGeral = (posicao) => {
  fotosGerais.value[posicao] = null
  temAlteracoes.value = true
}

const verificarFotosGerais = () => {
  const temAlgumaFoto = Object.values(fotosGerais.value).some((foto) => foto !== null)
  if (!temAlgumaFoto) {
    $q.notify({
      type: 'warning',
      message: 'Atenção: Nenhuma foto geral da máquina foi tirada!',
      position: 'top',
    })
    return false
  }
  return true
}

const verificarSaida = () => {
  if (!temAlteracoes.value) {
    router.back()
    return
  }
  $q.dialog({
    dark: true,
    title:
      '<div class="row items-center"><q-icon name="warning" color="orange-8" class="q-mr-sm" /><span>Sair do Formulário</span></div>',
    html: true,
    message: 'O que você deseja fazer com as alterações atuais?',
    options: {
      type: 'radio',
      model: 'salvar',
      items: [
        { label: 'Salvar rascunho e sair', value: 'salvar', color: 'orange-8' },
        { label: 'Descartar tudo e sair', value: 'descartar', color: 'red-5' },
      ],
    },
    cancel: { label: 'Continuar Editando', color: 'grey-5', flat: true },
    ok: { label: 'Confirmar', color: 'orange-8' },
    persistent: true,
  }).onOk(async (acao) => {
    if (acao === 'salvar') {
      await salvarRascunho()
      $q.notify({ type: 'positive', message: 'Rascunho guardado com sucesso!' })
    }
    router.back()
  })
}

// 1. Criar a função de validação de série para recebimento
const validarSerieRecebimento = async (serie) => {
  try {
    const maquinaRef = doc(db, 'maquinas', serie)
    const snap = await getDoc(maquinaRef)

    // se não existe, pode prosseguir
    if (!snap.exists()) {
      return {
        podeReceber: true,
      }
    }

    const dados = snap.data()
    const status = (dados.status || '').toLowerCase()

    // só pode receber novamente se estiver entregue
    if (status !== 'entregue') {
      return {
        podeReceber: false,
        dados,
      }
    }

    return {
      podeReceber: true,
      dados,
    }
  } catch (erro) {
    console.error('Erro ao validar série:', erro)
    return {
      podeReceber: true,
    }
  }
}

const exibirAvisoMaquinaCadastrada = (dados, serie) => {
  const ultimoHistorico =
    dados.historico && dados.historico.length ? dados.historico[dados.historico.length - 1] : null

  $q.dialog({
    dark: true,
    persistent: true,
    title: '⚠️ Máquina já cadastrada',
    message: `
Modelo: ${dados.modelo || '-'}
Série: ${serie}
Status Atual: ${dados.status || '-'}
Unidade Atual: ${dados.unidadeAtual || '-'}
${
  ultimoHistorico
    ? `
Última movimentação:
${ultimoHistorico.data || '-'}

Responsável:
${ultimoHistorico.responsavel || '-'}
`
    : ''
}
Esta máquina já existe em nosso sistema.
Somente máquinas com status ENTREGUE podem ser recebidas novamente.
          `,
    ok: {
      label: 'Entendi',
      color: 'negative',
    },
  })
}

const verificarSerieImediata = async () => {
  const serie = (formulario.value.serie || '').trim().toUpperCase()
  if (!serie || modoTransferencia.value || modoEntregaCliente.value) return

  const resultado = await validarSerieRecebimento(serie)
  if (!resultado.podeReceber) {
    exibirAvisoMaquinaCadastrada(resultado.dados || {}, serie)
  }
}

// ================= 10. SALVAMENTO E NAVEGAÇÃO =================
const salvarChecklistNoTelemovel = async () => {
  if (!formulario.value.serie) {
    $q.notify({ type: 'warning', message: 'Preenche o número de série.' })
    return
  }
  if (!formulario.value.unidadeAtual) {
    $q.notify({ type: 'warning', message: 'Preenche a unidade atual.' })
    return
  }
  if (!verificarFotosGerais()) return

  if (!assinaturas.value.responsavelNome) {
    $q.notify({ type: 'negative', message: 'Nome do Responsável obrigatório.' })
    return
  }
  if (!assinaturas.value.responsavelImagem) {
    $q.notify({ type: 'negative', message: 'Assinatura do Responsável obrigatória.' })
    return
  }

  // Melhoria #9: Mensagens de validação amigáveis e adaptadas se for Cliente
  if (!assinaturas.value.motoristaNome) {
    $q.notify({
      type: 'negative',
      message: modoEntregaCliente.value
        ? 'Nome do Cliente obrigatório.'
        : 'Nome do Motorista obrigatório.',
    })
    return
  }
  if (!assinaturas.value.motoristaCpf || assinaturas.value.motoristaCpf.length < 11) {
    $q.notify({
      type: 'negative',
      message: modoEntregaCliente.value
        ? 'Documento (CPF/CNPJ) do Cliente inválido ou incompleto.'
        : 'CPF do Motorista inválido.',
    })
    return
  }
  if (!assinaturas.value.motoristaImagem) {
    $q.notify({
      type: 'negative',
      message: modoEntregaCliente.value
        ? 'Assinatura do Cliente obrigatória.'
        : 'Assinatura do Motorista obrigatória.',
    })
    return
  }

  try {
    $q.loading.show({ message: 'A finalizar checklist...' })
    const setor = normalizarSetor(route.params.setor)
    const agora = new Date()
    const dataHoraFormatada =
      agora.toLocaleDateString('pt-BR') +
      ' às ' +
      agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

    // Implementação da mesma lógica de "chat/histórico" para os itens individuais
    const checklistAcumulado = itens.value.map((item) => {
      const obsAtual = (item.observacao || '').trim()
      // Se a observação contém o nome do usuário, supomos que já foi processada ou é nova
      if (obsAtual !== '' && obsAtual !== '-' && !obsAtual.includes(userName.value + ':')) {
        const novaNota = `${userName.value}: ${obsAtual}`
        return {
          ...item,
          observacao: novaNota, // O formulário técnico é o ponto de origem, então ele define a nota
        }
      }
      return item
    })

    const dadosParaSalvar = {
      id: Date.now().toString(),
      tipo: route.params.tipo || 'Desconhecido',
      tipoPdf: modoEntregaCliente.value
        ? 'entrega_cliente'
        : modoTransferencia.value
          ? 'recebimento_transferencia'
          : 'recebimento_fabrica',
      nomeMaquina: nomeMaquina.value,
      dadosFormulario: {
        ...formulario.value,
        unidadeOrigem: route.query.de || '',
        cliente: route.query.cliente || '',
      },
      respostasChecklist: checklistAcumulado,
      assinaturas: assinaturas.value,
      fotosGerais: fotosGerais.value,
      dataConclusao: hojeLocal(),

      setor,
      userName: userName.value,
      dataHoraFormatada,
    }

    const dadosLimpos = JSON.parse(JSON.stringify(toRaw(dadosParaSalvar)))
    const arquivoPdfBase64 = await gerarChecklistPdf(dadosLimpos, true)
    const registoFinal = { ...dadosLimpos, pdfFisico: arquivoPdfBase64 }

    const serie = formulario.value.serie.trim().toUpperCase()

    // 2. Valida máquina já existente no sistema
    if (!modoTransferencia.value && !modoEntregaCliente.value) {
      const resultado = await validarSerieRecebimento(serie)

      if (!resultado.podeReceber) {
        $q.loading.hide()
        exibirAvisoMaquinaCadastrada(resultado.dados || {}, serie)
        return
      }
    }

    const chaveSerie = `historico_serie_${serie}`
    const historicoSerie = (await localforage.getItem(chaveSerie)) || []

    let historicoAtual = []
    let numeroAcao = 1

    try {
      if (navigator.onLine) {
        const maquinaSnap = await getDoc(doc(db, 'maquinas', serie))
        historicoAtual = maquinaSnap.exists() ? maquinaSnap.data().historico || [] : []
        numeroAcao = historicoAtual.length + 1
      } else {
        numeroAcao = historicoSerie.length + 1
      }
    } catch (dbErr) {
      console.warn('Modo offline ativo na leitura do número de ação:', dbErr)
      numeroAcao = historicoSerie.length + 1
    }

    const sufixo = modoEntregaCliente.value
      ? 'entrega-cliente'
      : modoTransferencia.value
        ? 'recebimento-transferencia'
        : 'recebimento'
    const pdfNome = `${serie}-${numeroAcao}-${sufixo}`

    const jaExisteLocal = historicoSerie.some((h) => h.id === registoFinal.id)
    if (!jaExisteLocal) {
      historicoSerie.push({
        ...registoFinal,
        tipo: route.params.tipo,
        serie: serie,
        unidadeAtual: formulario.value.unidadeAtual,
        unidadeDestino: modoEntregaCliente.value ? route.query.cliente || '' : '',
        data: new Date().toISOString(),
      })
      await localforage.setItem(chaveSerie, historicoSerie)
    }

    try {
      const servidorOnline = await verificarStatusServidor()
      if (servidorOnline.online) {
        const base64Limpo = registoFinal.pdfFisico.includes(',')
          ? registoFinal.pdfFisico.split(',')[1]
          : registoFinal.pdfFisico
        await salvarChecklistPosVenda(formulario.value.unidadeAtual || '', pdfNome, base64Limpo)
      }
    } catch (servidorError) {
      console.warn('Servidor local offline:', servidorError.message)
    }

    const payloadFirebase = {
      status: modoEntregaCliente.value ? 'entregue' : 'em_estoque',
      unidadeAtual: formulario.value.unidadeAtual,
      unidadeDestino: modoEntregaCliente.value ? route.query.cliente || '' : '',
      checklistEntrada: JSON.parse(JSON.stringify(toRaw(checklistAcumulado))),
      ultimaAtualizacao: Timestamp.now(),
    }

    const itemHistorico = {
      tipo: modoEntregaCliente.value
        ? 'entrega_cliente'
        : modoTransferencia.value
          ? 'recebimento_transferencia'
          : 'recebimento',
      cliente: route.query.cliente || '',
      de: route.query.de || '',
      unidade: formulario.value.unidadeAtual,
      data: new Date().toLocaleDateString('pt-BR').split('/').reverse().join('-'),

      responsavel: assinaturas.value.responsavelNome || '',
      pdfNome: pdfNome,
      numero: numeroAcao,
      idUnicoAcao: registoFinal.id,
    }

    if (navigator.onLine) {
      try {
        const maquinaRef = doc(db, 'maquinas', serie)
        const snapAtualizacao = await getDoc(maquinaRef)
        let flagDuplicado = false

        if (snapAtualizacao.exists()) {
          const histFirin = snapAtualizacao.data().historico || []
          flagDuplicado = histFirin.some((h) => h.idUnicoAcao === itemHistorico.idUnicoAcao)
        }

        if (!flagDuplicado) {
          payloadFirebase.historico = arrayUnion(itemHistorico)

          if (modoEntregaCliente.value || modoTransferencia.value) {
            await updateDoc(maquinaRef, payloadFirebase)
          } else {
            payloadFirebase.serie = serie
            payloadFirebase.modelo = formulario.value.modelo || ''
            payloadFirebase.marca = formulario.value.marca || ''
            payloadFirebase.ano = formulario.value.ano || ''
            payloadFirebase.dataRecebimento = hojeLocal()
            await setDoc(maquinaRef, payloadFirebase, { merge: true })
          }
        }

        if (route.query.notificacaoId) {
          await updateDoc(doc(db, 'notificacoes', route.query.notificacaoId), { lida: true })
        }
        console.log('✅ Gravação realizada com sucesso online no Firebase.')
      } catch (fbError) {
        console.warn('Falha ao gravar online, desviando para a fila offline...', fbError)
        await empilharOperacaoOffline(serie, payloadFirebase, itemHistorico)
      }
    } else {
      await empilharOperacaoOffline(serie, payloadFirebase, itemHistorico)
    }

    if (rascunhoId.value) await removerRascunho(rascunhoId.value)

    // Limpa auto-saves
    await localforage.removeItem(`auto_save_pos_${serie}`)
    await localforage.removeItem(`auto_save_pos_temp_${route.params.tipo}`)

    $q.notify({ type: 'positive', message: 'Checklist finalizado e guardado!' })
    router.push(`/inicio/pos-venda/maquinas/historico?serie=${encodeURIComponent(serie)}`)
  } catch (error) {
    console.error('Erro ao salvar:', error)
    $q.notify({ type: 'negative', message: 'Erro ao guardar no telemóvel.' })
  } finally {
    $q.loading.hide()
  }
}

const empilharOperacaoOffline = async (serie, payload, historico) => {
  const pendentes = (await localforage.getItem('firebase_pendentes')) || []
  pendentes.push({
    colecao: 'maquinas',
    docId: serie,
    modoEntregaCliente: modoEntregaCliente.value,
    modoTransferencia: modoTransferencia.value,
    notificacaoId: route.query.notificacaoId || null,
    dados: payload,
    historicoAdicional: historico,
    criadoEm: new Date().toISOString(),
  })
  await localforage.setItem('firebase_pendentes', pendentes)
  console.log('📦 Operação empacotada na fila offline com sucesso.')
}
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
