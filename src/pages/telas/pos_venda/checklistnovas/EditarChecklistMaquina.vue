<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center q-gutter-sm q-mb-lg">
      <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
      <div>
        <div class="text-h5 text-weight-bold">Editar Checklist</div>
        <div class="text-caption text-grey-5">{{ serie }} — {{ modelo }}</div>
      </div>
    </div>

    <div v-if="carregando" class="text-center q-mt-xl">
      <q-spinner color="orange-8" size="40px" />
    </div>

    <div v-else-if="itens.length === 0" class="text-center q-mt-xl">
      <q-icon name="playlist_remove" size="48px" color="grey-6" />
      <div class="text-grey-5 q-mt-sm">Nenhum checklist encontrado para esta máquina.</div>
    </div>

    <div v-else class="column q-gutter-md">
      <!-- DADOS DA MÁQUINA -->
      <div class="text-subtitle2 text-weight-bold text-uppercase q-mb-sm q-ml-xs">
        Dados da Máquina
      </div>
      <q-card class="bg-grey-9" style="border-radius: 8px; border: 1px solid #424242">
        <q-card-section class="q-gutter-y-md">
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <q-input
                v-model="formulario.serie"
                label="Nº de Série"
                dark
                outlined
                dense
                color="orange-8"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="formulario.modelo"
                label="Modelo"
                dark
                outlined
                dense
                color="orange-8"
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
              />
            </div>
            <div class="col-6">
              <q-input v-model="formulario.ano" label="Ano" dark outlined dense color="orange-8" />
            </div>
          </div>
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                v-model="formulario.unidadeAtual"
                label="Unidade Atual"
                dark
                outlined
                dense
                color="orange-8"
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
              />
            </div>
          </div>
          <q-input
            v-model="formulario.observacaoGeral"
            label="Observação Geral do Processo"
            dark
            outlined
            dense
            color="orange-8"
            type="textarea"
            rows="2"
          />
        </q-card-section>
      </q-card>

      <!-- Lista de itens editáveis -->
      <q-card class="bg-grey-9" style="border-radius: 8px; border: 1px solid #424242">
        <q-card-section>
          <div class="text-subtitle2 text-weight-bold text-orange-8 q-mb-md">
            Itens do Checklist
          </div>

          <div v-for="(item, idx) in itens" :key="idx" class="q-mb-md">
            <div class="row items-center justify-between">
              <div class="text-white text-body2 col">{{ item.texto }}</div>
              <q-btn-toggle
                v-model="item.novaResposta"
                toggle-color="orange-8"
                :options="opcoesResposta(item)"
                size="sm"
                dense
                class="q-ml-sm"
              />
            </div>

            <!-- Fotos do item -->
            <div v-if="item.fotos && item.fotos.length > 0" class="row q-gutter-xs q-mt-sm">
              <div
                v-for="(foto, fIdx) in item.fotos"
                :key="fIdx"
                class="relative-position"
                style="width: 60px; height: 60px"
              >
                <q-img :src="foto" style="height: 100%; width: 100%; border-radius: 6px" />
                <q-btn
                  round
                  dense
                  size="xs"
                  color="red"
                  icon="close"
                  style="position: absolute; top: -5px; right: -5px"
                  @click.stop="removerFoto(item, fIdx)"
                />
              </div>
            </div>

            <div class="row q-mt-sm q-gutter-sm items-center">
              <q-btn
                flat
                dense
                size="sm"
                color="orange-8"
                icon="add_a_photo"
                label="Adicionar Foto"
                @click="abrirCameraItem(idx)"
              />
              <q-input
                v-model="item.observacao"
                label="Observação do item"
                dark
                outlined
                dense
                color="orange-8"
                class="col"
              />
            </div>

            <q-separator color="grey-8" class="q-mt-sm" />
          </div>
        </q-card-section>
      </q-card>

      <!-- Input escondido para foto de item -->
      <input
        type="file"
        accept="image/*"
        capture="environment"
        id="file-input-item-pos"
        style="display: none"
        @change="processarFotoItem"
      />

      <!-- Observação geral (motivo da edição) -->
      <q-card class="bg-grey-9" style="border-radius: 8px; border: 1px solid #424242">
        <q-card-section>
          <q-input
            v-model="observacao"
            label="Observação Geral (motivo da alteração) *"
            dark
            outlined
            color="orange-8"
            type="textarea"
            rows="3"
            :rules="[(val) => !!val || 'Obrigatório descrever o motivo da edição']"
          />
        </q-card-section>
      </q-card>

      <!-- Assinatura -->
      <div class="text-subtitle2 text-weight-bold text-uppercase q-mb-sm q-ml-xs">
        Validação e Assinatura
      </div>

      <q-card
        class="bg-grey-9 shadow-5 q-mb-lg"
        style="border-radius: 12px; border: 1px solid #424242"
      >
        <q-card-section class="q-pt-md">
          <q-card
            class="bg-grey-10"
            style="border-radius: 8px; border: 1px solid #555; transition: all 0.3s ease"
            :style="
              assinaturaImagem
                ? 'border-color: #4caf50; box-shadow: 0 0 8px rgba(76, 175, 80, 0.2)'
                : ''
            "
          >
            <q-card-section class="q-pa-md">
              <div class="flex justify-between items-center q-mb-md">
                <div class="text-subtitle2 text-weight-bold text-white flex items-center">
                  <q-icon name="engineering" class="q-mr-sm text-orange-8" size="sm" />
                  Responsável pela Alteração
                </div>
                <q-badge
                  :color="assinaturaImagem ? 'green-8' : 'grey-8'"
                  :text-color="assinaturaImagem ? 'white' : 'grey-4'"
                  rounded
                  class="q-px-sm q-py-xs text-weight-bold"
                >
                  <q-icon
                    :name="assinaturaImagem ? 'check_circle' : 'pending'"
                    class="q-mr-xs"
                    size="14px"
                  />
                  {{ assinaturaImagem ? 'Assinado' : 'Pendente' }}
                </q-badge>
              </div>

              <q-input
                v-model="nomeResponsavel"
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

              <q-btn
                :color="assinaturaImagem ? 'grey-8' : 'orange-8'"
                :text-color="assinaturaImagem ? 'white' : 'black'"
                :icon="assinaturaImagem ? 'draw' : 'gesture'"
                :label="assinaturaImagem ? 'Refazer Assinatura' : 'Coletar Assinatura'"
                class="full-width text-weight-bold"
                unelevated
                style="border-radius: 6px"
                @click="dialogAssinaturaAberto = true"
              />
            </q-card-section>
          </q-card>
        </q-card-section>
      </q-card>

      <!-- Dialog Assinatura -->
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
                    Assinatura do Responsável
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

      <!-- Histórico de edições anteriores -->
      <q-card
        v-if="edicoesAnteriores.length > 0"
        class="bg-grey-9"
        style="border-radius: 8px; border: 1px solid #424242"
      >
        <q-card-section>
          <div class="text-subtitle2 text-weight-bold text-orange-8 q-mb-md">
            Histórico de Edições
          </div>
          <div v-for="(edicao, idx) in edicoesAnteriores" :key="idx" class="q-mb-md">
            <div class="text-caption text-grey-4">
              {{ formatarData(edicao.data) }} — {{ edicao.responsavel }}
            </div>
            <div v-if="edicao.observacao" class="text-caption text-grey-5 q-mt-xs">
              "{{ edicao.observacao }}"
            </div>
            <div
              v-for="(alt, i) in edicao.alteracoes"
              :key="i"
              class="text-caption text-orange q-mt-xs"
            >
              {{ alt.item || alt.campo }}: {{ alt.de }} → {{ alt.para }}
            </div>
            <q-btn
              v-if="edicao.pdfNome"
              flat
              dense
              size="sm"
              color="orange-8"
              icon="picture_as_pdf"
              label="Ver PDF"
              class="q-mt-xs"
              @click="abrirPdfEdicao(edicao.pdfNome)"
            />
            <q-separator color="grey-8" class="q-mt-sm" />
          </div>
        </q-card-section>
      </q-card>

      <!-- Botão salvar -->
      <q-btn
        color="orange-8"
        text-color="black"
        icon="save"
        label="Salvar Alterações"
        size="lg"
        class="full-width q-mb-xl"
        :disable="!temAlteracoes"
        @click="salvarEdicao"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from 'src/boot/firebase'
