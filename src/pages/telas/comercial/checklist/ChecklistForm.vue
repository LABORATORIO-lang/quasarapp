<template>
  <q-page class="q-pa-md bg-grey-10 text-white">
    <div id="conteudo-checklist-pdf" :class="{ 'pdf-active': isGeneratingPdf }">
      <div class="row items-center q-mb-md hide-on-pdf">
        <q-btn flat round icon="arrow_back" color="orange-8" @click="voltar" />
        <div class="text-h6 text-weight-bold text-uppercase text-orange-8 q-ml-sm">
          {{ nomeMaquina || 'Carregando...' }}
        </div>
      </div>

      <div class="show-only-on-pdf text-center q-mb-lg q-mt-md">
        <div class="text-h5 text-bold text-uppercase" style="color: #f3772c">
          RELATÓRIO DE AVALIAÇÃO
        </div>
        <div class="text-subtitle1 text-grey-8 text-uppercase">{{ nomeMaquina }}</div>
      </div>

      <div class="text-subtitle2 text-weight-bold text-uppercase q-mb-sm q-ml-xs pdf-section-title">
        Dados da Máquina
      </div>
      <q-card
        class="bg-grey-9 shadow-3 q-mb-lg layout-card pdf-no-break"
        style="border-radius: 12px; border: 1px solid #424242"
      >
        <q-card-section class="q-gutter-y-md">
          <q-input
            v-model="formulario.cliente"
            label="Cliente"
            dark
            outlined
            dense
            color="orange-8"
            class="pdf-input"
            @keyup.enter.prevent="focusNext('cidade')"
          />
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                v-model="formulario.cidade"
                ref="cidade"
                label="Cidade"
                dark
                outlined
                dense
                color="orange-8"
                class="pdf-input"
                @keyup.enter.prevent="focusNext('marca')"
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
                class="pdf-input"
              />
            </div>
          </div>
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                v-model="formulario.marca"
                ref="marca"
                label="Marca"
                dark
                outlined
                dense
                color="orange-8"
                class="pdf-input"
                @keyup.enter.prevent="focusNext('modelo')"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="formulario.modelo"
                ref="modelo"
                label="Modelo"
                dark
                outlined
                dense
                color="orange-8"
                class="pdf-input"
                @keyup.enter.prevent="focusNext('serie')"
              />
            </div>
          </div>
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                v-model="formulario.serie"
                ref="serie"
                label="Nº de Série"
                dark
                outlined
                dense
                color="orange-8"
                class="pdf-input"
                @keyup.enter.prevent="focusNext('horimetro')"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="formulario.horimetro"
                ref="horimetro"
                type="number"
                inputmode="numeric"
                label="Horímetro"
                dark
                outlined
                dense
                color="orange-8"
                class="pdf-input"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div
        class="text-subtitle2 text-weight-bold text-grey-5 text-uppercase q-mb-sm q-ml-xs hide-on-pdf"
      >
        Fotos Gerais (Obrigatório)
      </div>
      <q-card
        class="bg-grey-9 shadow-3 q-mb-lg layout-card hide-on-pdf"
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
                    @click.stop="fotosGerais[posicao] = null"
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

      <div class="text-subtitle2 text-weight-bold text-uppercase q-mb-sm q-ml-xs pdf-section-title">
        Itens de Verificação
      </div>
      <q-card
        class="bg-grey-9 shadow-3 q-mb-lg layout-card"
        style="border-radius: 12px; border: 1px solid #424242"
      >
        <div v-for="(item, index) in itens" :key="index" class="pdf-no-break">
          <q-card-section class="q-py-md">
            <div class="text-orange-8 text-weight-bold q-mb-sm">
              {{ index + 1 }}. {{ item.texto }}
            </div>

            <div class="row q-gutter-xs">
              <template v-if="item.tipo === 'TRAFFIC_LIGHT'">
                <q-btn
                  flat
                  no-caps
                  class="col rounded-borders pdf-status-btn"
                  :class="
                    item.resposta === 'BOM' ? 'bg-green-7 text-white' : 'bg-grey-8 text-white'
                  "
                  label="Bom"
                  @click="item.resposta = 'BOM'"
                />
                <q-btn
                  flat
                  no-caps
                  class="col rounded-borders pdf-status-btn"
                  :class="
                    item.resposta === 'ATENCAO' ? 'bg-yellow-8 text-black' : 'bg-grey-8 text-white'
                  "
                  label="Atenção"
                  @click="item.resposta = 'ATENCAO'"
                />
                <q-btn
                  flat
                  no-caps
                  class="col rounded-borders pdf-status-btn"
                  :class="item.resposta === 'RUIM' ? 'bg-red-7 text-white' : 'bg-grey-8 text-white'"
                  label="Ruim"
                  @click="item.resposta = 'RUIM'"
                />
              </template>
              <template v-else>
                <q-btn
                  flat
                  no-caps
                  class="col rounded-borders pdf-status-btn"
                  :class="
                    item.resposta === 'SIM' ? 'bg-green-7 text-white' : 'bg-grey-8 text-white'
                  "
                  label="SIM"
                  @click="item.resposta = 'SIM'"
                />
                <q-btn
                  flat
                  no-caps
                  class="col rounded-borders pdf-status-btn"
                  :class="item.resposta === 'NAO' ? 'bg-red-7 text-white' : 'bg-grey-8 text-white'"
                  label="NÃO"
                  @click="item.resposta = 'NAO'"
                />
              </template>
            </div>

            <div
              v-if="
                item.resposta === 'RUIM' || item.resposta === 'ATENCAO' || item.resposta === 'NAO'
              "
              class="q-mt-md hide-on-pdf"
            >
              <q-btn
                color="orange-8"
                icon="add_a_photo"
                label="ADICIONAR FOTO"
                class="full-width"
                @click="item.showPhotoDialog = true"
              />
              <input
                type="file"
                accept="image/*"
                :id="'file-input-' + index"
                style="display: none"
                @change="fotosSelecionadas($event, index)"
              />
              <div class="row q-gutter-sm q-mt-sm">
                <div v-for="(foto, i) in item.fotos" :key="i" style="position: relative">
                  <q-img :src="foto" style="width: 70px; height: 70px; border-radius: 4px" />
                  <q-btn
                    round
                    dense
                    color="red"
                    icon="close"
                    size="xs"
                    style="position: absolute; top: -5px; right: -5px"
                    @click="confirmarExclusao(index, i)"
                  />
                </div>
              </div>
            </div>

            <q-input
              v-model="item.observacao"
              label="Observação"
              dark
              outlined
              dense
              color="orange-8"
              class="q-mt-sm pdf-input"
            />
          </q-card-section>
          <q-separator color="grey-8" v-if="index < itens.length - 1" class="pdf-separator" />
        </div>
      </q-card>

      <q-dialog
        v-for="(item, index) in itens"
        :key="'dialog-' + index"
        v-model="item.showPhotoDialog"
      >
        <q-card
          style="width: 300px; border-radius: 16px; border: 1px solid #424242"
          class="bg-grey-9 text-white"
        >
          <q-card-section class="row items-center q-pb-none">
            <div class="text-subtitle1 text-weight-bold text-orange-8">Origem da Foto</div>
            <q-space /><q-btn icon="close" flat round dense v-close-popup color="grey-5" />
          </q-card-section>
          <q-card-section class="q-pt-md">
            <div class="q-gutter-y-sm">
              <q-btn
                no-caps
                class="full-width bg-grey-8 text-white"
                style="border-radius: 8px"
                icon="camera_alt"
                label="Câmera (Foto)"
                @click="capturarCamera(index)"
              />
              <q-btn
                no-caps
                class="full-width bg-grey-8 text-white"
                style="border-radius: 8px"
                icon="photo_library"
                label="Galeria (Selecionar)"
                @click="abrirGaleria(index)"
              />
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>

      <div class="text-subtitle2 text-weight-bold text-uppercase q-mb-sm q-ml-xs pdf-section-title">
        Validação e Assinaturas
      </div>
      <q-card
        class="bg-grey-9 shadow-3 q-mb-lg layout-card pdf-no-break"
        style="border-radius: 12px; border: 1px solid #424242"
      >
        <q-card-section class="q-gutter-y-md">
          <div class="pdf-no-break">
            <q-input
              v-model="assinaturas.vendedorNome"
              label="Nome do Vendedor"
              dark
              outlined
              dense
              color="orange-8"
              class="q-mb-xs pdf-input"
            />
            <div class="text-caption q-mb-xs pdf-text">Assinatura do Vendedor:</div>
            <div class="signature-container bg-white">
              <canvas
                id="canvas-vendedor"
                @mousedown="startDrawing($event, 'vendedor')"
                @mousemove="draw($event, 'vendedor')"
                @mouseup="stopDrawing('vendedor')"
                @touchstart="startDrawingTouch($event, 'vendedor')"
                @touchmove="drawTouch($event, 'vendedor')"
                @touchend="stopDrawing('vendedor')"
              ></canvas>
              <q-btn
                round
                dense
                flat
                icon="delete"
                color="red"
                class="clear-sig-btn hide-on-pdf"
                @click="clearSignature('vendedor')"
              />
            </div>
          </div>
          <q-separator color="grey-8" class="pdf-separator" />
          <div class="pdf-no-break">
            <q-input
              v-model="assinaturas.clienteNome"
              label="Nome do Cliente"
              dark
              outlined
              dense
              color="orange-8"
              class="q-mb-xs pdf-input"
            />
            <div class="text-caption q-mb-xs pdf-text">Assinatura do Cliente:</div>
            <div class="signature-container bg-white">
              <canvas
                id="canvas-cliente"
                @mousedown="startDrawing($event, 'cliente')"
                @mousemove="draw($event, 'cliente')"
                @mouseup="stopDrawing('cliente')"
                @touchstart="startDrawingTouch($event, 'cliente')"
                @touchmove="drawTouch($event, 'cliente')"
                @touchend="stopDrawing('cliente')"
              ></canvas>
              <q-btn
                round
                dense
                flat
                icon="delete"
                color="red"
                class="clear-sig-btn hide-on-pdf"
                @click="clearSignature('cliente')"
              />
            </div>
          </div>
          <q-separator color="grey-8" class="hide-on-pdf" />
          <div v-if="!mostrarTecnico" class="text-center hide-on-pdf">
            <q-btn
              flat
              no-caps
              color="orange-8"
              icon="add"
              label="Adicionar Técnico Responsável (Opcional)"
              @click="abrirAreaTecnico"
            />
          </div>
          <div v-else class="pdf-no-break">
            <div class="row items-center justify-between q-mb-xs">
              <div class="text-caption pdf-text">Dados do Técnico:</div>
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="grey-5"
                size="sm"
                class="hide-on-pdf"
                @click="removerTecnico"
              />
            </div>
            <q-input
              v-model="assinaturas.tecnicoNome"
              label="Nome do Técnico"
              dark
              outlined
              dense
              color="orange-8"
              class="q-mb-xs pdf-input"
            />
            <div class="text-caption q-mb-xs pdf-text">Assinatura do Técnico:</div>
            <div class="signature-container bg-white">
              <canvas
                id="canvas-tecnico"
                @mousedown="startDrawing($event, 'tecnico')"
                @mousemove="draw($event, 'tecnico')"
                @mouseup="stopDrawing('tecnico')"
                @touchstart="startDrawingTouch($event, 'tecnico')"
                @touchmove="drawTouch($event, 'tecnico')"
                @touchend="stopDrawing('tecnico')"
              ></canvas>
              <q-btn
                round
                dense
                flat
                icon="delete"
                color="red"
                class="clear-sig-btn hide-on-pdf"
                @click="clearSignature('tecnico')"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div
        v-if="isGeneratingPdf"
        class="show-only-on-pdf html2pdf__page-break"
        style="margin-top: 40px"
      >
        <div class="text-h5 text-bold text-center q-mb-xl" style="color: #f3772c">
          ANEXO FOTOGRÁFICO
        </div>

        <div class="q-mb-xl pdf-no-break">
          <div
            class="text-h6 text-weight-bold q-mb-md"
            style="color: #1a1a1a; border-bottom: 2px solid #ccc; padding-bottom: 5px"
          >
            1. FOTOS GERAIS DA MÁQUINA
          </div>
          <div class="row q-col-gutter-md">
            <template
              v-for="pos in ['Frente', 'Direita', 'Traseira', 'Esquerda']"
              :key="'pdf-geral-' + pos"
            >
              <div class="col-6 pdf-no-break" v-if="fotosGerais[pos]">
                <div
                  style="
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    padding: 10px;
                    text-align: center;
                  "
                >
                  <div class="text-subtitle1 text-bold q-mb-sm" style="color: #333">{{ pos }}</div>
                  <img
                    :src="fotosGerais[pos]"
                    style="width: 100%; height: 280px; object-fit: contain; border-radius: 4px"
                  />
                </div>
              </div>
            </template>
          </div>
        </div>

        <div
          v-for="item in itensComFoto"
          :key="'pdf-item-' + item.indiceOriginal"
          class="q-mb-xl html2pdf__page-break pdf-no-break"
        >
          <div
            class="text-h6 text-weight-bold q-mb-md"
            style="color: #1a1a1a; border-bottom: 2px solid #ccc; padding-bottom: 5px"
          >
            Item {{ item.indiceOriginal }}: {{ item.texto }}
          </div>
          <div class="row q-col-gutter-md">
            <div
              class="col-6 pdf-no-break"
              v-for="(foto, fIdx) in item.fotos"
              :key="'pdf-foto-' + fIdx"
            >
              <div
                style="
                  border: 1px solid #ccc;
                  border-radius: 8px;
                  padding: 10px;
                  text-align: center;
                "
              >
                <div
                  class="text-subtitle1 text-bold q-mb-sm"
                  :class="item.resposta === 'RUIM' ? 'text-red' : 'text-orange-9'"
                >
                  Status do Item: {{ item.resposta }}
                </div>
                <img
                  :src="foto"
                  style="width: 100%; height: 280px; object-fit: contain; border-radius: 4px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <q-btn
      color="orange-8"
      label="FINALIZAR E SALVAR"
      class="full-width text-bold shadow-3 q-py-sm q-mb-xl hide-on-pdf"
      size="lg"
      @click="salvarChecklist"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue' // onUnmounted adicionado
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { doc, getDoc, collection, addDoc } from 'firebase/firestore'
import { db, auth } from 'src/boot/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import html2pdf from 'html2pdf.js'

