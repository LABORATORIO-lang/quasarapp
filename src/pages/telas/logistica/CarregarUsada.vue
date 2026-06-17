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
              <div class="text-caption text-grey-5 q-mb-sm">Série: {{ d.serie }}</div>
              <div class="text-caption text-grey-4 q-mt-xs">
                <q-icon name="person" size="14px" color="grey-5" class="q-mr-xs" />
                Cliente:
                <span class="text-white text-weight-bold">{{ d.cliente || 'Não informado' }}</span>
              </div>
              <div class="text-caption text-grey-4 q-mt-xs">
                <q-icon name="place" size="14px" color="grey-5" class="q-mr-xs" />
                Destino: <span class="text-orange-4 text-weight-bold">{{ d.unidadeDestino }}</span>
              </div>
            </div>
            <div class="column items-end">
              <q-badge
                color="purple-6"
                rounded
                class="q-px-sm q-py-xs text-white text-weight-bold q-mb-sm"
              >
                Aguardando Carga
              </q-badge>
              <div class="text-caption text-grey-5" style="font-size: 11px">
                Origem: {{ d.unidadeOrigem }}
              </div>
            </div>
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

    <q-dialog
      v-model="dialogDetalheAberto"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-10 text-white">
        <q-card-section class="bg-grey-9 row items-center justify-between">
          <div>
            <div class="text-h6 text-orange-8">{{ maquinaSelecionada?.modelo }}</div>
            <div class="text-caption text-grey-5">Cliente: {{ maquinaSelecionada?.cliente }}</div>
          </div>
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
          <div class="text-caption text-grey-5 q-mb-md">
            Itens obrigatórios avaliados pelo vendedor:
          </div>
          <q-list separator>
            <q-item v-for="item in itensObrigatorios" :key="item.originalIndex">
              <q-item-section>
                <q-item-label class="text-white">{{ item.texto }}</q-item-label>
                <q-item-label caption v-if="item.observacao">
                  <span class="text-grey-5">{{ item.observacao }}</span>
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge :color="corStatus(item.resposta)">{{ item.resposta || 'N/A' }}</q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

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
            <div class="text-caption text-white">
              {{ maquinaSelecionada?.modelo }} — {{ maquinaSelecionada?.serie }}
            </div>
            <div class="text-caption text-orange-4">
              Cliente: {{ maquinaSelecionada?.cliente || 'Não informado' }} | Destino:
              {{ maquinaSelecionada?.unidadeDestino }}
            </div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" color="grey-5" @click="dialogCargaAberto = false" />
        </q-card-section>

        <q-card-section class="col q-pa-md scroll">
          <div class="text-subtitle2 text-grey-5 q-mb-sm">FOTOS DO CARREGAMENTO (OBRIGATÓRIO)</div>
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
                      <q-icon v-else name="add_a_photo" color="purple-4" size="md" />
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
            id="file-input-motorista"
            style="display: none"
            @change="processarFotoGeral"
          />

          <div class="text-subtitle2 text-grey-5 q-mb-sm">ITENS OBRIGATÓRIOS DO CHECKLIST</div>
          <q-card class="bg-grey-9 q-mb-lg" style="border: 1px solid #333; border-radius: 8px">
            <q-list separator>
              <template v-for="item in itensObrigatorios" :key="item.originalIndex">
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
                  </q-item-section>
                  <q-item-section side>
                    <q-checkbox
                      v-model="itensConferidos[item.originalIndex]"
                      :true-value="true"
                      :false-value="false"
                      color="purple-6"
                      dark
                    />
                  </q-item-section>
                </q-item>

                <div class="q-px-md q-pb-sm">
                  <q-input
                    v-model="observacoesMotorista[item.originalIndex]"
                    label="Observação do motorista (opcional)"
                    dark
                    dense
                    filled
                    color="purple-6"
                    bg-color="grey-10"
                  />
                </div>
                <q-separator dark />
              </template>
            </q-list>
          </q-card>

