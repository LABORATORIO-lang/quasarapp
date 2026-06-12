<template>
  <!-- Modal de Revisão de Pendências antes do Envio -->
  <q-dialog v-model="dialogRevisaoAberto" persistent>
    <q-card
      class="bg-grey-10 text-white"
      style="width: 500px; max-width: 95vw; border: 1px solid #f3772c"
    >
      <q-card-section class="bg-grey-9 row items-center">
        <q-icon name="report_problem" color="orange-8" size="md" class="q-mr-sm" />
        <div class="text-h6">Revisão de Itens</div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="text-body2 q-mb-md text-grey-4">
          Os itens abaixo possuem observações ou status de atenção/ruim. Deseja resolver algum antes
          do envio?
        </div>

        <q-list bordered separator class="bg-grey-9 rounded-borders">
          <q-item v-for="item in itensPendentes" :key="item.originalIndex" class="q-py-md">
            <q-item-section>
              <q-item-label class="text-weight-bold text-orange-8">{{ item.texto }}</q-item-label>
              <q-item-label caption class="text-grey-5">
                Status:
                <q-badge :color="corStatus(item.resposta)" dense>{{ item.resposta }}</q-badge>
              </q-item-label>
              <q-item-label
                v-if="item.observacao && item.observacao !== '-'"
                class="text-caption text-red-4 italic"
              >
                "{{ item.observacao }}"
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-toggle
                v-model="item.marcadoParaResolver"
                color="green-6"
                icon="check"
                label="Resolvido"
                left-label
                dark
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="between" class="q-pa-md bg-grey-9">
        <q-btn
          flat
          label="Mandar assim mesmo"
          color="grey-5"
          v-close-popup
          @click="prosseguirAposRevisao(false)"
        />
        <q-btn
          color="green-7"
          icon="done_all"
          label="Aplicar e Enviar"
          @click="prosseguirAposRevisao(true)"
        />
      </q-card-actions>
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
          style="border-radius: 12px; border: 2px dashed #ccc; overflow: hidden; position: relative"
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
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center q-gutter-sm q-mb-lg">
      <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
      <div>
        <div class="text-h5 text-weight-bold">
          {{ tipoTransferencia === 'cliente' ? 'Venda ao Cliente' : 'Transferir para Unidade' }}
        </div>
        <div class="text-caption text-grey-5">
          {{
            etapa === 'selecionar'
              ? 'Selecione a máquina do estoque'
              : 'Verifique os itens de saída'
          }}
        </div>
      </div>
    </div>

    <div v-if="etapa === 'selecionar'">
      <div v-if="carregando" class="text-center q-mt-xl">
        <q-spinner color="orange-8" size="40px" />
        <div class="text-grey-5 q-mt-sm">Carregando máquinas...</div>
      </div>

      <div v-else-if="maquinas.length === 0" class="text-center q-mt-xl">
        <q-icon name="inventory_2" size="48px" color="grey-6" />
        <div class="text-grey-5 q-mt-sm">Nenhuma máquina em estoque.</div>
      </div>

      <div v-else class="column q-gutter-sm">
        <q-card
          v-for="maq in maquinas"
          :key="maq.serie"
          clickable
          class="compact-card bg-grey-9 text-white"
          @click="selecionarMaquina(maq)"
        >
          <q-card-section class="row items-center no-wrap q-pa-sm">
            <q-avatar size="36px" color="grey-10" text-color="orange-8" class="icon-box">
              <q-icon name="agriculture" size="20px" />
            </q-avatar>
            <div class="q-ml-md col">
              <div class="text-subtitle1 text-weight-bold text-orange-8">{{ maq.modelo }}</div>
              <div class="text-caption text-grey-5">
                Série: {{ maq.serie }} — {{ maq.unidadeAtual }}
              </div>
            </div>
            <q-icon name="chevron_right" color="grey-6" size="24px" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div v-if="etapa === 'verificar'">
      <q-card class="bg-grey-9 q-mb-md" style="border: 1px solid #333; border-radius: 8px">
        <q-card-section class="q-pa-sm">
          <div class="text-subtitle1 text-weight-bold text-orange-8">
            {{ maquinaSelecionada.modelo }} — {{ maquinaSelecionada.serie }}
          </div>
          <div class="text-caption text-grey-5">
            Entrada em: {{ maquinaSelecionada.dataRecebimento }} —
            {{ maquinaSelecionada.unidadeAtual }}
          </div>
        </q-card-section>
      </q-card>

      <q-card class="bg-grey-9 q-mb-md" style="border: 1px solid #333; border-radius: 8px">
        <q-card-section class="q-gutter-y-sm">
          <q-select
            v-if="tipoTransferencia === 'unidade'"
            v-model="destino"
            :options="unidadesFiltradas"
            label="Unidade de Destino"
            dark
            outlined
            dense
            color="orange-8"
          />
          <q-input
            v-if="tipoTransferencia === 'cliente'"
            v-model="nomeCliente"
            label="Nome do Cliente"
            dark
            outlined
            dense
            color="orange-8"
          />

          <q-select
            v-if="tipoTransferencia === 'cliente'"
            v-model="tipoFrete"
            :options="[
              { label: 'Motorista Próprio', value: 'proprio' },
              { label: 'Frete Terceiro', value: 'terceiro' },
            ]"
            emit-value
            map-options
            label="Tipo de Entrega"
            dark
            outlined
            dense
            color="orange-8"
          />

          <q-select
            v-if="tipoTransferencia === 'cliente' && tipoFrete === 'proprio'"
            v-model="motoristaEntrega"
            :options="motoristas"
            option-label="nome"
            option-value="uid"
            emit-value
            map-options
            label="Selecionar Motorista"
            dark
            outlined
            dense
            color="orange-8"
            @update:model-value="preencherNomeMotorista"
          />

          <q-input
            v-if="
              tipoTransferencia === 'unidade' ||
              (tipoTransferencia === 'cliente' && tipoFrete === 'terceiro')
            "
            v-model="motoristaTransf"
            label="Nome do Motorista"
            dark
            outlined
            dense
            color="orange-8"
          />

          <q-input
            v-model="placaVeiculo"
            label="Placa do Veículo"
            dark
            outlined
            dense
            color="orange-8"
            maxlength="8"
            @update:model-value="placaVeiculo = ($event || '').toUpperCase()"
          />
        </q-card-section>
      </q-card>

      <div class="row items-center justify-between q-mb-sm">
        <div class="text-subtitle2 text-grey-5">VERIFICAÇÃO DE SAÍDA</div>
        <q-badge color="orange-8" class="text-black text-weight-bold">
          {{ itensVerificados }} / {{ totalItens }} verificados
        </q-badge>
      </div>

      <q-card class="bg-grey-9 q-mb-md" style="border: 1px solid #333; border-radius: 8px">
        <q-list separator>
          <template v-for="(item, idx) in checklistEntrada" :key="idx">
            <q-item>
              <q-item-section>
                <q-item-label class="text-white">{{ item.texto }}</q-item-label>
                <q-item-label caption>
                  <q-badge :color="corStatus(item.resposta)" class="q-mr-xs">
                    Entrada: {{ item.resposta || 'N/A' }}
                  </q-badge>
                  <span v-if="item.observacao" class="text-grey-5">{{ item.observacao }}</span>
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-checkbox
                  :model-value="verificacoes[idx]"
                  @update:model-value="validarItemAntesDeVerificar(item, idx, $event)"
                  color="orange-8"
                  dark
                  checked-icon="check_circle"
                  unchecked-icon="radio_button_unchecked"
                />
              </q-item-section>
            </q-item>
            <div class="q-px-md q-pb-sm">
              <q-input
                v-model="observacoesItens[idx]"
                label="Obs do item"
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
                { key: 'responsavel', label: 'Responsável', icon: 'engineering' },
                { key: 'motorista', label: 'Motorista / Operador', icon: 'agriculture' },
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

      <q-card class="bg-grey-9 q-mb-md" style="border: 1px solid #333; border-radius: 8px">
        <q-card-section>
          <div class="text-subtitle2 text-grey-5 q-mb-xs">OBSERVAÇÕES GERAIS</div>
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
        class="full-width q-mt-lg"
        color="orange-8"
        text-color="black"
        icon="check"
        :label="tipoTransferencia === 'cliente' ? 'Confirmar Venda' : 'Confirmar Transferência'"
        :disable="!podeConfirmar"
        size="lg"
        @click="confirmarTransferencia()"
      />

      <div v-if="!todosVerificados" class="text-caption text-center text-grey-5 q-mt-sm">
        Verifique todos os itens para liberar a confirmação
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { salvarTransferenciaPosVenda, verificarStatusServidor } from 'src/utils/ServidorApi'
import { gerarChecklistPdf } from 'src/utils/pdfGenerator'
import localforage from 'localforage'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  setDoc,
} from 'firebase/firestore'