// Controle visual da geração do PDF
const isGeneratingPdf = ref(false)

const fotosGerais = ref({ Frente: null, Direita: null, Traseira: null, Esquerda: null })
const posAtual = ref('')
const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const cidade = ref(null),
  marca = ref(null),
  modelo = ref(null),
  serie = ref(null),
  horimetro = ref(null)
const nomeMaquina = ref(''),
  itens = ref([])
const formulario = ref({
  cliente: '',
  cidade: '',
  data: new Date().toISOString().split('T')[0],
  marca: '',
  modelo: '',
  serie: '',
  horimetro: '',
})

const mostrarTecnico = ref(false)

const assinaturas = ref({
  vendedorNome: '',
  clienteNome: '',
  tecnicoNome: '',
})

const drawingStates = {
  vendedor: { isDrawing: false, lastX: 0, lastY: 0, hasSigned: false },
  cliente: { isDrawing: false, lastX: 0, lastY: 0, hasSigned: false },
  tecnico: { isDrawing: false, lastX: 0, lastY: 0, hasSigned: false },
}

const itensComFoto = computed(() => {
  return itens.value
    .map((item, index) => ({ ...item, indiceOriginal: index + 1 }))
    .filter((item) => item.fotos && item.fotos.length > 0)
})

let authListenerUnsubscribe = null // Variável global para armazenar a função de cancelamento