<<<<<<< HEAD
          <div class="text-subtitle2 text-grey-5 q-mb-sm">
            DADOS DO CLIENTE / RESPONSÁVEL NO LOCAL
          </div>
          <q-card class="bg-grey-10 q-mb-lg" style="border-radius: 8px; border: 1px solid #555">
            <q-card-section class="q-pa-md">
              <q-input
                v-model="nomeResponsavelCliente"
                label="Nome Completo do Responsável"
                dark
                filled
                dense
                color="purple-6"
                class="q-mb-md"
              />
              <q-input
                v-model="cpfResponsavelCliente"
                label="CPF do Responsável"
                mask="###.###.###-##"
                dark
                filled
                dense
                color="purple-6"
                class="q-mb-md"
              />

              <div class="flex justify-between items-center q-mb-sm">
                <div class="text-caption text-white flex items-center">
                  <q-icon name="draw" class="q-mr-sm text-purple-6" size="sm" />
                  Assinatura do Cliente
=======
          <!-- Dados do Responsável pela entrega -->
          <div class="text-subtitle2 text-grey-5 q-mb-sm">DADOS DO RESPONSÁVEL PELA ENTREGA</div>
          <q-card class="bg-grey-9 q-mb-md" style="border: 1px solid #333; border-radius: 8px">
            <q-card-section class="q-gutter-y-sm">
              <q-input
                v-model="nomeResponsavel"
                label="Nome do Responsável"
                dark
                filled
                dense
                color="purple-6"
                bg-color="grey-10"
              />
              <q-input
                v-model="cpfResponsavel"
                label="CPF do Responsável"
                dark
                filled
                dense
                color="purple-6"
                bg-color="grey-10"
                mask="###.###.###-##"
                unmasked-value
                :rules="[(val) => !val || validarCPF(val) || 'CPF inválido']"
                lazy-rules
              />
            </q-card-section>
          </q-card>

          <div class="text-subtitle2 text-grey-5 q-mb-sm">ASSINATURA DO RESPONSÁVEL</div>
          <q-card class="bg-grey-10" style="border-radius: 8px; border: 1px solid #555">
            <q-card-section class="q-pa-md">
              <div class="flex justify-between items-center q-mb-md">
                <div class="text-subtitle2 text-weight-bold text-white flex items-center">
                  <q-icon name="person" class="q-mr-sm text-purple-6" size="sm" />
                  Responsável
>>>>>>> 2fed1eb04798d26c1817777495e31ab2548687e0
                </div>
                <q-badge
                  :color="assinadoCliente ? 'green-8' : 'grey-8'"
                  rounded
                  class="q-px-sm q-py-xs"
                >
                  <q-icon
                    :name="assinadoCliente ? 'check_circle' : 'pending'"
                    class="q-mr-xs"
                    size="14px"
                  />
                  {{ assinadoCliente ? 'Assinado' : 'Pendente' }}
                </q-badge>
              </div>

              <q-btn
                :color="assinadoCliente ? 'grey-8' : 'purple-6'"
                :icon="assinadoCliente ? 'draw' : 'gesture'"
                :label="
                  assinadoCliente ? 'Refazer Assinatura Cliente' : 'Coletar Assinatura Cliente'
                "
                class="full-width text-weight-bold"
                unelevated
                style="border-radius: 6px"
                @click="abrirDialogAssinatura('cliente')"
              />
            </q-card-section>
          </q-card>

          <div class="text-subtitle2 text-grey-5 q-mb-sm">ASSINATURA DO MOTORISTA</div>
          <q-card class="bg-grey-10 q-mb-lg" style="border-radius: 8px; border: 1px solid #555">
            <q-card-section class="q-pa-md">
              <div class="flex justify-between items-center q-mb-sm">
                <div class="text-caption text-white flex items-center">
                  <q-icon name="local_shipping" class="q-mr-sm text-purple-6" size="sm" />
                  Sua Assinatura
                </div>
                <q-badge
                  :color="assinadoMotorista ? 'green-8' : 'grey-8'"
                  rounded
                  class="q-px-sm q-py-xs"
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
                :color="assinadoMotorista ? 'grey-8' : 'purple-6'"
                :icon="assinadoMotorista ? 'draw' : 'gesture'"
                :label="
                  assinadoMotorista
                    ? 'Refazer Assinatura Motorista'
                    : 'Coletar Assinatura Motorista'
                "
                class="full-width text-weight-bold"
                unelevated
                style="border-radius: 6px"
                @click="abrirDialogAssinatura('motorista')"
              />
            </q-card-section>
          </q-card>
        </q-card-section>

        <q-card-section class="col-shrink bg-grey-9 shadow-up-2 q-pa-md">
          <q-btn
            color="green-7"
            text-color="white"
            icon="check_circle"
            label="Confirmar Carregamento e Gerar PDF"
            class="full-width"
            size="lg"
            :loading="salvando"
            :disable="!podeConfirmar"
            @click="confirmarCarregamento"
          />
          <div v-if="!podeConfirmar" class="text-caption text-center text-grey-5 q-mt-sm">
            Tire as 4 fotos, preencha os dados e colete as assinaturas.
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

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
<<<<<<< HEAD
                  {{
                    tipoAssinaturaAtual === 'motorista'
                      ? 'Assinatura do Motorista'
                      : 'Assinatura do Cliente'
                  }}