import { db } from 'src/boot/firebase'
import { useUnidades } from 'src/composables/useUnidades'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const placaVeiculo = ref('')
const tipoTransferencia = computed(() => route.query.tipo || 'unidade')
const observacaoGeral = ref('')
const motoristas = ref([])
const motoristaEntrega = ref('')

// Estados
const etapa = ref('selecionar')
const maquinas = ref([])
const carregando = ref(false)
const maquinaSelecionada = ref(null)
const checklistEntrada = ref([])
const verificacoes = ref({})
const destino = ref('')
const nomeCliente = ref('')
const motoristaTransf = ref('')
const observacoesItens = ref({})
const { unidades, carregarUnidades } = useUnidades()
const minhaUnidade = ref('')
const nomeUsuario = ref('')
const tipoFrete = ref('proprio') // 'proprio' ou 'terceiro'

const dialogRevisaoAberto = ref(false)
const itensPendentes = ref([])
const revisaoConfirmada = ref(false)

// [BUG 4 FIX] - LIMPEZA DE CAMPOS CONFLITANTES AO ALTERAR O FRETE
watch(tipoFrete, (novoTipo) => {
  if (novoTipo === 'terceiro') {
    // Se mudou para terceiro, remove o motorista próprio selecionado
    motoristaEntrega.value = ''
  } else if (novoTipo === 'proprio') {
    // Se mudou para próprio, limpa o texto livre do motorista terceiro
    motoristaTransf.value = ''
  }
})