onMounted(() => {
  $q.loading.show({ message: 'Carregando sessão...' })

  // Guardamos a função na variável para poder destruí-la depois
  authListenerUnsubscribe = onAuthStateChanged(auth, (user) => {
    if (user && user.displayName) {
      assinaturas.value.vendedorNome = user.displayName
    } else if (user && user.email) {
      assinaturas.value.vendedorNome = user.email.split('@')[0]
    }
  })

  if (auth.currentUser && auth.currentUser.displayName) {
    assinaturas.value.vendedorNome = auth.currentUser.displayName
  }

  carregarPerguntas()
})

// Quando o componente for destruído (usuário mudou de tela), desligamos o ouvinte para evitar o aviso do ESLint e salvar RAM
onUnmounted(() => {
  if (authListenerUnsubscribe) {
    authListenerUnsubscribe()
  }
})

const carregarPerguntas = async () => {
  const tipoSelecionado = route.params.tipo
  if (!tipoSelecionado) return router.push('/inicio/comercial/checklist/selecionar')
  try {
    const docSnap = await getDoc(doc(db, 'modelos_checklists', tipoSelecionado))
    if (docSnap.exists()) {
      const data = docSnap.data()
      nomeMaquina.value = data.nome || tipoSelecionado.replace('_', ' ')
      itens.value = (data.itens || []).map((i) => ({
        texto: i.texto,
        tipo: i.tipo || 'YES_NO',
        resposta: null,
        observacao: '',
        fotos: [],
        showPhotoDialog: false,
      }))
      nextTick(() => {
        initCanvas('vendedor')
        initCanvas('cliente')
      })
    }
  } catch (e) {
    console.error(e)
  } finally {
    $q.loading.hide()
  }
}