import { gerarChecklistPdf } from 'src/utils/pdfGenerator'
import { salvarEdicaoPosVenda, verificarStatusServidor } from 'src/utils/ServidorApi'
import localforage from 'localforage'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

import { API_BASE_URL } from 'src/utils/ServidorApi'

const serie = ref('')
const modelo = ref('')
const itens = ref([])
const observacao = ref('')
const nomeResponsavel = ref('')
const carregando = ref(false)
const edicoesAnteriores = ref([])
const assinaturaImagem = ref(null)
const dialogAssinaturaAberto = ref(false)
const canvasRef = ref(null)
const isDrawing = ref(false)
const hasSigned = ref(false)
let lastX = 0
let lastY = 0

const removerFoto = (item, index) => {
  item.fotos.splice(index, 1)
  temAlteracoes.value = true
}
function tirarUndefined(objeto) {
  const resultado = {}
  for (const chave in objeto) {
    const valor = objeto[chave]
    if (valor !== undefined) {
      resultado[chave] = valor
    }
  }
  return resultado
}
const formulario = ref({
  serie: '',
  modelo: '',
  marca: '',
  ano: '',
  unidadeAtual: '',
  horimetro: '',
  observacaoGeral: '',
})
const formularioOriginal = ref(null)
const fotoItemIndex = ref(null)