// Computados
const corStatus = (resposta) => {
  const map = {
    BOM: 'positive',
    ATENCAO: 'warning',
    ATENÇÃO: 'warning',
    RUIM: 'negative',
    SIM: 'positive',
    NAO: 'negative',
    NÃO: 'negative',
  }
  return map[resposta] || 'grey'
}

const totalItens = computed(() => {
  return checklistEntrada.value.length
})

const itensVerificados = computed(() => {
  return Object.values(verificacoes.value).filter((v) => v === true).length
})

const carregarMotoristas = async () => {
  try {
    const q = query(collection(db, 'usuarios'), where('perfis', 'array-contains', 'motorista'))
    const snap = await getDocs(q)
    motoristas.value = snap.docs.map((d) => ({ uid: d.id, nome: d.data().nome }))
  } catch (err) {
    console.error('Erro ao carregar motoristas:', err)
  }
}

const todosVerificados = computed(() => {
  return totalItens.value > 0 && itensVerificados.value === totalItens.value
})

const podeConfirmar = computed(() => {
  if (!todosVerificados.value) return false
  if (!assinaturas.value.responsavelNome || !assinaturas.value.responsavelImagem) return false
  if (!assinaturas.value.motoristaNome || !assinaturas.value.motoristaImagem) return false

  // Validação flexível do CPF: aceita com ou sem máscara (mínimo 11 dígitos)
  const cpfLimpo = (assinaturas.value.motoristaCpf || '').replace(/\D/g, '')
  if (cpfLimpo.length < 11) return false

  if (tipoTransferencia.value === 'cliente') return nomeCliente.value.trim() !== ''
  return destino.value !== ''
})