function initCanvas(id) {
  const c = document.getElementById(`canvas-${id}`)
  if (!c) return
  const ctx = c.getContext('2d')
  c.width = c.parentElement.clientWidth
  c.height = 120
  ctx.strokeStyle = '#1a1a1a'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}
function startDrawing(e, id) {
  const s = drawingStates[id]
  s.isDrawing = true
  const r = e.target.getBoundingClientRect()
  s.lastX = e.clientX - r.left
  s.lastY = e.clientY - r.top
}
function draw(e, id) {
  const s = drawingStates[id]
  if (!s.isDrawing) return
  const ctx = document.getElementById(`canvas-${id}`).getContext('2d')
  const r = e.target.getBoundingClientRect()
  const x = e.clientX - r.left
  const y = e.clientY - r.top
  ctx.beginPath()
  ctx.moveTo(s.lastX, s.lastY)
  ctx.lineTo(x, y)
  ctx.stroke()
  s.lastX = x
  s.lastY = y
  s.hasSigned = true
}
function stopDrawing(id) {
  drawingStates[id].isDrawing = false
}
function startDrawingTouch(e, id) {
  if (e.touches.length !== 1) return
  const s = drawingStates[id]
  s.isDrawing = true
  const r = e.target.getBoundingClientRect()
  s.lastX = e.touches[0].clientX - r.left
  s.lastY = e.touches[0].clientY - r.top
  e.preventDefault()
}
function drawTouch(e, id) {
  const s = drawingStates[id]
  if (!s.isDrawing || e.touches.length !== 1) return
  const ctx = document.getElementById(`canvas-${id}`).getContext('2d')
  const r = e.target.getBoundingClientRect()
  const x = e.touches[0].clientX - r.left
  const y = e.touches[0].clientY - r.top
  ctx.beginPath()
  ctx.moveTo(s.lastX, s.lastY)
  ctx.lineTo(x, y)
  ctx.stroke()
  s.lastX = x
  s.lastY = y
  s.hasSigned = true
  e.preventDefault()
}
function clearSignature(id) {
  const c = document.getElementById(`canvas-${id}`)
  if (!c) return
  c.getContext('2d').clearRect(0, 0, c.width, c.height)
  drawingStates[id].hasSigned = false
}
function abrirAreaTecnico() {
  mostrarTecnico.value = true
  nextTick(() => initCanvas('tecnico'))
}
function removerTecnico() {
  mostrarTecnico.value = false
  assinaturas.value.tecnicoNome = ''
  drawingStates.tecnico.hasSigned = false
}

