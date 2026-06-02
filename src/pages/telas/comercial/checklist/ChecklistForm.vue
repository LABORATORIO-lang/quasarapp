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
      class="bg-grey-9 shadow-3 q-mb-lg"
      style="border-radius: 12px; border: 1px solid #424242"
    >
      <q-card-section class="q-gutter-y-md q-pa-md">
        <!-- Repetição para cada tipo de assinante -->
        <div
          v-for="(item, index) in [
            { key: 'vendedor', label: 'Vendedor(a):', icon: 'badge' },
            { key: 'cliente', label: 'Cliente:', icon: 'person' },
            { key: 'tecnico', label: 'técnico(a): (Opicional)', icon: 'engineering' },
          ]"
          :key="index"
        >
          <div class="row items-center q-col-gutter-sm">
            <!-- Campo de Nome -->
            <div class="col">
              <q-input
                v-model="assinaturas[item.key + 'Nome']"
                :label="'Nome do ' + item.label"
                dark
                outlined
                dense
                color="orange-8"
                @update:model-value="temAlteracoes = true"
              />
            </div>

            <!-- Botão de Ação -->
            <div class="col-shrink">
              <q-btn
                :color="assinaturas[item.key + 'Imagem'] ? 'green' : 'orange-8'"
                dense
                padding="sm md"
                icon="edit_square"
                @click="abrirDialogAssinatura(item.key)"
              >
                <q-tooltip>Coletar assinatura de {{ item.label }}</q-tooltip>
              </q-btn>
            </div>
          </div>

          <!-- Linha separadora, exceto no último item -->
          <q-separator v-if="index < 2" color="grey-8" class="q-mt-sm" />
        </div>
      </q-card-section>
    </q-card>

    <q-dialog v-model="dialogAssinaturaAberto" persistent maximized @show="initCanvas">
      <q-card class="bg-grey-9 text-white column full-height">
        <!-- CABEÇALHO E CAMPO DE NOME (Onde o utilizador digita primeiro) -->
        <q-card-section class="col-shrink">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6 text-orange-8">{{ tituloAssinaturaAtual }}</div>
            <q-btn flat round dense icon="close" color="grey-5" @click="fecharDialogAssinatura" />
          </div>
        </q-card-section>

        <!-- ÁREA DE ASSINATURA -->
        <q-card-section class="col relative-position q-pa-md flex">
          <div class="signature-container bg-grey-1 fit shadow-5">
            <canvas
              ref="canvasRef"
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
              dense
              flat
              icon="delete"
              color="red"
              class="clear-sig-btn"
              @click="clearSignature"
            />
          </div>
        </q-card-section>

        <!-- BOTÕES -->
        <q-card-section class="col-shrink row q-col-gutter-sm">
          <div class="col-6">
            <q-btn
              outline
              label="Cancelar"
              color="grey-4"
              icon="close"
              class="full-width"
              @click="fecharDialogAssinatura"
            />
          </div>
          <div class="col-6">
            <q-btn
              color="green"
              icon="check"
              label="Confirmar"
              class="full-width text-weight-bold"
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
import { ref, onMounted, onUnmounted, nextTick, toRaw } from 'vue' // toRaw é usado aqui
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { doc, getDoc } from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import localforage from 'localforage'
import { gerarChecklistPdf } from 'src/utils/pdfGenerator' // IMPORTANTE: Verifica se este caminho está correto

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

// ================= 2. ESTADOS DO FORMULÁRIO (Reatividade) =================
const temAlteracoes = ref(false) // Controla se o utilizador já mexeu no formulário (útil para avisos ao sair)
const nomeMaquina = ref('') // Título principal da máquina (buscado no Firebase)
const itens = ref([]) // Lista de perguntas do checklist

const formulario = ref({
  cliente: '',
  cidade: '',
  data: new Date().toISOString().split('T')[0], // Preenche com a data atual no formato AAAA-MM-DD
  marca: '',
  modelo: '',
  serie: '',
  ano: '',
  horimetro: '',
})

// Gestão de Imagens Gerais (Fotos da Máquina)
const fotosGerais = ref({ Frente: null, Direita: null, Traseira: null, Esquerda: null })
const fotoGeralSelecionada = ref(null) // Guarda qual posição de foto está a ser tirada no momento

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
const tipoAssinaturaAtual = ref('') // 'vendedor', 'cliente' ou 'tecnico'
const nomeAssinaturaAtual = ref('')
const tituloAssinaturaAtual = ref('')
const labelNomeAssinaturaAtual = ref('')

const canvasRef = ref(null) // Referência ao elemento <canvas> no HTML
const isDrawing = ref(false) // Indica se o dedo/rato está a pressionar a tela
const hasSigned = ref(false) // Valida se algum traço foi feito no canvas
let lastX = 0
let lastY = 0

