<template>
  <q-page class="q-pa-md bg-grey-10 text-white">
    <!-- Cabeçalho -->
    <div class="row items-center q-mb-md">
      <q-btn flat round icon="arrow_back" color="orange-8" @click="verificarSaida" />
      <div class="text-h6 text-weight-bold text-uppercase text-orange-8 q-ml-sm">
        {{ categoriaNome || 'Checklist Starpes' }}
      </div>
    </div>

    <!-- DADOS DO CHECKLIST -->
    <div class="text-subtitle2 text-weight-bold text-uppercase q-mb-sm q-ml-xs">
      Dados do Checklist
    </div>
    <q-card
      class="bg-grey-9 shadow-3 q-mb-lg"
      style="border-radius: 12px; border: 1px solid #424242"
    >
      <q-card-section class="q-gutter-y-md">
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="formulario.concessionaria"
              label="Concessionária"
              dark
              outlined
              dense
              color="orange-8"
              @update:model-value="temAlteracoes = true"
            />
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              v-model="formulario.cliente"
              label="Cliente"
              dark
              outlined
              dense
              color="orange-8"
              @update:model-value="temAlteracoes = true"
            />
          </div>
        </div>
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="formulario.produto"
              label="Produto"
              dark
              outlined
              dense
              color="orange-8"
              @update:model-value="temAlteracoes = true"
            />
          </div>
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
          <div class="col-12 col-sm-6">
            <q-input
              v-model="formulario.tecnico"
              label="Técnico"
              dark
              outlined
              dense
              color="orange-8"
              @update:model-value="temAlteracoes = true"
            />
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              v-model="formulario.serieAno"
              label="Série / Ano"
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

    <!-- MÁQUINAS -->
    <div class="text-subtitle2 text-weight-bold text-uppercase q-mb-sm q-ml-xs">
      Máquinas
    </div>
    <q-card
      class="bg-grey-9 shadow-3 q-mb-lg"
      style="border-radius: 12px; border: 1px solid #424242"
    >
      <q-card-section>
        <div class="row q-col-gutter-sm">
          <div
            v-for="maquina in maquinas"
            :key="maquina"
            class="col-6 col-sm-4 col-md-3"
          >
            <q-checkbox
              v-model="maquinasSelecionadas"
              :val="maquina"
              :label="maquina"
              dark
              color="orange-8"
              @update:model-value="temAlteracoes = true"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- ITENS DE VERIFICAÇÃO POR SEÇÃO -->
    <div
      v-for="(secao, sIndex) in secoes"
      :key="sIndex"
      class="q-mb-lg"
    >
      <div class="text-subtitle2 text-weight-bold text-uppercase q-mb-sm q-ml-xs">
        {{ secao.titulo }}
      </div>
      <q-card
        class="bg-grey-9 shadow-3"
        style="border-radius: 12px; border: 1px solid #424242"
      >
        <ItemVerificacaoStarpes
          v-for="(item, iIndex) in secao.itens"
          :key="iIndex"
          :item="item"
          :index="iIndex"
          @update:item="secao.itens[iIndex] = $event"
          @alteracao="temAlteracoes = true"
        />
      </q-card>
    </div>

    <!-- LEGENDA R/A/V -->
    <q-card
      class="bg-grey-9 shadow-3 q-mb-lg"
      style="border-radius: 12px; border: 1px solid #424242"
    >
      <q-card-section class="row q-col-gutter-sm items-center">
        <div class="col-12 text-caption text-grey-5 q-mb-xs">Legenda:</div>
        <div class="col-4 row items-center q-gutter-xs">
          <q-badge color="red-7" rounded />
          <span class="text-caption">R = Reparo Imediato</span>
        </div>
        <div class="col-4 row items-center q-gutter-xs">
          <q-badge color="yellow-8" rounded />
          <span class="text-caption">A = Reparo Futuro</span>
        </div>
        <div class="col-4 row items-center q-gutter-xs">
          <q-badge color="green-7" rounded />
          <span class="text-caption">V = OK</span>
        </div>
      </q-card-section>
    </q-card>

    <!-- ASSINATURAS -->
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
              { key: 'tecnico', label: 'Técnico', icon: 'engineering' },
              { key: 'cliente', label: 'Cliente', icon: 'person' },
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
                  label="Nome completo"
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

    <!-- DIALOG ASSINATURA -->
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

    <!-- BOTÃO SALVAR -->
    <q-btn
      color="orange-8"
      label="Salvar e Gerar PDF"
      icon="save"
      class="full-width q-mb-xl"
      size="lg"
      @click="salvarChecklist"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, toRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { doc, getDoc } from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import localforage from 'localforage'