// Assinaturas
const assinaturas = ref({
  responsavelNome: '',
  responsavelImagem: '',
  motoristaNome: '',
  motoristaCpf: '',
  motoristaImagem: '',
})

const dialogAssinaturaAberto = ref(false)
const assinaturaAtual = ref('')
const canvasRef = ref(null)
let ctx = null
let isDrawing = false

const tituloAssinaturaAtual = computed(() => {
  return assinaturaAtual.value === 'responsavel'
    ? 'Assinatura do Responsável'
    : 'Assinatura do Motorista'
})

const abrirDialogAssinatura = (key) => {
  assinaturaAtual.value = key
  dialogAssinaturaAberto.value = true
}

const fecharDialogAssinatura = () => {
  dialogAssinaturaAberto.value = false
}

const preencherNomeMotorista = (uid) => {
  const mot = motoristas.value.find((m) => m.uid === uid)
  if (mot) {
    motoristaTransf.value = mot.nome
    assinaturas.value.motoristaNome = mot.nome // Garante a sincronia para a assinatura/PDF
  }
}

const validarItemAntesDeVerificar = (item, idx, marcado) => {
  // desmarcar não precisa validar
  if (!marcado) {
    verificacoes.value[idx] = false
    return
  }

  const obs = (item.observacao || '').trim()
  const resposta = (item.resposta || '').toUpperCase()

  const temObservacao = obs !== '' && obs !== '-'

  const statusCritico = ['RUIM', 'ATENCAO', 'ATENÇÃO', 'NAO', 'NÃO'].includes(resposta)

  if (!temObservacao && !statusCritico) {
    verificacoes.value[idx] = true
    return
  }

  let mensagem = ''

  if (temObservacao) {
    mensagem += `
Observação encontrada:

${obs}

`
  }

  if (statusCritico) {
    mensagem += `
Status de entrada: ${item.resposta}

`
  }

  $q.dialog({
    title: '⚠ Atenção',
    message: mensagem + '\nExiste algo para resolver antes de liberar esta máquina?',
    dark: true,
    persistent: true,
    ok: {
      label: 'Foi Resolvido',
      color: 'green',
    },
    cancel: {
      label: 'Enviar Assim Mesmo',
      color: 'orange',
      flat: true,
    },
  })
    .onOk(() => {
      // limpa observação
      item.observacao = '-'

      // corrige status
      if (['RUIM', 'ATENCAO', 'ATENÇÃO'].includes((item.resposta || '').toUpperCase())) {
        item.resposta = 'BOM'
      }

      if (['NAO', 'NÃO'].includes((item.resposta || '').toUpperCase())) {
        item.resposta = 'SIM'
      }

      verificacoes.value[idx] = true
    })
    .onCancel(() => {
      verificacoes.value[idx] = true
    })
}

const initCanvas = async () => {
  await nextTick()
  setTimeout(() => {
    const canvas = canvasRef.value
    if (!canvas) return
    const container = canvas.parentElement
    canvas.width = container.clientWidth
    canvas.height = container.clientHeight
    ctx = canvas.getContext('2d')
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, 100)
}

const startDrawing = (e) => {
  isDrawing = true
  ctx.beginPath()
  ctx.moveTo(e.offsetX, e.offsetY)
}

const draw = (e) => {
  if (!isDrawing) return
  ctx.lineTo(e.offsetX, e.offsetY)
  ctx.stroke()
}

const stopDrawing = () => {
  isDrawing = false
}

const startDrawingTouch = (e) => {
  e.preventDefault()
  const touch = e.touches[0]
  const rect = canvasRef.value.getBoundingClientRect()
  isDrawing = true
  ctx.beginPath()
  ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top)
}

const drawTouch = (e) => {
  e.preventDefault()
  if (!isDrawing) return
  const touch = e.touches[0]
  const rect = canvasRef.value.getBoundingClientRect()
  ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top)
  ctx.stroke()
}

