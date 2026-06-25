<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center q-gutter-sm q-mb-lg">
      <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
      <div>
        <div class="text-h5 text-weight-bold">Confirmar Entrega ao Cliente</div>
        <div class="text-caption text-grey-5">Verifique os dados e colete as assinaturas</div>
      </div>
    </div>

    <div v-if="carregando" class="text-center q-mt-xl">
      <q-spinner color="orange-8" size="40px" />
      <div class="text-grey-5 q-mt-sm">Carregando...</div>
    </div>

    <div v-else-if="!notificacao" class="text-center q-mt-xl">
      <q-icon name="error_outline" size="64px" color="red-5" />
      <div class="text-h6 text-red-5 q-mt-md">Nenhuma entrega pendente encontrada.</div>
    </div>

    <div v-else>
      <q-card class="bg-grey-9 q-mb-md" style="border: 1px solid #ff9800; border-radius: 8px">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold text-orange-8 q-mb-sm">Dados da Máquina</div>
          <div class="text-caption text-grey-4">
            Modelo: <strong class="text-white">{{ notificacao.modelo }}</strong>
          </div>
          <div class="text-caption text-grey-4">
            Série: <strong class="text-white">{{ notificacao.serie }}</strong>
          </div>
          <div v-if="notificacao.marca" class="text-caption text-grey-4">
            Marca: <strong class="text-white">{{ notificacao.marca }}</strong>
          </div>
          <div v-if="notificacao.ano" class="text-caption text-grey-4">
            Ano: <strong class="text-white">{{ notificacao.ano }}</strong>
          </div>
          <div v-if="notificacao.horimetro" class="text-caption text-grey-4">
            Horímetro: <strong class="text-white">{{ notificacao.horimetro }}</strong>
          </div>
          <div class="text-caption text-grey-4 q-mt-xs">
            Cliente: <strong class="text-white">{{ notificacao.cliente }}</strong>
          </div>
          <div v-if="notificacao.endereco" class="text-caption text-grey-4">
            Endereço: <strong class="text-white">{{ notificacao.endereco }}</strong>
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
          <template v-for="(item, idx) in checklist" :key="idx">
            <q-item>
              <q-item-section>
                <q-item-label class="text-white">{{ item.texto }}</q-item-label>
                <q-item-label caption>
                  <q-badge :color="corStatus(item.resposta)" class="q-mr-xs">
                    Entrada: {{ item.resposta || 'N/A' }}
                  </q-badge>
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-checkbox
                  v-model="respostasCliente[idx]"
                  :true-value="respostaPositiva(item.resposta)"
                  :false-value="''"
                  color="orange-8"
                  dark
                  checked-icon="check_circle"
                  unchecked-icon="radio_button_unchecked"
                />
              </q-item-section>
            </q-item>
            <div class="q-px-md q-pb-sm">
              <q-input
                v-model="observacoesCliente[idx]"
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
            v-model="cpfRecebedor"
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

      <div class="text-subtitle2 text-weight-bold text-uppercase q-mb-sm q-ml-xs q-mt-lg">
        Assinatura do Cliente
      </div>
      <q-card
        class="bg-grey-10"
        style="border-radius: 8px; border: 1px solid #555"
        :style="assinado ? 'border-color: #4caf50; box-shadow: 0 0 8px rgba(76, 175, 80, 0.2)' : ''"
      >
        <q-card-section class="q-pa-md">
          <div class="flex justify-between items-center q-mb-md">
            <div class="text-subtitle2 text-weight-bold text-white flex items-center">
              <q-icon name="person" class="q-mr-sm text-orange-8" size="sm" /> Cliente
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

      <div class="text-subtitle2 text-weight-bold text-uppercase q-mb-sm q-ml-xs q-mt-lg">
        Assinatura do Motorista
      </div>
      <q-card
        class="bg-grey-10"
        style="border-radius: 8px; border: 1px solid #555"
        :style="
          assinadoMotorista
            ? 'border-color: #4caf50; box-shadow: 0 0 8px rgba(76, 175, 80, 0.2)'
            : ''
        "
      >
        <q-card-section class="q-pa-md">
          <div class="flex justify-between items-center q-mb-md">
            <div class="text-subtitle2 text-weight-bold text-white flex items-center">
              <q-icon name="local_shipping" class="q-mr-sm text-orange-8" size="sm" /> Motorista
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
                    Assinatura do {{ assinaturaAtual === 'cliente' ? 'Cliente' : 'Motorista' }}
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
        label="Confirmar Entrega"
        size="lg"
        :loading="salvando"
        :disable="!podeConfirmar"
        @click="confirmarEntrega"
      />
      <div v-if="!podeConfirmar" class="text-caption text-center text-grey-5 q-mt-sm">
        Verifique todos os itens, preencha nome, CPF e as duas assinaturas para confirmar
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { doc, getDoc, updateDoc, Timestamp, arrayUnion } from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import localforage from 'localforage'
import { gerarChecklistPdf } from 'src/utils/pdfGenerator'
import { salvarTransferenciaPosVenda, verificarStatusServidor } from 'src/utils/ServidorApi'