=======
                  Assinatura do Responsável
>>>>>>> 2fed1eb04798d26c1817777495e31ab2548687e0
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
              ><q-tooltip>Limpar assinatura</q-tooltip></q-btn
            >
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
import localforage from 'localforage'

// IMPORTS NECESSÁRIOS PARA O PDF E SERVIDOR LOCAL
import { gerarChecklistPdf } from 'src/utils/pdfGenerator'
import { verificarStatusServidor, salvarChecklistLogistica } from 'src/utils/ServidorApi'

const $q = useQuasar()

const carregando = ref(true)
const despachos = ref([])
const dialogDetalheAberto = ref(false)
const dialogCargaAberto = ref(false)
const dialogAssinaturaAberto = ref(false)
const maquinaSelecionada = ref(null)
const itensConferidos = ref({})
const observacoesMotorista = ref({})
const salvando = ref(false)

// Estados de Fotos Gerais
const fotosGerais = ref({ Frente: null, Direita: null, Traseira: null, Esquerda: null })
const fotoGeralSelecionada = ref(null)

// Estados do Cliente
const nomeResponsavelCliente = ref('')
const cpfResponsavelCliente = ref('')
const assinadoCliente = ref(false)
const assinaturaClienteImagem = ref(null)

// Estados do Motorista
const assinadoMotorista = ref(false)
const assinaturaMotoristaImagem = ref(null)

// Controle do Canvas
const tipoAssinaturaAtual = ref('')
const canvasRef = ref(null)
const isDrawing = ref(false)
let lastX = 0
let lastY = 0
<<<<<<< HEAD

const itensObrigatorios = computed(() => {
  if (!maquinaSelecionada.value?.checklistAvaliacao) return []
  return maquinaSelecionada.value.checklistAvaliacao
    .map((item, index) => ({ ...item, originalIndex: index }))
    .filter((item) => item.obrigatorio === true)
})