function abrirCameraFotoGeral(pos) {
  posAtual.value = pos
  document.getElementById('file-input-geral').click()
}
function processarFotoGeral(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      fotosGerais.value[posAtual.value] = e.target.result
    }
    reader.readAsDataURL(file)
  }
}
function capturarCamera(index) {
  const input = document.getElementById('file-input-' + index)
  input.multiple = false
  input.setAttribute('capture', 'environment')
  input.click()
  itens.value[index].showPhotoDialog = false
}
function abrirGaleria(index) {
  const input = document.getElementById('file-input-' + index)
  input.multiple = true
  input.removeAttribute('capture')
  input.click()
  itens.value[index].showPhotoDialog = false
}
function fotosSelecionadas(event, index) {
  const files = event.target.files
  for (let file of files) {
    const reader = new FileReader()
    reader.onload = (e) => {
      itens.value[index].fotos.push(e.target.result)
    }
    reader.readAsDataURL(file)
  }
}
function confirmarExclusao(itemIndex, photoIndex) {
  $q.dialog({ title: 'Excluir', message: 'Remover foto?', cancel: true }).onOk(() => {
    itens.value[itemIndex].fotos.splice(photoIndex, 1)
  })
}

// --- GERADOR DE PDF ---
async function baixarPdfPremium() {
  isGeneratingPdf.value = true

  await nextTick()
  await new Promise((r) => setTimeout(r, 400))

  const elemento = document.getElementById('conteudo-checklist-pdf')

  const opcoes = {
    margin: [10, 10, 10, 10],
    filename: `Checklist_${formulario.value.cliente || 'Equipamento'}_${formulario.value.data}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'] },
  }

  await html2pdf().set(opcoes).from(elemento).save()
  isGeneratingPdf.value = false
}

// --- SALVAMENTO E HISTÓRICO ---
async function salvarChecklist() {
  // 1. Validações
  const obrigat = ['Frente', 'Direita', 'Traseira', 'Esquerda']
  const pendente = obrigat.find((p) => !fotosGerais.value[p])
  if (pendente) {
    $q.notify({ message: `Foto da ${pendente} é obrigatória!`, color: 'orange-8', icon: 'warning' })
    return
  }

  if (!formulario.value.cliente || !assinaturas.value.vendedorNome) {
    $q.notify({
      message: 'Preencha o nome do Cliente e do Vendedor!',
      color: 'orange-8',
      icon: 'warning',
    })
    return
  }

  if (!drawingStates.vendedor.hasSigned || !drawingStates.cliente.hasSigned) {
    $q.notify({ message: 'Assinaturas obrigatórias!', color: 'orange-8', icon: 'warning' })
    return
  }

  $q.loading.show({ message: 'Gerando PDF...' })
  try {
    // 1. Gera o PDF antes de qualquer coisa (usa as fotos da memória)
    await baixarPdfPremium()

    // 2. Prepara dados TEXTUAIS para o Firebase (sem fotos)
    const dadosParaFirebase = {
      tipoMaquina: route.params.tipo,
      nomeMaquina: nomeMaquina.value,
      dados: formulario.value,
      // Apenas os textos das respostas
      respostas: itens.value.map((i) => ({
        texto: i.texto,
        resposta: i.resposta,
        observacao: i.observacao,
      })),
      validacao: {
        vendedorNome: assinaturas.value.vendedorNome,
        clienteNome: assinaturas.value.clienteNome || formulario.value.cliente,
        tecnicoNome: assinaturas.value.tecnicoNome || '',
      },
      data: new Date().toISOString(),
      status: 'GERADO_LOCALMENTE',
    }

    // 3. Salva apenas o texto no Firebase
    await addDoc(collection(db, 'checklists'), dadosParaFirebase)

    $q.notify({
      message: 'PDF baixado e dados salvos no histórico!',
      color: 'green-8',
      icon: 'check_circle',
    })
    router.push('/inicio/comercial/checklist')
  } catch (e) {
    console.error(e)
    $q.notify({ message: 'Erro ao salvar. Verifique sua conexão.', color: 'red-8' })
  } finally {
    $q.loading.hide()
  }
}

function focusNext(field) {
  if (field === 'cidade') cidade.value.focus()
  else if (field === 'marca') marca.value.focus()
  else if (field === 'modelo') modelo.value.focus()
  else if (field === 'serie') serie.value.focus()
  else if (field === 'horimetro') horimetro.value.focus()
}
function voltar() {
  router.go(-1)
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
:deep(input::-webkit-outer-spin-button),
:deep(input::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}
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
}
.clear-sig-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: rgba(255, 255, 255, 0.9);
}

.show-only-on-pdf {
  display: none;
}

/* TRAVA DE CORTE DO PDF (Garante que blocos não partam ao meio) */
.pdf-no-break {
  page-break-inside: avoid !important;
  break-inside: avoid !important;
}

.pdf-active {
  background-color: #ffffff !important;
  color: #000000 !important;
  padding: 15px !important;
}
.pdf-active .hide-on-pdf {
  display: none !important;
}
.pdf-active .show-only-on-pdf {
  display: block !important;
}

.pdf-active .layout-card {
  background-color: #ffffff !important;
  border: 1px solid #dddddd !important;
  box-shadow: none !important;
  color: #000000 !important;
}

.pdf-active .pdf-section-title {
  color: #333333 !important;
}
.pdf-active .pdf-text {
  color: #000000 !important;
}
.pdf-active .pdf-separator {
  border-color: #eeeeee !important;
}

.pdf-active .pdf-input :deep(.q-field__native),
.pdf-active .pdf-input :deep(.q-field__label),
.pdf-active .pdf-input :deep(.q-field__prefix) {
  color: #000000 !important;
}
.pdf-active .pdf-input :deep(.q-field__control) {
  background: #ffffff !important;
  border-color: #aaaaaa !important;
}

.pdf-active .pdf-status-btn :deep(.bg-grey-8) {
  background-color: #ffffff !important;
  border: 1px solid #cccccc !important;
  color: #666666 !important;
}
.pdf-active .pdf-status-btn {
  border-radius: 6px;
}

.pdf-active .pdf-status-btn :deep(.bg-green-7),
.pdf-active .pdf-status-btn :deep(.bg-red-7) {
  color: white !important;
}

.html2pdf__page-break {
  page-break-before: always;
}
</style>