const clearSignature = () => {
  const canvas = canvasRef.value
  if (canvas && ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
}

const confirmarAssinaturaDialog = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const dataUrl = canvas.toDataURL('image/png')
  assinaturas.value[assinaturaAtual.value + 'Imagem'] = dataUrl
  dialogAssinaturaAberto.value = false
}

const carregarMaquinas = async () => {
  carregando.value = true
  try {
    const querySnapshot = await getDocs(collection(db, 'maquinas'))
    const lista = []
    const sessao = await localforage.getItem('user_session')
    minhaUnidade.value = sessao?.unidade || sessao?.cidade || ''
    nomeUsuario.value = sessao?.nome || 'Usuário'

    querySnapshot.forEach((docSnap) => {
      const dados = docSnap.data()
      if (dados.status === 'em_estoque' && dados.unidadeAtual === minhaUnidade.value) {
        lista.push({ id: docSnap.id, ...dados })
      }
    })
    maquinas.value = lista
  } catch (e) {
    console.error('Erro ao carregar máquinas:', e)
    $q.notify({ type: 'negative', message: 'Erro ao carregar máquinas.' })
  } finally {
    carregando.value = false
  }
}

const unidadesFiltradas = computed(() => {
  return unidades.value.filter((u) => u !== minhaUnidade.value)
})

const selecionarMaquina = (maq) => {
  maquinaSelecionada.value = maq
  checklistEntrada.value = maq.checklistEntrada || []
  revisaoConfirmada.value = false
  verificacoes.value = {}
  checklistEntrada.value.forEach((_, idx) => {
    verificacoes.value[idx] = false
  })
  etapa.value = 'verificar'
}

const prosseguirAposRevisao = (aplicarResolucao) => {
  if (aplicarResolucao) {
    // Para cada item marcado como resolvido, limpamos a obs e status no checklist principal
    itensPendentes.value.forEach((p) => {
      if (p.marcadoParaResolver) {
        const idx = p.originalIndex
        const novoStatus = ['RUIM', 'ATENCAO', 'NAO', 'NÃO'].includes(
          checklistEntrada.value[idx].resposta,
        )
          ? checklistEntrada.value[idx].resposta.length > 3
            ? 'BOM'
            : 'SIM'
          : checklistEntrada.value[idx].resposta

        checklistEntrada.value[idx].observacao = '-'
        checklistEntrada.value[idx].resposta = novoStatus
      }
    })
  }

  dialogRevisaoAberto.value = false
  revisaoConfirmada.value = true
  confirmarTransferencia()
}