// Memoriza a largura da tela para evitar que o canvas se apague ao abrir o teclado no telemóvel
let larguraAnterior = window.innerWidth

// ================= 4. CICLO DE VIDA (Montagem e Desmontagem) =================
onMounted(async () => {
  // Escuta mudanças no tamanho da janela
  window.addEventListener('resize', handleResize)

  try {
    $q.loading.show({ message: 'A carregar checklist...' })
    await carregarPerguntas() // Busca o modelo correto no Firebase
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

/**
 * Função inteligente de Redimensionamento:
 * O teclado dos telemóveis altera a altura da janela, o que recriaria o canvas e apagaria a assinatura.
 * Esta lógica garante que o canvas SÓ é recriado se a LARGURA mudar (ex: virar o telemóvel de lado).
 */

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
  await nextTick() // Aguarda o Vue desenhar o modal na tela
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const ratio = window.devicePixelRatio || 1

  // Ajusta a resolução para ecrãs de alta densidade (Retina/Smartphones)
  canvas.width = rect.width * ratio
  canvas.height = rect.height * ratio

  const ctx = canvas.getContext('2d')
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  ctx.strokeStyle = '#1a1a1a' // Cor da "caneta"
  ctx.lineWidth = 2.5 // Espessura da linha
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}

const getPosition = (e) => {
  const rect = canvasRef.value.getBoundingClientRect()
  let clientX, clientY

  // Lida tanto com toques (mobile) quanto com cliques (desktop)
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

  // Transforma o desenho numa imagem base64
  const imagem = canvasRef.value.toDataURL('image/png')
  const imagens = { vendedor: 'vendedorImagem', cliente: 'clienteImagem', tecnico: 'tecnicoImagem' }

  assinaturas.value[imagens[tipo]] = imagem
  fecharDialogAssinatura()
  temAlteracoes.value = true
  $q.notify({ type: 'positive', message: 'Assinatura confirmada.' })
}

// ================= 7. COMUNICAÇÃO COM FIREBASE (Perguntas) =================
const carregarPerguntas = async () => {
  const tipo = route.params.tipo // Identifica qual máquina foi clicada (ex: 'trator-x')

  if (!tipo) {
    nomeMaquina.value = 'Máquina Desconhecida'
    return
  }

  try {
    const docSnap = await getDoc(doc(db, 'modelos_checklists', tipo))
    if (docSnap.exists()) {
      const dados = docSnap.data()
      nomeMaquina.value = dados.nome || tipo
      if (dados.itens && Array.isArray(dados.itens)) {
        // Mapeia os itens adicionando os campos necessários para a resposta
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

// ================= 8. LÓGICA DE FOTOS GERAIS =================
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
    fotosGerais.value[posicaoFoto] = e.target.result // Guarda imagem em Base64
    fotoGeralSelecionada.value = null
    temAlteracoes.value = true
  }
  reader.readAsDataURL(file)
  event.target.value = '' // Limpa o input
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

// ================= 9. SALVAMENTO E NAVEGAÇÃO =================
const verificarSaida = () => {
  $q.dialog({
    title: 'Atenção',
    message: 'Deseja sair? Todo o progresso deste checklist será perdido.',
    cancel: 'Não, continuar',
    ok: 'Sim, sair',
    persistent: true,
  }).onOk(() => {
    router.push('/') // Retorna à página inicial
  })
}

/**
 * Salva o checklist na memória do dispositivo.
 * O código foi desenhado para ser UNIVERSAL, lendo o setor pela URL.
 */
const salvarChecklistNoTelemovel = async () => {
  if (!formulario.value.cliente) {
    $q.notify({ type: 'warning', message: 'Preenche o nome do cliente antes de salvar.' })
    return
  }
  if (!verificarFotosGerais()) return

  try {
    $q.loading.show({ message: 'A finalizar checklist...' })

    const setor = route.params.setor || 'geral'
    const chaveUnica = `historico_${setor}`

    // 1. Criamos os dados que serão enviados para o PDF e para o localforage
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

    // 2. Geramos o PDF primeiro (baseado nos dados limpos)
    const dadosLimpos = JSON.parse(JSON.stringify(toRaw(dadosParaSalvar)))
    const arquivoPdfBase64 = await gerarChecklistPdf(dadosLimpos, true)

    // 3. Adicionamos o PDF ao objeto final
    const registoFinal = {
      ...dadosLimpos,
      pdfFisico: arquivoPdfBase64,
    }

    // 4. Salva no localforage
    let checklistsAntigos = (await localforage.getItem(chaveUnica)) || []
    checklistsAntigos.push(registoFinal)
    await localforage.setItem(chaveUnica, checklistsAntigos)

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
