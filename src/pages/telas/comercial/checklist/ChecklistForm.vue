<template>
  <q-page class="q-pa-md bg-grey-10 text-white">
    <div class="row items-center q-mb-md">
      <q-btn flat round icon="arrow_back" color="orange-8" @click="verificarSaida" />
      <div class="text-h6 text-weight-bold text-uppercase text-orange-8 q-ml-sm">
        {{ nomeMaquina || 'Carregando...' }}
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
        <q-input
          v-model="formulario.cliente"
          label="Nome do Cliente"
          dark
          outlined
          dense
          color="orange-8"
          @update:model-value="temAlteracoes = true"
        />
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-input
              v-model="formulario.cidade"
              label="Cidade"
              dark
              outlined
              dense
              color="orange-8"
              @update:model-value="temAlteracoes = true"
            />
          </div>
          <div class="col-6">
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
              v-model="formulario.modelo"
              label="Modelo"
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
              dark
              outlined
              dense
              color="orange-8"
              @update:model-value="temAlteracoes = true"
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
        <div class="row">
          <div class="col-6">
            <q-input
              v-model="formulario.ano"
              type="number"
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
      </q-card-section>
    </q-card>

    <div class="text-subtitle2 text-weight-bold text-grey-5 text-uppercase q-mb-sm q-ml-xs">
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
      id="file-input-geral"
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
            class="col-12 col-md-4"
            v-for="(item, index) in [
              { key: 'vendedor', label: 'Vendedor(a)', icon: 'badge' },
              { key: 'cliente', label: 'Cliente', icon: 'person' },
              { key: 'tecnico', label: 'Técnico(a) (Opcional)', icon: 'engineering' },
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
import { ref, onMounted, onUnmounted, nextTick, toRaw, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { doc, getDoc } from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import { getAuth } from 'firebase/auth'
import localforage from 'localforage'
import { gerarChecklistPdf } from 'src/utils/pdfGenerator'
import ItemVerificacao from 'src/components/ItemVerificacao.vue'
import { salvarChecklistComercial, verificarStatusServidor } from 'src/utils/ServidorApi'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

// ================= 2. ESTADOS DO FORMULÁRIO (Reatividade) =================
const temAlteracoes = ref(false)
const nomeMaquina = ref('')
const itens = ref([])
const cidadeCadastro = ref('') // Cidade do cadastro do usuário (Firebase)
const nomeUsuarioCadastro = ref('') // Nome do cadastro do usuário
const rascunhoId = ref(null) // ID do rascunho atual (se veio de um rascunho)
const regrasAno = [(val) => (val >= 1900 && val <= 2100) || 'Ano inválido']
const formulario = ref({
  cliente: '',
  cidade: '',
  data: new Date().toISOString().split('T')[0],
  marca: '',
  modelo: '',
  serie: '',
  ano: '',
  horimetro: '',
})

const fotosGerais = ref({ Frente: null, Direita: null, Traseira: null, Esquerda: null })
const fotoGeralSelecionada = ref(null)

// ================= 3. ESTADOS DO CANVAS E ASSINATURAS =================
const assinaturas = ref({
  vendedorNome: '',
  clienteNome: '',
  tecnicoNome: '',
  vendedorImagem: null,
  clienteImagem: null,
  tecnicoImagem: null,
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

let larguraAnterior = window.innerWidth[(val) => (val >= 1900 && val <= 2100) || 'Ano inválido']
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

const salvarRascunhoSilencioso = async () => {
  try {
    const chave = formulario.value.serie
      ? `auto_save_comercial_${formulario.value.serie}`
      : `auto_save_comercial_temp_${route.params.tipo}`

    await salvarRascunhoNoBanco(chave)
  } catch (e) {
    console.error('Erro no auto-save:', e)
  }
}

// ================= 4. CICLO DE VIDA (Montagem e Desmontagem) =================
onMounted(async () => {
  window.addEventListener('resize', handleResize)

  // Buscar cidade e nome do cadastro do usuário (Firebase)
  try {
    const sessao = await localforage.getItem('user_session')
    if (sessao) {
      if (sessao.cidade) cidadeCadastro.value = sessao.cidade
      if (sessao.nome) nomeUsuarioCadastro.value = sessao.nome
    }

    if (navigator.onLine && getAuth().currentUser) {
      const user = getAuth().currentUser
      const docRef = doc(db, 'usuarios', user.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const dados = docSnap.data()
        if (dados.cidade) {
          cidadeCadastro.value = dados.cidade
          await localforage.setItem('user_session', { ...(sessao || {}), cidade: dados.cidade })
        }
        if (dados.nome) {
          nomeUsuarioCadastro.value = dados.nome
          await localforage.setItem('user_session', { ...(sessao || {}), nome: dados.nome })
        }
      }
    }
  } catch (e) {
    console.warn('Erro ao buscar cidade do cadastro:', e)
  }

  try {
    $q.loading.show({ message: 'A carregar checklist...' })
    await carregarPerguntas()

    const idRascunho = route.query.rascunho
    const serieUrl = formulario.value.serie

    // Se não houver rascunho explícito, tenta o auto-save
    if (!idRascunho && serieUrl) {
      const rascunhoAuto = await localforage.getItem(`auto_save_comercial_${serieUrl}`)
      if (rascunhoAuto) await carregarRascunho(`auto_save_comercial_${serieUrl}`, true)
    }

    if (idRascunho) {
      await carregarRascunho(idRascunho)
    }
  } catch (error) {
    console.error('Erro geral ao carregar a tela:', error)
    $q.notify({ type: 'negative', message: 'Erro ao carregar os dados.' })
  } finally {
    $q.loading.hide()
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

// ================= 5. LÓGICA DO CANVAS (Desenho da Assinatura) =================
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
  const nomes = { vendedor: 'vendedorNome', cliente: 'clienteNome', tecnico: 'tecnicoNome' }
  const titulos = {
    vendedor: 'Assinatura do Vendedor',
    cliente: 'Assinatura do Cliente',
    tecnico: 'Assinatura do Técnico',
  }
  const labels = {
    vendedor: 'Nome do Vendedor',
    cliente: 'Nome do Cliente',
    tecnico: 'Nome do Técnico',
  }

  tipoAssinaturaAtual.value = tipo
  nomeAssinaturaAtual.value = assinaturas.value[nomes[tipo]] || ''
  tituloAssinaturaAtual.value = titulos[tipo]
  labelNomeAssinaturaAtual.value = labels[tipo]

  hasSigned.value = false
  dialogAssinaturaAberto.value = true
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
  const imagens = { vendedor: 'vendedorImagem', cliente: 'clienteImagem', tecnico: 'tecnicoImagem' }

  assinaturas.value[imagens[tipo]] = imagem
  fecharDialogAssinatura()
  temAlteracoes.value = true
  $q.notify({ type: 'positive', message: 'Assinatura confirmada.' })
}

// ================= 7. COMUNICAÇÃO COM FIREBASE (Perguntas) =================
const normalizarSetor = (setor, caminho = route.path) => {
  if (setor && setor !== 'undefined') {
    return setor === 'pos-venda' ? 'pos_venda' : setor
  }

  const urlAtual = (caminho || '').toLowerCase()
  if (urlAtual.includes('comercial')) return 'comercial'
  if (urlAtual.includes('pos_venda') || urlAtual.includes('pos-venda')) return 'pos_venda'
  if (urlAtual.includes('logistica')) return 'logistica'
  return 'geral'
}

const carregarPerguntas = async () => {
  const tipo = route.params.tipo
  if (!tipo) {
    nomeMaquina.value = 'Máquina Desconhecida'
    return
  }

  try {
    const setor = normalizarSetor(route.params.setor)
    const colecaoModelos = setor === 'comercial' ? 'modelos_checklists' : `modelos_${setor}`
    const docSnap = await getDoc(doc(db, colecaoModelos, tipo))
    if (docSnap.exists()) {
      const dados = docSnap.data()
      nomeMaquina.value = dados.nome || tipo

      console.log('DEBUG FIREBASE - Itens recebidos:', dados.itens)

      if (dados.itens && Array.isArray(dados.itens)) {
        itens.value = dados.itens.map((i) => ({ ...i, resposta: null, observacao: '', fotos: [] }))
      }
    } else {
      nomeMaquina.value = 'Modelo não encontrado'
    }
  } catch (e) {
    console.error('Erro ao buscar Firebase:', e)
    nomeMaquina.value = 'Erro ao carregar nome'
  }
}

// ================= 8. LÓGICA DE RASCUNHOS =================
const CHAVE_RASCUNHOS = 'rascunhos_checklist'

const carregarRascunho = async (id, isAuto = false) => {
  try {
    const rascunhos = (await localforage.getItem(CHAVE_RASCUNHOS)) || []
    // Se for auto-save, a estrutura é direta, se for rascunho manual, está no array
    const rascunho = isAuto ? await localforage.getItem(id) : rascunhos.find((r) => r.id === id)
    if (!rascunho) return

    rascunhoId.value = id

    // Restaura formulário
    if (rascunho.formulario) {
      formulario.value = { ...formulario.value, ...rascunho.formulario }
    }

    // Restaura fotos gerais
    if (rascunho.fotosGerais) {
      fotosGerais.value = { ...fotosGerais.value, ...rascunho.fotosGerais }
    }

    // Restaura assinaturas
    if (rascunho.assinaturas) {
      assinaturas.value = { ...assinaturas.value, ...rascunho.assinaturas }
    }

    // Restaura itens (mesclando respostas salvas com estrutura do Firebase)
    if (rascunho.itens && Array.isArray(rascunho.itens) && rascunho.itens.length > 0) {
      itens.value = rascunho.itens
    }

    // Restaura nomeMaquina se disponível
    if (rascunho.nomeMaquina) {
      nomeMaquina.value = rascunho.nomeMaquina
    }

    // NÃO seta temAlteracoes = true ao carregar rascunho
    temAlteracoes.value = false

    $q.notify({
      type: 'info',
      message: isAuto ? 'Progresso recuperado automaticamente.' : 'Rascunho carregado.',
    })
  } catch (e) {
    console.error('Erro ao carregar rascunho:', e)
  }
}

const salvarRascunhoNoBanco = async (idPersonalizado = null) => {
  try {
    const id = idPersonalizado || rascunhoId.value || Date.now().toString()
    rascunhoId.value = id

    const setor = normalizarSetor(route.params.setor)

    const dadosRascunho = {
      id,
      tipoMaquina: route.params.tipo || 'Desconhecido',
      nomeMaquina: nomeMaquina.value,
      setor,
      formulario: JSON.parse(JSON.stringify(toRaw(formulario.value))),
      fotosGerais: JSON.parse(JSON.stringify(toRaw(fotosGerais.value))),
      assinaturas: JSON.parse(JSON.stringify(toRaw(assinaturas.value))),
      itens: JSON.parse(JSON.stringify(toRaw(itens.value))),
      dataSalvo: new Date().toISOString(),
    }

    if (idPersonalizado) {
      await localforage.setItem(idPersonalizado, dadosRascunho)
      return true
    }

    const rascunhos = (await localforage.getItem(CHAVE_RASCUNHOS)) || []
    const indiceExistente = rascunhos.findIndex((r) => r.id === id)

    if (indiceExistente >= 0) {
      rascunhos[indiceExistente] = dadosRascunho
    } else {
      rascunhos.push(dadosRascunho)
    }

    await localforage.setItem(CHAVE_RASCUNHOS, rascunhos)
    return true
  } catch (e) {
    console.error('Erro ao salvar rascunho:', e)
    return false
  }
}

const salvarRascunho = () => salvarRascunhoNoBanco()

const removerRascunho = async (id) => {
  try {
    const rascunhos = (await localforage.getItem(CHAVE_RASCUNHOS)) || []
    const filtrados = rascunhos.filter((r) => r.id !== id)
    await localforage.setItem(CHAVE_RASCUNHOS, filtrados)
  } catch (e) {
    console.error('Erro ao remover rascunho:', e)
  }
}

// ================= 9. LÓGICA DE FOTOS GERAIS =================
const abrirCameraFotoGeral = (posicao) => {
  fotoGeralSelecionada.value = posicao
  document.getElementById('file-input-geral')?.click()
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

// ================= 10. SALVAMENTO E NAVEGAÇÃO =================
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
    message: 'Deseja salvar um rascunho deste checklist antes de sair?',
    options: {
      type: 'radio',
      model: 'salvar',
      items: [
        { label: 'Salvar e sair', value: 'salvar', color: 'orange-8' },
        { label: 'Descartar e sair', value: 'descartar', color: 'red-5' },
      ],
    },
    cancel: { label: 'Voltar', color: 'grey-5', flat: true },
    ok: { label: 'Confirmar', color: 'orange-8' },
    persistent: true,
  }).onOk(async (acao) => {
    if (acao === 'salvar') {
      await salvarRascunho()
      $q.notify({ type: 'positive', message: 'Rascunho salvo!' })
    }
    router.back()
  })
}

const salvarChecklistNoTelemovel = async () => {
  if (!formulario.value.cliente) {
    $q.notify({ type: 'warning', message: 'Preenche o nome do cliente antes de salvar.' })
    return
  }

  if (!verificarFotosGerais()) return

  if (!assinaturas.value.vendedorNome) {
    $q.notify({
      type: 'negative',
      message: 'Por favor, digite o nome do Vendedor(a).',
      position: 'top',
    })
    return
  }
  if (!assinaturas.value.vendedorImagem) {
    $q.notify({
      type: 'negative',
      message: 'A assinatura desenhada do Vendedor(a) é OBRIGATÓRIA!',
      position: 'top',
    })
    return
  }

  if (!assinaturas.value.clienteNome) {
    $q.notify({
      type: 'negative',
      message: 'Por favor, digite o nome do Cliente.',
      position: 'top',
    })
    return
  }
  if (!assinaturas.value.clienteImagem) {
    $q.notify({
      type: 'negative',
      message: 'A assinatura desenhada do Cliente é OBRIGATÓRIA!',
      position: 'top',
    })
    return
  }

  try {
    $q.loading.show({ message: 'A finalizar checklist...' })

    const setor = normalizarSetor(route.params.setor)

    const chaveUnica = `historico_${setor}`

    const dadosParaSalvar = {
      id: Date.now().toString(),
      tipoMaquina: route.params.tipo || 'Desconhecido',
      nomeMaquina: nomeMaquina.value,
      dadosFormulario: formulario.value,
      respostasChecklist: itens.value,
      assinaturas: assinaturas.value,
      fotosGerais: fotosGerais.value,
      dataConclusao: new Date().toISOString(),
      setor: setor,
    }

    const dadosLimpos = JSON.parse(JSON.stringify(toRaw(dadosParaSalvar)))
    const arquivoPdfBase64 = await gerarChecklistPdf(dadosLimpos, true)

    const registoFinal = {
      ...dadosLimpos,
      pdfFisico: arquivoPdfBase64,
    }

    let checklistsAntigos = (await localforage.getItem(chaveUnica)) || []
    checklistsAntigos.push(registoFinal)
    await localforage.setItem(chaveUnica, checklistsAntigos)

    // Sincronizar com o servidor (pasta da cidade do vendedor)
    try {
      const servidorOnline = await verificarStatusServidor()
      if (servidorOnline.online) {
        const cidade = cidadeCadastro.value || ''
        const vendedor = nomeUsuarioCadastro.value || 'desconhecido'

        const base64Limpo = registoFinal.pdfFisico.includes(',')
          ? registoFinal.pdfFisico.split(',')[1]
          : registoFinal.pdfFisico
        await salvarChecklistComercial(
          cidade,
          vendedor,
          base64Limpo,
          formulario.value.cliente,
          nomeMaquina.value,
          formulario.value.serie, // ← adiciona a série aqui
        )
        console.log('✅ Checklist comercial sincronizado com servidor')
      }
    } catch (servidorError) {
      console.warn('⚠️ Não sincronizou com servidor:', servidorError.message)
    }

    // --- NOVO: Salva avaliação da usada no Firestore para o Gerente ver ---
    try {
      const { setDoc, doc } = await import('firebase/firestore')
      const { db } = await import('src/boot/firebase')

      const serieTrim = (formulario.value.serie || '').trim().toUpperCase()
      if (serieTrim) {
        // Limpa fotos dos itens antes de salvar no Firestore
        const itensLimpos = JSON.parse(JSON.stringify(itens.value)).map((item) => {
          const resto = { ...item }
          delete resto.fotos
          return resto
        })

        await setDoc(doc(db, 'avaliacoes_usadas', serieTrim), {
          serie: serieTrim,
          modelo: formulario.value.modelo || '',
          marca: formulario.value.marca || '',
          ano: formulario.value.ano || '',
          horimetro: formulario.value.horimetro || '',
          cliente: formulario.value.cliente || '',
          cidade: formulario.value.cidade || cidadeCadastro.value || '',
          vendedor: nomeUsuarioCadastro.value || 'Desconhecido',
          dataAvaliacao: new Date().toISOString(),
          checklistAvaliacao: itensLimpos,
          status: 'avaliada',
          pdfNome: `${serieTrim}-avaliacao-comercial`,
        })
        console.log('✅ Avaliação salva no Firestore para gerente')
      }
    } catch (fsErr) {
      console.warn('⚠️ Falha ao salvar avaliação no Firestore:', fsErr.message)
    }

    // Remove o rascunho correspondente se existir
    if (rascunhoId.value) {
      await removerRascunho(rascunhoId.value)
    }

    // Limpa auto-saves
    await localforage.removeItem(`auto_save_comercial_${formulario.value.serie}`)
    await localforage.removeItem(`auto_save_comercial_temp_${route.params.tipo}`)

    $q.notify({ type: 'positive', message: 'Checklist finalizado e guardado!' })
    router.push(`/inicio/historico/${setor}`)
  } catch (error) {
    console.error('DEBUG: Erro ao salvar:', error)
    $q.notify({ type: 'negative', message: 'Erro ao guardar no telemóvel.' })
  } finally {
    $q.loading.hide()
  }
}
</script>

<style scoped>
/* ESTILOS DA TELA DE ASSINATURA */
.assinatura-dialog-card {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.assinatura-dialog-layout {
  display: flex;
  width: 100%;
  height: 100%;
  gap: 12px;
  padding: 12px;
}

.assinatura-dialog-side {
  width: 280px;
  flex: 0 0 280px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.assinatura-dialog-pad {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* O "Papel" do canvas */
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
.clear-sig-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

@media (orientation: portrait) {
  .assinatura-dialog-layout {
    flex-direction: column;
  }
  .assinatura-dialog-side {
    width: 100%;
    flex: 0 0 auto;
  }
}
</style>