const podeConfirmar = computed(() => {
  const lista = itensObrigatorios.value

  const dadosClienteOk =
    nomeResponsavelCliente.value.trim() !== '' &&
    (cpfResponsavelCliente.value || '').replace(/\D/g, '').length === 11
  const assinaturasOk = assinadoMotorista.value && assinadoCliente.value

  // VALIDA SE AS 4 FOTOS FORAM TIRADAS
  const fotosOk = Object.values(fotosGerais.value).every((foto) => foto !== null)

  let todosConferidos = true
  if (lista.length > 0) {
    todosConferidos = lista.every((item) => itensConferidos.value[item.originalIndex] === true)
  }

  return dadosClienteOk && assinaturasOk && fotosOk && todosConferidos
=======
const assinaturaImagem = ref(null)
const nomeResponsavel = ref('')
const cpfResponsavel = ref('')

const podeConfirmar = computed(() => {
  const lista = maquinaSelecionada.value?.checklistAvaliacao || []
  const todosConferidos = lista.every((_, idx) => itensConferidos.value[idx] === true)
  const docOk = validarCPF(cpfResponsavel.value)
  const nomeOk = nomeResponsavel.value.trim().length > 2
  return assinado.value && todosConferidos && nomeOk && docOk
>>>>>>> 2fed1eb04798d26c1817777495e31ab2548687e0
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

// --- FUNÇÕES DE CÂMERA ---
const abrirCameraFotoGeral = (posicao) => {
  fotoGeralSelecionada.value = posicao
  document.getElementById('file-input-motorista')?.click()
}

const processarFotoGeral = (event) => {
  const file = event.target.files[0]
  const posicaoFoto = fotoGeralSelecionada.value
  if (!file || !posicaoFoto) return

  const reader = new FileReader()
  reader.onload = (e) => {
    fotosGerais.value[posicaoFoto] = e.target.result
    fotoGeralSelecionada.value = null
  }
  reader.readAsDataURL(file)
  event.target.value = ''
}

const removerFotoGeral = (posicao) => {
  fotosGerais.value[posicao] = null
}

// --- BUSCAS E DIALOGS ---
const buscarDespachos = async () => {
  carregando.value = true
  try {
    // Aguarda o Firebase Auth inicializar se necessário
    const auth = getAuth()
    let uid = auth.currentUser?.uid

    if (!uid) {
      // Tenta recuperar da sessão local se estiver offline ou em transição
      const sessao = await localforage.getItem('user_session')
      uid = sessao?.uid
    }

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

  // Garantimos que o objeto comece VAZIO.
  // Sem chaves definidas, o Quasar entende que todos os checkboxes estão falsos.
  itensConferidos.value = {}

  observacoesMotorista.value = {}
<<<<<<< HEAD

  // Reseta fotos e assinaturas
  fotosGerais.value = { Frente: null, Direita: null, Traseira: null, Esquerda: null }
  nomeResponsavelCliente.value = ''
  cpfResponsavelCliente.value = ''
  assinadoCliente.value = false
  assinaturaClienteImagem.value = null
  assinadoMotorista.value = false
  assinaturaMotoristaImagem.value = null

=======
  assinado.value = false
  assinaturaImagem.value = null
  nomeResponsavel.value = ''
  cpfResponsavel.value = ''
>>>>>>> 2fed1eb04798d26c1817777495e31ab2548687e0
  dialogCargaAberto.value = true
}

const abrirDialogAssinatura = (tipo) => {
  tipoAssinaturaAtual.value = tipo
  dialogAssinaturaAberto.value = true
}

// --- FUNÇÕES DO CANVAS (Assinatura) ---
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
  else assinadoCliente.value = true
}

const limparAssinatura = () => {
  const ctx = canvasRef.value.getContext('2d')
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  if (tipoAssinaturaAtual.value === 'motorista') {
    assinadoMotorista.value = false
    assinaturaMotoristaImagem.value = null
  } else {
    assinadoCliente.value = false
    assinaturaClienteImagem.value = null
  }
}

const confirmarAssinatura = () => {
  const assinado =
    tipoAssinaturaAtual.value === 'motorista' ? assinadoMotorista.value : assinadoCliente.value
  if (!assinado) {
    $q.notify({ type: 'warning', message: 'Faça a assinatura antes de confirmar.' })
    return
  }
  const imagemBase64 = canvasRef.value.toDataURL('image/png')
  if (tipoAssinaturaAtual.value === 'motorista') assinaturaMotoristaImagem.value = imagemBase64
  else assinaturaClienteImagem.value = imagemBase64

  dialogAssinaturaAberto.value = false
  $q.notify({ type: 'positive', message: 'Assinatura salva.' })
}

// --- CONFIRMAÇÃO FINAL, GERAÇÃO DO PDF E SALVAMENTO ---
const confirmarCarregamento = async () => {
  salvando.value = true
  try {
    const mq = maquinaSelecionada.value
    const agora = new Date()

    // 1. MONTAR O OBJETO PARA O PDF
    // O seu pdfGenerator.js costuma ler 'dadosFormulario', 'respostasChecklist', 'assinaturas', etc.
    const dadosParaPdf = {
      id: mq.id,
      tipoPdf: 'carregamento_motorista',
      nomeMaquina: mq.modelo,
      dadosFormulario: {
        serie: mq.serie,
        marca: mq.marca || '',
        ano: mq.ano || '',
        cliente: nomeResponsavelCliente.value,
        unidadeOrigem: mq.unidadeOrigem,
        unidadeDestino: mq.unidadeDestino,
      },
      // Passamos apenas os itens que o motorista viu e conferiu
      respostasChecklist: itensObrigatorios.value.map((item) => ({
        texto: item.texto,
        resposta: itensConferidos.value[item.originalIndex] ? 'CONFERIDO' : 'FALTOU',
        observacao: observacoesMotorista.value[item.originalIndex] || '',
      })),
      assinaturas: {
        // Adaptamos as chaves para baterem com o PDF (responsavel/motorista)
        responsavelNome: nomeResponsavelCliente.value,
        responsavelCpf: cpfResponsavelCliente.value,
        responsavelImagem: assinaturaClienteImagem.value,
        motoristaNome: mq.motoristaNome || 'Motorista',
        motoristaImagem: assinaturaMotoristaImagem.value,
      },
      fotosGerais: fotosGerais.value,
      dataConclusao: agora.toLocaleDateString('pt-BR'),
      dataHoraFormatada:
        agora.toLocaleDateString('pt-BR') +
        ' às ' +
        agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      unidadeUsuario: mq.unidadeOrigem, // Para a logo correta
    }

    // 2. GERAR O PDF EM BASE64
    const arquivoPdfBase64 = await gerarChecklistPdf(dadosParaPdf, true)
    const base64Limpo = arquivoPdfBase64.includes(',')
      ? arquivoPdfBase64.split(',')[1]
      : arquivoPdfBase64
    const nomeArquivoPDF = `${mq.serie}-carregamento-${Date.now()}`

    // 3. ENVIAR PARA O SERVIDOR LOCAL (Pasta da unidade de Origem)
    try {
      const servidorOnline = await verificarStatusServidor()
      if (servidorOnline.online) {
        // Você precisará ter essa função no ServidorApi.js (Pode ser idêntica a salvarChecklistPosVenda)
        await salvarChecklistLogistica(mq.unidadeOrigem, nomeArquivoPDF, base64Limpo)
        console.log('✅ PDF de carregamento enviado ao servidor.')
      }
    } catch (errServidor) {
      console.warn('Servidor local offline:', errServidor.message)
      // Aqui você pode criar a lógica de Fila Offline depois, se necessário
    }

    // 4. ATUALIZAR O FIRESTORE (Apenas Metadados e o nome do PDF gerado)
    const docRef = doc(db, 'despachos_usados', mq.id)
    await updateDoc(docRef, {
      status: 'carregado',
      dataCarregamento: Timestamp.now(),
<<<<<<< HEAD
=======
      nomeResponsavel: nomeResponsavel.value,
      cpfResponsavel: cpfResponsavel.value,
>>>>>>> 2fed1eb04798d26c1817777495e31ab2548687e0
      observacoesMotorista: { ...observacoesMotorista.value },
      itensConferidos: { ...itensConferidos.value },
      nomeResponsavelCliente: nomeResponsavelCliente.value,
      cpfResponsavelCliente: cpfResponsavelCliente.value,
      // Guarda o nome do PDF gerado para depois buscar no histórico
      pdfCarregamentoNome: nomeArquivoPDF,

      // OPTATIVO: Se não quiser salvar imagens base64 no Firebase para poupar espaço,
      // basta remover as 3 linhas abaixo. Como o PDF já está no servidor, você não precisa delas aqui.
      assinaturaMotoristaImagem: assinaturaMotoristaImagem.value,
      assinaturaClienteImagem: assinaturaClienteImagem.value,
      fotosCarregamento: fotosGerais.value,
    })

    $q.notify({ type: 'positive', message: 'Carregamento confirmado e PDF gerado com sucesso!' })
    dialogCargaAberto.value = false
    await buscarDespachos()
  } catch (e) {
    console.error('Erro ao confirmar carregamento:', e)
    $q.notify({ type: 'negative', message: 'Erro ao confirmar carregamento.' })
  } finally {
    salvando.value = false
  }
}

const validarCPF = (cpf) => {
  if (!cpf) return false
  const str = cpf.replace(/\D/g, '')
  if (str.length !== 11 || /^(\d)\1{10}$/.test(str)) return false

  let soma = 0
  let resto

  for (let i = 1; i <= 9; i++) {
    soma += parseInt(str.substring(i - 1, i), 10) * (11 - i)
  }

  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(str.substring(9, 10), 10)) return false

  soma = 0
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(str.substring(i - 1, i), 10) * (12 - i)
  }

  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(str.substring(10, 11), 10)) return false

  return true
}

onMounted(buscarDespachos)
</script>

<style scoped>
.signature-container {
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
}
</style>