import { gerarStarpesPdf } from './pdfstarpes'
import ItemVerificacaoStarpes from './ItemVerificacaoStarpes.vue'
import { salvarChecklistCompleto, verificarStatusServidor } from 'src/utils/ServidorApi'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

// ================= ESTADOS =================
const temAlteracoes = ref(false)
const categoriaNome = ref('')
const categoriaId = ref('')
const maquinas = ref([])
const maquinasSelecionadas = ref([])
const secoes = ref([])
const rascunhoId = ref(null)
const loading = ref(false)

const userName = ref('')

const formulario = ref({
  concessionaria: '',
  cliente: '',
  produto: '',
  data: new Date().toISOString().split('T')[0],
  tecnico: '',
  serieAno: '',
})

const assinaturas = ref({
  tecnicoNome: '',
  clienteNome: '',
  tecnicoImagem: null,
  clienteImagem: null,
})

const dialogAssinaturaAberto = ref(false)
const tipoAssinaturaAtual = ref('')
const tituloAssinaturaAtual = ref('')

const canvasRef = ref(null)
const isDrawing = ref(false)
const hasSigned = ref(false)
let lastX = 0
let lastY = 0
let larguraAnterior = window.innerWidth

// ================= CICLO DE VIDA =================
onMounted(async () => {
  window.addEventListener('resize', handleResize)
  categoriaId.value = route.params.categoria

  try {
    const sessao = await localforage.getItem('user_session')
    if (sessao?.nome) userName.value = sessao.nome
  } catch (e) {
    console.error('Erro ao buscar sessão:', e)
  }

  try {
    loading.value = true
    await carregarCategoria()

    const idRascunho = route.query.rascunho
    if (idRascunho) {
      await carregarRascunho(idRascunho)
    }
  } catch (error) {
    console.error('Erro ao carregar tela:', error)
    $q.notify({ type: 'negative', message: 'Erro ao carregar os dados.' })
  } finally {
    loading.value = false
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

// ================= FIREBASE =================
const carregarCategoria = async () => {
  const id = route.params.categoria
  if (!id) {
    categoriaNome.value = 'Categoria Desconhecida'
    return
  }
  try {
    const docSnap = await getDoc(doc(db, 'checklists_starpes', id))
    if (docSnap.exists()) {
      const dados = docSnap.data()
      categoriaNome.value = dados.nome || id
      maquinas.value = dados.maquinas || []

      if (dados.secoes && Array.isArray(dados.secoes)) {
        secoes.value = dados.secoes.map((sec) => ({
          titulo: sec.titulo || 'Seção',
          itens: (sec.itens || []).map((i) => ({
            ...i,
            resposta: null,
            observacao: '',
          })),
        }))
      }
    } else {
      categoriaNome.value = 'Categoria não encontrada'
    }
  } catch (e) {
    console.error('Erro ao buscar Firebase:', e)
    categoriaNome.value = 'Erro ao carregar'
  }
}

// ================= CANVAS ASSINATURA =================
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

// ================= DIALOG ASSINATURA =================
const abrirDialogAssinatura = (tipo) => {
  const titulos = {
    tecnico: 'Assinatura do Técnico',
    cliente: 'Assinatura do Cliente',
  }

  tipoAssinaturaAtual.value = tipo
  tituloAssinaturaAtual.value = titulos[tipo]
  hasSigned.value = false
  dialogAssinaturaAberto.value = true

  nextTick(() => {
    initCanvas()
  })
}

const fecharDialogAssinatura = () => {
  dialogAssinaturaAberto.value = false
  tipoAssinaturaAtual.value = ''
}

const confirmarAssinaturaDialog = () => {
  const tipo = tipoAssinaturaAtual.value

  if (!hasSigned.value) {
    $q.notify({ type: 'warning', message: 'Faça a assinatura antes de confirmar.' })
    return
  }

  const imagem = canvasRef.value.toDataURL('image/png')
  const imagens = { tecnico: 'tecnicoImagem', cliente: 'clienteImagem' }

  assinaturas.value[imagens[tipo]] = imagem
  fecharDialogAssinatura()
  temAlteracoes.value = true
  $q.notify({ type: 'positive', message: 'Assinatura confirmada.' })
}

// ================= RASCUNHOS =================
const carregarRascunho = async (id) => {
  try {
    const dados = await localforage.getItem(`rascunho_starpes_${id}`)
    if (!dados) return

    rascunhoId.value = id

    if (dados.formulario) formulario.value = { ...formulario.value, ...dados.formulario }
    if (dados.maquinasSelecionadas) maquinasSelecionadas.value = dados.maquinasSelecionadas
    if (dados.assinaturas) assinaturas.value = { ...assinaturas.value, ...dados.assinaturas }
    if (dados.categoriaNome) categoriaNome.value = dados.categoriaNome
    if (dados.secoes && Array.isArray(dados.secoes)) secoes.value = dados.secoes

    temAlteracoes.value = false
    $q.notify({ type: 'info', message: 'Rascunho carregado. Continue de onde parou.' })
  } catch (e) {
    console.error('Erro ao carregar rascunho:', e)
  }
}

const salvarRascunho = async () => {
  try {
    const id = rascunhoId.value || Date.now().toString()
    rascunhoId.value = id

    const dadosRascunho = {
      id,
      categoriaId: categoriaId.value,
      categoriaNome: categoriaNome.value,
      formulario: JSON.parse(JSON.stringify(toRaw(formulario.value))),
      maquinasSelecionadas: JSON.parse(JSON.stringify(toRaw(maquinasSelecionadas.value))),
      assinaturas: JSON.parse(JSON.stringify(toRaw(assinaturas.value))),
      secoes: JSON.parse(JSON.stringify(toRaw(secoes.value))),
      data: new Date().toISOString(),
    }

    await localforage.setItem(`rascunho_starpes_${id}`, dadosRascunho)
    temAlteracoes.value = false
    return true
  } catch (e) {
    console.error('Erro ao salvar rascunho:', e)
    return false
  }
}

const removerRascunho = async (id) => {
  try {
    await localforage.removeItem(`rascunho_starpes_${id}`)
  } catch (e) {
    console.error('Erro ao remover rascunho:', e)
  }
}

// ================= NAVEGAÇÃO =================
const verificarSaida = () => {
  if (!temAlteracoes.value) {
    router.back()
    return
  }
  $q.dialog({
    title: 'Salvar Progresso',
    message: 'Seu progresso será salvo em rascunhos. Deseja sair?',
    cancel: 'Não, continuar',
    ok: 'Sim, salvar e sair',
    persistent: true,
  }).onOk(async () => {
    const salvo = await salvarRascunho()
    if (salvo) {
      $q.notify({ type: 'positive', message: 'Rascunho salvo.' })
    }
    router.back()
  })
}

// ================= SALVAMENTO E PDF =================
const salvarChecklist = async () => {
  if (!formulario.value.concessionaria) {
    $q.notify({ type: 'warning', message: 'Preenche a Concessionária antes de salvar.' })
    return
  }
  if (!formulario.value.cliente) {
    $q.notify({ type: 'warning', message: 'Preenche o Cliente antes de salvar.' })
    return
  }
  if (!formulario.value.tecnico) {
    $q.notify({ type: 'warning', message: 'Preenche o Técnico antes de salvar.' })
    return
  }
  if (!assinaturas.value.tecnicoNome) {
    $q.notify({ type: 'negative', message: 'Por favor, digite o nome do Técnico.' })
    return
  }
  if (!assinaturas.value.tecnicoImagem) {
    $q.notify({ type: 'negative', message: 'A assinatura do Técnico é OBRIGATÓRIA!' })
    return
  }
  if (!assinaturas.value.clienteNome) {
    $q.notify({ type: 'negative', message: 'Por favor, digite o nome do Cliente.' })
    return
  }
  if (!assinaturas.value.clienteImagem) {
    $q.notify({ type: 'negative', message: 'A assinatura do Cliente é OBRIGATÓRIA!' })
    return
  }

  try {
    $q.loading.show({ message: 'A gerar PDF...' })
    const agora = new Date()
    const dataHoraFormatada =
      agora.toLocaleDateString('pt-BR') +
      ' às ' +
      agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

    const dadosParaSalvar = {
      id: Date.now().toString(),
      categoriaId: categoriaId.value,
      categoriaNome: categoriaNome.value,
      formulario: formulario.value,
      maquinasSelecionadas: maquinasSelecionadas.value,
      secoes: secoes.value,
      assinaturas: assinaturas.value,
      dataConclusao: new Date().toISOString(),
      userName: userName.value,
      dataHoraFormatada: dataHoraFormatada,
    }

    const dadosLimpos = JSON.parse(JSON.stringify(toRaw(dadosParaSalvar)))
    const arquivoPdfBase64 = await gerarStarpesPdf(dadosLimpos, true)

    const registoFinal = { ...dadosLimpos, pdfFisico: arquivoPdfBase64 }

    // Salvar no histórico local (localForage)
    const chaveHistorico = 'historico_starpes'
    const historico = (await localforage.getItem(chaveHistorico)) || []
    historico.push(registoFinal)
    await localforage.setItem(chaveHistorico, historico)

    // Tentar salvar no servidor também
    try {
      $q.loading.show({ message: 'A sincronizar com servidor...' })
      const servidorOnline = await verificarStatusServidor()
      
      if (servidorOnline.online) {
        const resultadoServidor = await salvarChecklistCompleto(
          categoriaId.value || 'starpes',
          registoFinal
        )
        
        if (resultadoServidor.checklistSalvo) {
          $q.notify({ 
            type: 'positive', 
            message: 'Checklist salvo no servidor com sucesso!' 
          })
        } else {
          $q.notify({ 
            type: 'warning', 
            message: 'Salvo localmente. Servidor indisponível para sincronização.' 
          })
        }
      } else {
        $q.notify({ 
          type: 'warning', 
          message: 'Servidor offline. Checklist salvo apenas localmente.' 
        })
      }
    } catch (servidorError) {
      console.warn('Erro ao sincronizar com servidor:', servidorError)
      $q.notify({ 
        type: 'warning', 
        message: 'Erro ao sincronizar com servidor. Dados salvos localmente.' 
      })
    }

    if (rascunhoId.value) {
      await removerRascunho(rascunhoId.value)
    }

    $q.notify({ type: 'positive', message: 'Checklist finalizado e PDF gerado!' })

    router.push('/inicio/pos-venda/starpes')
  } catch (error) {
    console.error('DEBUG: Erro ao salvar:', error)
    $q.notify({ type: 'negative', message: 'Erro ao gerar PDF.' })
  } finally {
    $q.loading.hide()
  }
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