const temAlteracoes = computed(() => {
  const itensAlterados = itens.value.some((item) => item.novaResposta !== item.resposta)
  const camposAlterados =
    JSON.stringify(formulario.value) !== JSON.stringify(formularioOriginal.value)
  return itensAlterados || camposAlterados
})

const opcoesResposta = (item) => {
  if (
    ['BOM', 'ATENCAO', 'RUIM'].includes(item.resposta) ||
    ['BOM', 'ATENCAO', 'RUIM'].includes(item.novaResposta)
  ) {
    return [
      { label: 'BOM', value: 'BOM' },
      { label: 'ATENÇÃO', value: 'ATENCAO' },
      { label: 'RUIM', value: 'RUIM' },
    ]
  }
  if (['SIM', 'NAO'].includes(item.resposta) || ['SIM', 'NAO'].includes(item.novaResposta)) {
    return [
      { label: 'SIM', value: 'SIM' },
      { label: 'NÃO', value: 'NAO' },
    ]
  }
  if (['OK', 'FALTA'].includes(item.resposta) || ['OK', 'FALTA'].includes(item.novaResposta)) {
    return [
      { label: 'OK', value: 'OK' },
      { label: 'FALTA', value: 'FALTA' },
    ]
  }
  return [
    { label: 'OK', value: 'OK' },
    { label: 'FALTA', value: 'FALTA' },
  ]
}

const confirmarAssinatura = () => {
  if (!hasSigned.value) {
    $q.notify({ type: 'warning', message: 'Faça a assinatura antes de confirmar.' })
    return
  }
  assinaturaImagem.value = canvasRef.value.toDataURL('image/png')
  dialogAssinaturaAberto.value = false
  $q.notify({ type: 'positive', message: 'Assinatura confirmada.' })
}

const carregarChecklist = async () => {
  carregando.value = true
  try {
    serie.value = route.query.serie
    if (!serie.value) return

    const docSnap = await getDoc(doc(db, 'maquinas', serie.value))
    if (!docSnap.exists()) {
      $q.notify({ type: 'warning', message: 'Máquina não encontrada.' })
      return
    }

    const dados = docSnap.data()
    modelo.value = dados.modelo || ''

    formulario.value = {
      serie: dados.serie || '',
      modelo: dados.modelo || '',
      marca: dados.marca || '',
      ano: dados.ano || '',
      unidadeAtual: dados.unidadeAtual || '',
      horimetro: dados.horimetro || '',
      observacaoGeral: dados.observacaoGeral || '',
    }
    formularioOriginal.value = JSON.parse(JSON.stringify(formulario.value))

    edicoesAnteriores.value = dados.edicoesChecklist || []

    if (dados.checklistEntrada && Array.isArray(dados.checklistEntrada)) {
      itens.value = dados.checklistEntrada.map((item) => ({
        ...item,
        novaResposta: item.resposta,
      }))
    }
  } catch (e) {
    console.error('Erro ao carregar checklist:', e)
    $q.notify({ type: 'negative', message: 'Erro ao carregar checklist.' })
  } finally {
    carregando.value = false
  }
}

const abrirCameraItem = (index) => {
  fotoItemIndex.value = index
  document.getElementById('file-input-item-pos')?.click()
}

const processarFotoItem = (event) => {
  const file = event.target.files[0]
  const idx = fotoItemIndex.value
  if (!file || idx === null) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const item = itens.value[idx]
    if (!item.fotos) item.fotos = []
    item.fotos.push(e.target.result)
  }
  reader.readAsDataURL(file)
  event.target.value = ''
  fotoItemIndex.value = null
}

const abrirPdfEdicao = (pdfNome) => {
  if (!pdfNome) {
    $q.notify({ type: 'warning', message: 'PDF não disponível.' })
    return
  }
  const url = `${API_BASE_URL}/api/pos-venda/pdf/${encodeURIComponent(pdfNome)}`
  window.open(url, '_blank')
}