const $q = useQuasar()
const router = useRouter()

const carregando = ref(true)
const salvando = ref(false)
const notificacao = ref(null)
const notificacaoId = ref('')
const checklist = ref([])
const observacoesCliente = ref({})
const respostasCliente = ref({})
const nomeRecebedor = ref('')
const cpfRecebedor = ref('')
const observacaoGeral = ref('')
const assinado = ref(false)
const assinadoMotorista = ref(false)
const assinaturaImagem = ref(null)
const assinaturaImagemMotorista = ref(null)
const dialogAssinaturaAberto = ref(false)
const assinaturaAtual = ref('cliente')

const canvasRef = ref(null)
const isDrawing = ref(false)
let lastX = 0
let lastY = 0

const totalItens = computed(() => checklist.value.length)
const itensVerificados = computed(() => {
  return Object.values(respostasCliente.value).filter((v) => v && v !== '').length
})

const podeConfirmar = computed(() => {
  const nomeOk = nomeRecebedor.value.trim().length > 2
  const cpfOk = cpfRecebedor.value.replace(/\D/g, '').length === 11
  const assinaClienteOk = assinado.value
  const assinaMotoristaOk = assinadoMotorista.value
  const todosRespondidos = checklist.value.every((_, idx) => {
    const r = (respostasCliente.value[idx] || '').toString().trim()
    return r !== ''
  })
  return nomeOk && cpfOk && assinaClienteOk && assinaMotoristaOk && todosRespondidos
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

const respostaPositiva = (respostaEntrada) => {
  const resp = (respostaEntrada || '').toUpperCase()
  if (['BOM', 'ATENCAO', 'ATENÇÃO', 'RUIM'].includes(resp)) return 'BOM'
  if (['OK', 'FALTA'].includes(resp)) return 'OK'
  return 'SIM'
}

onMounted(async () => {
  try {
    const entregaPendente = await localforage.getItem('entrega_cliente_pendente')
    if (!entregaPendente || !entregaPendente.id) {
      $q.notify({ type: 'warning', message: 'Nenhuma entrega pendente.' })
      router.push('/inicio/logistica/entregas')
      return
    }

    notificacaoId.value = entregaPendente.id
    const snap = await getDoc(doc(db, 'notificacoes', entregaPendente.id))
    if (!snap.exists()) {
      $q.notify({ type: 'warning', message: 'Entrega não encontrada.' })
      router.push('/inicio/logistica/entregas')
      return
    }

    const dados = snap.data()
    notificacao.value = dados
    checklist.value = dados.checklistEntrada || []

    checklist.value.forEach((_, idx) => {
      respostasCliente.value[idx] = ''
      observacoesCliente.value[idx] = ''
    })

    if (dados.cliente) nomeRecebedor.value = dados.cliente

    await nextTick()
    initCanvas()
  } catch (e) {
    console.error('Erro ao carregar entrega:', e)
    $q.notify({ type: 'negative', message: 'Erro ao carregar entrega.' })
  } finally {
    carregando.value = false
  }
})

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

const abrirDialogAssinatura = (quem) => {
  assinaturaAtual.value = quem
  dialogAssinaturaAberto.value = true
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

const confirmarEntrega = async () => {
  if (!podeConfirmar.value) return

  salvando.value = true
  try {
    const n = notificacao.value
    const serie = n.serie
    const dataHoje = new Date().toISOString().slice(0, 10)

    const novaObsTexto = observacaoGeral.value.trim()
      ? `${nomeRecebedor.value}: ${observacaoGeral.value}`
      : ''

    const checklistAtualizado = checklist.value.map((item, idx) => {
      const nota = (observacoesCliente.value[idx] || '').trim()
      return {
        ...item,
        observacao: nota || item.observacao || '-',
      }
    })

    await updateDoc(doc(db, 'notificacoes', notificacaoId.value), {
      lida: true,
      status: 'entregue',
      nomeRecebedor: nomeRecebedor.value,
      cpfRecebedor: cpfRecebedor.value,
      assinaturaCliente: assinaturaImagem.value,
      assinaturaMotorista: assinaturaImagemMotorista.value,
      observacoesCliente: { ...observacoesCliente.value },
      respostasCliente: { ...respostasCliente.value },
      observacaoGeral: novaObsTexto,
      dataEntrega: Timestamp.now(),
    })

    const maquinaRef = doc(db, 'maquinas', serie)
    const maquinaSnap = await getDoc(maquinaRef)
    const historicoAtual = maquinaSnap.exists() ? maquinaSnap.data().historico || [] : []
    const numeroAcao = historicoAtual.length + 1
    const pdfNome = `${serie}-${numeroAcao}-entrega-cliente`

    await updateDoc(maquinaRef, {
      status: 'entregue',
      observacaoGeral: novaObsTexto,
      checklistEntrada: checklistAtualizado,
      ultimaAtualizacao: Timestamp.now(),
      historico: arrayUnion({
        tipo: 'entrega_cliente',
        cliente: nomeRecebedor.value,
        unidade: n.de || '',
        data: dataHoje,
        responsavel: n.motorista || '',
        pdfNome: pdfNome,
        numero: numeroAcao,
        observacaoGeral: novaObsTexto,
      }),
    })

    try {
      const dadosParaPdf = {
        tipoPdf: 'entrega_cliente',
        nomeMaquina: `${n.modelo} — ${n.serie}`,
        observacaoGeral: novaObsTexto,
        dadosFormulario: {
          serie: n.serie,
          modelo: n.modelo,
          marca: n.marca || '',
          ano: n.ano || '',
          horimetro: n.horimetro || '',
          unidadeAtual: n.de || '',
          cliente: nomeRecebedor.value,
        },
        respostasChecklist: checklist.value.map((item, idx) => ({
          texto: item.texto,
          resposta: item.resposta,
          respostaCliente: respostasCliente.value[idx] || '-',
          observacao: observacoesCliente.value[idx] || item.observacao || '-',
        })),
        assinaturas: {
          responsavelNome: nomeRecebedor.value,
          responsavelImagem: assinaturaImagem.value,
          responsavelCpf: cpfRecebedor.value,
          motoristaNome: n.motorista || 'Motorista',
          motoristaImagem: assinaturaImagemMotorista.value,
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
        await salvarTransferenciaPosVenda(n.de || 'Geral', pdfNome, base64Limpo)
        console.log('✅ PDF de entrega gerado e salvo no servidor.')
      }
    } catch (pdfError) {
      console.warn('⚠️ Erro ao gerar PDF de entrega:', pdfError.message)
    }

    await localforage.removeItem('entrega_cliente_pendente')
    $q.notify({ type: 'positive', message: 'Entrega confirmada com sucesso!' })
    router.push('/inicio/logistica/entregas')
  } catch (e) {
    console.error('Erro ao confirmar entrega:', e)
    $q.notify({ type: 'negative', message: 'Erro ao confirmar entrega.' })
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
.signature-container {
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
}
</style>