const confirmarTransferencia = async () => {
  try {
    $q.loading.show({ message: 'Processando...' })

    const serie = maquinaSelecionada.value.serie
    const dataHoje = new Date().toISOString().slice(0, 10)
    const maquinaSnap = await getDoc(doc(db, 'maquinas', serie))
    const historicoAtual = maquinaSnap.exists() ? maquinaSnap.data().historico || [] : []
    const numeroAcao = historicoAtual.length + 1
    const pdfNome = `${serie}-${numeroAcao}-transferencia`

    // Lógica de acumular observações para controle INTERNO
    const novaObsTexto = observacaoGeral.value.trim()
      ? `${nomeUsuario.value}: ${observacaoGeral.value}`
      : ''
    const obsAntiga = maquinaSelecionada.value.observacaoGeral || ''
    const observacaoAcumulada = [obsAntiga, novaObsTexto].filter(Boolean).join('\n')

    // Lógica para acumular observações nos ITENS INDIVIDUAIS
    const checklistAcumulado = checklistEntrada.value.map((item, idx) => {
      const notaDigitada = (observacoesItens.value[idx] || '').trim()
      const novaNotaItem = notaDigitada ? `${nomeUsuario.value}: ${notaDigitada}` : ''
      const notaItemAntiga = item.observacao && item.observacao !== '-' ? item.observacao : ''

      return {
        ...item,
        // No banco de dados, guardamos o histórico completo
        observacao: [notaItemAntiga, novaNotaItem].filter(Boolean).join('\n') || '-',
      }
    })

    // Para o PDF do Cliente, filtramos para mostrar apenas a última nota (sem o histórico interno)
    const checklistParaPdfCliente = checklistEntrada.value.map((item, idx) => ({
      ...item,
      observacao: observacoesItens.value[idx] || item.observacao || '-',
    }))

    // [BUG 4 ENFORCEMENT] Define dinamicamente o nome final do motorista baseado no fluxo ativo
    const motoristaFinal =
      tipoTransferencia.value === 'cliente' && tipoFrete.value === 'proprio'
        ? motoristas.value.find((m) => m.uid === motoristaEntrega.value)?.nome || ''
        : motoristaTransf.value || ''

    if (tipoTransferencia.value === 'unidade') {
      await updateDoc(doc(db, 'maquinas', serie), {
        status: 'em_transito',
        unidadeDestino: destino.value,
        observacaoGeral: observacaoAcumulada,
        checklistEntrada: checklistAcumulado,
        ultimaAtualizacao: Timestamp.now(),
        historico: arrayUnion({
          tipo: 'transferencia',
          de: maquinaSelecionada.value.unidadeAtual,
          para: destino.value,
          data: dataHoje,
          pdfNome: pdfNome,
          numero: numeroAcao,
          motorista: motoristaFinal,
          placa: placaVeiculo.value || '',
          observacaoGeral: novaObsTexto,
          observacoesItens: { ...observacoesItens.value },
          responsavel: assinaturas.value.responsavelNome || '',
        }),
      })

      await addDoc(collection(db, 'notificacoes'), {
        tipo: 'transferencia',
        serie: serie,
        modelo: maquinaSelecionada.value.modelo,
        de: maquinaSelecionada.value.unidadeAtual,
        para: destino.value,
        motorista: motoristaFinal,
        data: dataHoje,
        lida: false,
        criadaEm: Timestamp.now(),
        checklistEntrada: JSON.parse(JSON.stringify(checklistAcumulado)),
      })

      $q.notify({
        type: 'positive',
        message: `Máquina ${serie} em trânsito para ${destino.value}`,
      })
    } else {
      const token = tipoFrete.value === 'terceiro' ? serie + '-' + Date.now().toString(36) : ''
      const linkCliente = token ? `${window.location.origin}/#/verificacao/${token}` : ''

      await updateDoc(doc(db, 'maquinas', serie), {
        status: 'aguardando_entrega_cliente',
        unidadeDestino: nomeCliente.value,
        observacaoGeral: observacaoAcumulada,
        checklistEntrada: checklistAcumulado,
        ultimaAtualizacao: Timestamp.now(),
        historico: arrayUnion({
          tipo: 'venda',
          unidade: maquinaSelecionada.value.unidadeAtual,
          cliente: nomeCliente.value,
          data: dataHoje,
          motorista: motoristaFinal,
          responsavel: assinaturas.value.responsavelNome || '',
          pdfNome: pdfNome,
          numero: numeroAcao,
          observacaoGeral: observacaoGeral.value, // Para o cliente, enviamos apenas o texto limpo
          linkCliente: linkCliente,
        }),
      })

      if (tipoFrete.value === 'terceiro') {
        await setDoc(doc(db, 'entregas_cliente', token), {
          token: token,
          serie: serie,
          modelo: maquinaSelecionada.value.modelo,
          marca: maquinaSelecionada.value.marca || '',
          ano: maquinaSelecionada.value.ano || '',
          horimetro: maquinaSelecionada.value.horimetro || '',
          cliente: nomeCliente.value,
          endereco: assinaturas.value.enderecoCliente || '',
          cpfCnpj: assinaturas.value.motoristaCpf || '',
          unidadeOrigem: maquinaSelecionada.value.unidadeAtual,
          checklistEntrada: JSON.parse(JSON.stringify(checklistAcumulado)),
          motorista: motoristaFinal,
          data: dataHoje,
          criadaEm: Timestamp.now(),
          expiraEm: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pendente',
          assinaturaCliente: null,
          observacoesCliente: {},
        })

        $q.dialog({
          dark: true,
          title: '🔗 Link para o Cliente',
          message: `Envie este link para o cliente:\n\n${linkCliente}`,
          ok: { label: 'Copiar Link', color: 'orange-8' },
          cancel: { label: 'Fechar', color: 'grey-5', flat: true },
          persistent: true,
        }).onOk(() => {
          navigator.clipboard.writeText(linkCliente)
          $q.notify({ type: 'positive', message: 'Link copiado!' })
        })
      } else {
        await addDoc(collection(db, 'notificacoes'), {
          tipo: 'entrega_cliente',
          serie: serie,
          modelo: maquinaSelecionada.value.modelo,
          de: maquinaSelecionada.value.unidadeAtual,
          cliente: nomeCliente.value,
          endereco: assinaturas.value.enderecoCliente || '',
          cpfCnpj: assinaturas.value.motoristaCpf || '',
          data: dataHoje,
          lida: false,
          criadaEm: Timestamp.now(),
          checklistEntrada: JSON.parse(JSON.stringify(checklistAcumulado)),
          motorista: motoristaFinal,
          motoristaUid: motoristaEntrega.value || '',
        })
      }

      $q.notify({
        type: 'positive',
        message: `Máquina ${serie} vendida para ${nomeCliente.value}`,
      })
    }

    // Geração do PDF
    try {
      const dadosParaPdf = {
        tipoPdf: tipoTransferencia.value === 'cliente' ? 'venda' : 'transferencia_saida',
        tipo:
          tipoTransferencia.value === 'cliente'
            ? 'Venda ao Cliente'
            : 'Transferência entre Unidades',
        nomeMaquina: `${maquinaSelecionada.value.modelo} — ${maquinaSelecionada.value.serie}`,
        // Se for para cliente, o PDF sai apenas com a obs atual. Se for transferência, sai com o histórico.
        observacaoGeral:
          tipoTransferencia.value === 'cliente' ? observacaoGeral.value : observacaoAcumulada,
        dadosFormulario: {
          serie: maquinaSelecionada.value.serie,
          modelo: maquinaSelecionada.value.modelo,
          unidadeAtual: maquinaSelecionada.value.unidadeAtual,
          destino: tipoTransferencia.value === 'cliente' ? nomeCliente.value : destino.value,
          unidadeDestino: destino.value,
          cliente: tipoTransferencia.value === 'cliente' ? nomeCliente.value : '',
          horimetro: maquinaSelecionada.value.horimetro || '',
          marca: maquinaSelecionada.value.marca || '',
          ano: maquinaSelecionada.value.ano || '',
          motorista: motoristaFinal,
          placa: placaVeiculo.value || '',
        },
        // Se for venda, o PDF vai limpo para o cliente. Se for transferência, vai com histórico.
        respostasChecklist:
          tipoTransferencia.value === 'cliente' ? checklistParaPdfCliente : checklistAcumulado,
        assinaturas: {
          ...assinaturas.value,
          motoristaNome: motoristaFinal, // Alinha o nome no PDF gerado
        },
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
          maquinaSelecionada.value.unidadeAtual,
          pdfNome,
          base64Limpo,
        )
        console.log('✅ PDF salvo no servidor.')
      }
    } catch (pdfError) {
      console.warn('⚠️ Erro no PDF de transferência:', pdfError.message)
    }

    router.push('/inicio/pos-venda/maquinas/estoque')
  } catch (error) {
    // Unificamos os dois blocos em um único catch robusto
    console.error('Erro crítico no processo de transferência/venda:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao processar transferência ou venda. Verifique a conexão.',
    })
  } finally {
    // Esse bloco sempre roda, garantindo que o loading suma da tela
    $q.loading.hide()
  }
}

onMounted(async () => {
  await carregarUnidades()
  await carregarMaquinas()
  await carregarMotoristas()
})
</script>

<style scoped>
.compact-card {
  border: 1px solid #333;
  border-radius: 8px;
  transition: border-color 0.2s;
}
.compact-card:hover {
  border-color: #ff9800;
}
.icon-box {
  border: 1px solid #ff9800;
}
</style>