const salvarEdicao = async () => {
  if (!nomeResponsavel.value) {
    $q.notify({ type: 'warning', message: 'Preencha o nome do responsável.' })
    return
  }
  if (!assinaturaImagem.value) {
    $q.notify({ type: 'warning', message: 'A assinatura é obrigatória.' })
    return
  }

  const alteracoesItens = []
  itens.value.forEach((item) => {
    if (item.novaResposta !== item.resposta) {
      alteracoesItens.push({ item: item.texto, de: item.resposta, para: item.novaResposta })
    }
  })

  const alteracoesFormulario = []
  if (formulario.value.serie !== formularioOriginal.value?.serie)
    alteracoesFormulario.push({
      campo: 'Série',
      de: formularioOriginal.value?.serie,
      para: formulario.value.serie,
    })
  if (formulario.value.modelo !== formularioOriginal.value?.modelo)
    alteracoesFormulario.push({
      campo: 'Modelo',
      de: formularioOriginal.value?.modelo,
      para: formulario.value.modelo,
    })
  if (formulario.value.marca !== formularioOriginal.value?.marca)
    alteracoesFormulario.push({
      campo: 'Marca',
      de: formularioOriginal.value?.marca,
      para: formulario.value.marca,
    })
  if (formulario.value.ano !== formularioOriginal.value?.ano)
    alteracoesFormulario.push({
      campo: 'Ano',
      de: formularioOriginal.value?.ano,
      para: formulario.value.ano,
    })
  if (formulario.value.unidadeAtual !== formularioOriginal.value?.unidadeAtual)
    alteracoesFormulario.push({
      campo: 'Unidade',
      de: formularioOriginal.value?.unidadeAtual,
      para: formulario.value.unidadeAtual,
    })
  if (formulario.value.horimetro !== formularioOriginal.value?.horimetro)
    alteracoesFormulario.push({
      campo: 'Horímetro',
      de: formularioOriginal.value?.horimetro,
      para: formulario.value.horimetro,
    })

  const alteracoes = [...alteracoesItens, ...alteracoesFormulario]

  if (alteracoes.length === 0) {
    $q.notify({ type: 'info', message: 'Nenhuma alteração detectada. Nada para salvar.' })
    return
  }

  if (!observacao.value || observacao.value.trim().length < 5) {
    $q.notify({
      type: 'warning',
      message: 'Descreva o motivo da edição nas observações (mínimo 5 caracteres).',
    })
    return
  }

  try {
    await new Promise((resolve, reject) => {
      const listaHtml = alteracoes
        .map((a) => `<li><b>${a.item || a.campo}:</b> ${a.de} → ${a.para}</li>`)
        .join('')
      $q.dialog({
        dark: true,
        title: '⚠️ Confirmar Edição',
        html: true,
        message: `
          <div style="color:#ccc">
            As seguintes alterações serão salvas:<br><br>
            <ul style="padding-left:16px">${listaHtml}</ul>
            <br>
            <b>Observação:</b> ${observacao.value}<br>
            <b>Responsável:</b> ${nomeResponsavel.value}
          </div>`,
        ok: { label: 'Sim, salvar edição', color: 'orange-8', flat: false },
        cancel: { label: 'Cancelar', color: 'grey-5', flat: true },
        persistent: true,
      })
        .onOk(resolve)
        .onCancel(reject)
    })
  } catch {
    return
  }

  try {
    $q.loading.show({ message: 'Gerando PDF e salvando edição...' })
    const auth = getAuth()
    const user = auth.currentUser
    const agora = new Date()
    const dataHoraFormatada =
      agora.toLocaleDateString('pt-BR') +
      ' às ' +
      agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

    const novoChecklist = itens.value.map((item) => {
      const { novaResposta, ...resto } = item
      return tirarUndefined({ ...resto, resposta: novaResposta })
    })

    const dadosParaPdf = {
      tipoPdf: 'edicao_checklist',
      tipo: 'Edição de Checklist',
      nomeMaquina: formulario.value.modelo || 'Equipamento',
      dadosFormulario: formulario.value,
      respostasChecklist: novoChecklist,
      assinaturas: {
        responsavelNome: nomeResponsavel.value,
        responsavelImagem: assinaturaImagem.value,
        motoristaNome: '-',
      },
      fotosGerais: {},
      dataConclusao: agora.toISOString(),
      dataHoraFormatada,
      userName: user?.displayName || nomeResponsavel.value,
      observacaoGeral: observacao.value,
    }

    const pdfBase64 = await gerarChecklistPdf(dadosParaPdf, true)

    // Calcula numeroAcao considerando todos os eventos (historico normal + historico_serie offline)
    const chaveSerie = `historico_serie_${serie.value}`
    const historicoSerie = (await localforage.getItem(chaveSerie)) || []

    let historicoAtual = []
    let numeroAcao = 1

    try {
      if (navigator.onLine) {
        const maquinaSnap = await getDoc(doc(db, 'maquinas', serie.value))
        historicoAtual = maquinaSnap.exists() ? maquinaSnap.data().historico || [] : []
        numeroAcao = historicoAtual.length + 1
      } else {
        numeroAcao = historicoSerie.length + 1
      }
    } catch (dbErr) {
      console.warn('Modo offline ativo na leitura do número de ação:', dbErr)
      numeroAcao = historicoSerie.length + 1
    }

    const pdfNome = `${serie.value}-${numeroAcao}-edicao`
    const pdfSalvo = { success: false, path: '' }

    try {
      const base64Limpo = pdfBase64.includes(',') ? pdfBase64.split(',')[1] : pdfBase64
      const servidorOnline = await verificarStatusServidor()
      if (servidorOnline.online) {
        // Função corrigida!
        const resp = await salvarEdicaoPosVenda(
          formulario.value.unidadeAtual || '',
          pdfNome,
          base64Limpo,
        )
        pdfSalvo.success = true
        pdfSalvo.path = resp.path || pdfNome
      }
    } catch (e) {
      console.warn('Servidor offline, não foi possível enviar PDF:', e)
    }

    // Guarda PDF no localforage (fallback/offline)
    const jaExisteLocal = historicoSerie.some((h) => h.id === `edicao-${Date.now()}`)
    if (!jaExisteLocal) {
      historicoSerie.push({
        id: `edicao-${Date.now()}`,
        tipo: 'edicao',
        serie: serie.value,
        unidadeAtual: formulario.value.unidadeAtual,
        data: new Date().toISOString(),
        pdfNome,
      })
      await localforage.setItem(chaveSerie, historicoSerie)
    }

    const registroEdicao = tirarUndefined({
      data: agora.toISOString(),
      tipo: 'edicao',
      responsavel: nomeResponsavel.value,
      uid: user?.uid || null,
      assinatura: assinaturaImagem.value,
      observacao: observacao.value,
      alteracoes: tirarUndefined(alteracoes),
      pdfNome,
    })

    const itemHistorico = tirarUndefined({
      tipo: 'edicao',
      numero: numeroAcao,
      data: new Date().toISOString(),
      unidadeAtual: formulario.value.unidadeAtual,
      responsavel: nomeResponsavel.value,
      pdfNome,
      observacao: observacao.value,
      alteracoes: tirarUndefined(alteracoes),
      idUnicoAcao: `edicao-${Date.now()}`,
    })

    const maquinaRef = doc(db, 'maquinas', serie.value)
    const docSnap = await getDoc(maquinaRef)
    const dadosAtuais = docSnap.data()

    const payloadFirebase = {
      checklistEntrada: novoChecklist,
      serie: formulario.value.serie || null,
      modelo: formulario.value.modelo || null,
      marca: formulario.value.marca || null,
      ano: formulario.value.ano || null,
      unidadeAtual: formulario.value.unidadeAtual || null,
      horimetro: formulario.value.horimetro || null,
      edicoesChecklist: [...(dadosAtuais.edicoesChecklist || []), registroEdicao],
      historico: arrayUnion(itemHistorico),
      ultimaAtualizacao: Timestamp.now(),
    }

    await updateDoc(maquinaRef, payloadFirebase)

    $q.notify({
      type: 'positive',
      message: 'Edição salva, PDF enviado e registrada no histórico com sucesso!',
    })
    router.back()
  } catch (e) {
    console.error('Erro ao salvar edição:', e)
    $q.notify({ type: 'negative', message: 'Erro ao salvar edição.' })
  } finally {
    $q.loading.hide()
  }
}

// ===== CANVAS =====
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
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
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
}

const stopDrawing = () => {
  isDrawing.value = false
}

const limparAssinatura = () => {
  const ctx = canvasRef.value.getContext('2d')
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  hasSigned.value = false
}

const formatarData = (dataStr) => {
  if (!dataStr) return ''
  return new Date(dataStr).toLocaleDateString('pt-BR')
}

onMounted(() => {
  carregarChecklist()
  nextTick(() => initCanvas())
})
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
