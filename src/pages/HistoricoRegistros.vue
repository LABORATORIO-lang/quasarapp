<template>
  <q-page class="q-pa-lg bg-grey-10 text-white">
    <div class="row items-center justify-between q-mb-md q-col-gutter-sm">
      <div class="row items-center">
        <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.back()" />
        <div class="q-ml-sm">
          <div class="text-h6 text-uppercase text-orange-8">Historico: {{ tituloSetor }}</div>
          <div class="text-caption text-grey-5">
            {{ checklists.length }} registro{{ checklists.length === 1 ? '' : 's' }} salvo{{
              checklists.length === 1 ? '' : 's'
            }}
          </div>
        </div>
      </div>

      <div class="row items-center q-gutter-sm" v-if="checklists.length > 0">
        <q-btn
          flat
          dense
          color="orange-8"
          :icon="todosFiltradosSelecionados ? 'check_box' : 'check_box_outline_blank'"
          :label="todosFiltradosSelecionados ? 'Limpar selecao' : 'Selecionar todos'"
          @click="alternarTodosFiltrados"
        />
      </div>
    </div>

    <q-input
      v-model="filtro"
      dark
      outlined
      dense
      clearable
      placeholder="Pesquisar por cliente, equipamento, cidade, modelo ou serie"
      bg-color="grey-9"
      color="orange-8"
      class="q-mb-md"
    >
      <template v-slot:prepend>
        <q-icon name="search" color="orange-8" />
      </template>
    </q-input>

    <div
      v-if="selecionados.length > 0"
      class="row items-center justify-between q-pa-sm q-mb-md bulk-bar"
    >
      <div class="text-subtitle2">{{ selecionados.length }} selecionado(s)</div>
      <div class="row q-gutter-xs">
        <q-btn
          dense
          flat
          color="orange-8"
          icon="share"
          label="Compartilhar"
          @click="compartilharSelecionados"
        />
        <q-btn
          dense
          flat
          color="red-5"
          icon="delete"
          label="Excluir"
          @click="excluirSelecionados"
        />
      </div>
    </div>

    <div v-if="checklists.length === 0" class="empty-state text-center text-grey-5">
      <q-icon name="folder_open" size="48px" color="grey-7" />
      <div class="text-subtitle1 q-mt-sm">Nenhum registro encontrado para {{ tituloSetor }}</div>
    </div>

    <div v-else-if="listaFiltrada.length === 0" class="empty-state text-center text-grey-5">
      <q-icon name="search_off" size="48px" color="grey-7" />
      <div class="text-subtitle1 q-mt-sm">Nenhum registro combina com a pesquisa</div>
    </div>

    <q-card v-else class="bg-grey-9 shadow-3 history-card">
      <q-list separator dark>
        <q-item v-for="chk in listaFiltrada" :key="chk.id" class="q-py-md">
          <q-item-section avatar>
            <q-checkbox
              dark
              color="orange-8"
              :model-value="estaSelecionado(chk.id)"
              @update:model-value="alternarSelecao(chk.id)"
            />
          </q-item-section>

          <q-item-section avatar>
            <q-avatar color="grey-8" text-color="orange-8" icon="description" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-bold">
              {{ obterFormulario(chk).cliente || 'Cliente nao identificado' }}
            </q-item-label>
            <q-item-label caption class="text-grey-4">
              {{ chk.nomeMaquina || 'Equipamento nao identificado' }}
            </q-item-label>
            <q-item-label caption class="text-grey-5">
              {{ resumoFormulario(chk) }} - {{ formatarData(chk.dataCriacao || chk.dataConclusao) }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="row no-wrap q-gutter-xs">
              <q-btn round flat dense color="orange-8" icon="visibility" @click="abrirPDF(chk)">
                <q-tooltip>Visualizar</q-tooltip>
              </q-btn>
              <q-btn
                round
                flat
                dense
                color="orange-8"
                icon="share"
                @click="compartilharChecklist(chk)"
              >
                <q-tooltip>Compartilhar</q-tooltip>
              </q-btn>
              <q-btn round flat dense color="red-5" icon="delete" @click="excluirRegisto(chk.id)">
                <q-tooltip>Excluir</q-tooltip>
              </q-btn>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import localforage from 'localforage'
import { Capacitor } from '@capacitor/core'
import { Directory, Filesystem } from '@capacitor/filesystem'
import { FileOpener } from '@capawesome-team/capacitor-file-opener'
import { Share } from '@capacitor/share'
import { gerarChecklistPdf } from 'src/utils/pdfGenerator'

const $q = useQuasar()
const route = useRoute()

const checklists = ref([])
const filtro = ref('')
const selecionados = ref([])

const setorAtual = computed(() => route.params.setor || 'geral')
const chaveArmazenamento = computed(() => `historico_${setorAtual.value}`)

const tituloSetor = computed(() => {
  return setorAtual.value.charAt(0).toUpperCase() + setorAtual.value.slice(1).replace('-', ' ')
})

const obterFormulario = (chk) => chk.formulario || chk.dadosFormulario || {}

const listaFiltrada = computed(() => {
  const textoPesquisa = (filtro.value || '').toLowerCase().trim()
  if (!textoPesquisa) return checklists.value

  return checklists.value.filter((chk) => {
    const formulario = obterFormulario(chk)
    const campos = [
      formulario.cliente,
      formulario.cidade,
      formulario.modelo,
      formulario.marca,
      formulario.serie,
      chk.nomeMaquina,
      chk.tipoMaquina,
    ]

    return campos.some((campo) =>
      String(campo || '')
        .toLowerCase()
        .includes(textoPesquisa),
    )
  })
})

const todosFiltradosSelecionados = computed(() => {
  return (
    listaFiltrada.value.length > 0 &&
    listaFiltrada.value.every((chk) => selecionados.value.includes(chk.id))
  )
})

onMounted(async () => {
  await carregarHistoricoOffline()
})

const carregarHistoricoOffline = async () => {
  $q.loading.show({ message: 'A carregar ficheiros...' })
  try {
    const dadosLocais = await localforage.getItem(chaveArmazenamento.value)
    checklists.value = dadosLocais || []
    selecionados.value = selecionados.value.filter((id) =>
      checklists.value.some((chk) => chk.id === id),
    )
  } catch (error) {
    console.error('Erro ao buscar historico:', error)
    $q.notify({ type: 'negative', message: 'Erro ao carregar os dados.' })
  } finally {
    $q.loading.hide()
  }
}

const resumoFormulario = (chk) => {
  const formulario = obterFormulario(chk)
  return [formulario.cidade, formulario.modelo, formulario.serie].filter(Boolean).join(' | ') || '-'
}

const estaSelecionado = (id) => selecionados.value.includes(id)

const alternarSelecao = (id) => {
  if (estaSelecionado(id)) {
    selecionados.value = selecionados.value.filter((itemId) => itemId !== id)
    return
  }
  selecionados.value = [...selecionados.value, id]
}

const alternarTodosFiltrados = () => {
  const idsFiltrados = listaFiltrada.value.map((chk) => chk.id)

  if (todosFiltradosSelecionados.value) {
    selecionados.value = selecionados.value.filter((id) => !idsFiltrados.includes(id))
    return
  }

  selecionados.value = Array.from(new Set([...selecionados.value, ...idsFiltrados]))
}

const nomeArquivoPdf = (chk) => {
  const cliente = obterFormulario(chk).cliente || 'Checklist'
  return `${cliente.replace(/[^\w-]+/g, '_')}_${chk.id || Date.now()}.pdf`
}

const abrirPdfNoNavegador = (pdfDataUrl) => {
  try {
    const base64 = pdfDataUrl.includes(',') ? pdfDataUrl.split(',')[1] : pdfDataUrl
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.target = '_blank'
    link.click()

    setTimeout(() => URL.revokeObjectURL(url), 60000)
  } catch (error) {
    console.error('Erro ao abrir PDF no PC:', error)
  }
}

const gerarPdfEmergencia = async (registo) => {
  $q.notify({ message: 'A processar PDF de emergencia...', color: 'info' })
  const pdfDataUrl = await gerarChecklistPdf(registo, true)
  registo.pdfFisico = pdfDataUrl

  const dadosLimpos = JSON.parse(JSON.stringify(checklists.value))
  await localforage.setItem(chaveArmazenamento.value, dadosLimpos)

  return pdfDataUrl
}

const garantirPdfFisico = async (registo) => {
  if (registo.pdfFisico) return registo.pdfFisico
  return await gerarPdfEmergencia(registo)
}

// ==========================================
// A MÁGICA: ABRE PDF IGUAL AO SEU CÓDIGO KOTLIN
// ==========================================
// ==========================================
// A MÁGICA: ABRE PDF IGUAL AO SEU CÓDIGO KOTLIN
// ==========================================
const abrirPDF = async (registo) => {
  try {
    $q.loading.show({ message: 'A processar...' })
    const pdfDataUrl = registo.pdfFisico || (await gerarPdfEmergencia(registo))

    if (Capacitor.isNativePlatform()) {
      const base64Puro = pdfDataUrl.includes(',') ? pdfDataUrl.split(',')[1] : pdfDataUrl
      const nomeSimples = nomeArquivoPdf(registo)

      // Escrever ficheiro
      await Filesystem.writeFile({
        path: nomeSimples,
        data: base64Puro,
        directory: Directory.Documents,
      })

      // Obter URI
      const { uri } = await Filesystem.getUri({
        directory: Directory.Documents,
        path: nomeSimples,
      })

      console.log('Caminho do ficheiro:', uri)

      // Tentar abrir
      await FileOpener.openFile({
        path: uri,
        mimeType: 'application/pdf',
      })
    } else {
      abrirPdfNoNavegador(pdfDataUrl)
    }
  } catch (error) {
    // AQUI ESTÁ A CHAVE: Vamos ver exatamente qual é o erro no log
    console.error('ERRO DETALHADO:', error)
    $q.dialog({
      title: 'Erro ao abrir PDF',
      message: `Erro: ${error.message}. Caminho: ${JSON.stringify(error)}`,
    })
  } finally {
    $q.loading.hide()
  }
}

const confirmarExclusao = (ids) => {
  if (!ids.length) return

  $q.dialog({
    title: 'Confirmar exclusao',
    message:
      ids.length === 1
        ? 'Deseja apagar este registro permanentemente?'
        : `Deseja apagar ${ids.length} registros permanentemente?`,
    cancel: 'Cancelar',
    persistent: true,
    ok: { color: 'negative', label: 'Apagar' },
  }).onOk(async () => {
    try {
      checklists.value = checklists.value.filter((chk) => !ids.includes(chk.id))
      selecionados.value = selecionados.value.filter((id) => !ids.includes(id))

      const dadosLimpos = JSON.parse(JSON.stringify(checklists.value))
      await localforage.setItem(chaveArmazenamento.value, dadosLimpos)

      $q.notify({ message: 'Registro removido do dispositivo.', color: 'positive' })
    } catch (e) {
      console.error('Erro ao excluir:', e)
      $q.notify({ message: 'Falha ao salvar a exclusao no disco.', color: 'negative' })
    }
  })
}

const excluirRegisto = (id) => confirmarExclusao([id])
const excluirSelecionados = () => confirmarExclusao(selecionados.value)

const formatarData = (dataIso) => {
  if (!dataIso) return '-'
  const data = new Date(dataIso)
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const dataUrlParaArquivo = (dataUrl, nomeArquivo) => {
  const [cabecalho, base64] = dataUrl.split(',')
  const mime = cabecalho.match(/:(.*?);/)?.[1] || 'application/pdf'
  const binario = atob(base64)
  const bytes = new Uint8Array(binario.length)

  for (let i = 0; i < binario.length; i += 1) {
    bytes[i] = binario.charCodeAt(i)
  }
  return new File([bytes], nomeArquivo, { type: mime })
}

const compartilharChecklist = async (chk) => {
  try {
    $q.loading.show({ message: 'A preparar partilha...' })
    const pdfDataUrl = await garantirPdfFisico(chk)

    if (Capacitor.isNativePlatform()) {
      const base64Puro = pdfDataUrl.includes(',') ? pdfDataUrl.split(',')[1] : pdfDataUrl
      const nomeSimples = nomeArquivoPdf(chk)

      await Filesystem.writeFile({
        path: nomeSimples,
        data: base64Puro,
        directory: Directory.Cache,
      })

      const { uri } = await Filesystem.getUri({
        directory: Directory.Cache,
        path: nomeSimples,
      })

      await Share.share({
        files: [uri],
        title: nomeSimples,
        dialogTitle: 'Compartilhar checklist',
      })
    } else {
      const arquivo = dataUrlParaArquivo(pdfDataUrl, nomeArquivoPdf(chk))
      if (navigator.canShare?.({ files: [arquivo] })) {
        await navigator.share({ files: [arquivo], title: nomeArquivoPdf(chk) })
      } else {
        abrirPdfNoNavegador(pdfDataUrl)
      }
    }
  } catch (error) {
    console.error('Erro ao compartilhar:', error)
    $q.notify({ type: 'negative', message: 'Erro ao compartilhar: ' + error.message })
  } finally {
    $q.loading.hide()
  }
}

const compartilharSelecionados = async () => {
  try {
    const registros = checklists.value.filter((chk) => selecionados.value.includes(chk.id))
    if (!registros.length) return

    $q.loading.show({ message: 'A preparar partilha...' })

    if (Capacitor.isNativePlatform()) {
      const uris = []
      for (const chk of registros) {
        const pdfDataUrl = await garantirPdfFisico(chk)
        const base64Puro = pdfDataUrl.includes(',') ? pdfDataUrl.split(',')[1] : pdfDataUrl
        const nomeSimples = nomeArquivoPdf(chk)

        await Filesystem.writeFile({
          path: nomeSimples,
          data: base64Puro,
          directory: Directory.Cache,
        })

        const { uri } = await Filesystem.getUri({
          directory: Directory.Cache,
          path: nomeSimples,
        })

        uris.push(uri)
      }

      await Share.share({
        files: uris,
        title: 'Checklists selecionados',
        dialogTitle: 'Compartilhar checklists',
      })
    } else {
      const arquivos = []
      for (const chk of registros) {
        const pdfDataUrl = await garantirPdfFisico(chk)
        arquivos.push(dataUrlParaArquivo(pdfDataUrl, nomeArquivoPdf(chk)))
      }

      if (navigator.canShare?.({ files: arquivos })) {
        await navigator.share({ files: arquivos, title: 'Checklists selecionados' })
      } else {
        for (const chk of registros) {
          await abrirPDF(chk)
        }
      }
    }
  } catch (error) {
    console.error('Erro ao compartilhar selecionados:', error)
    $q.notify({ type: 'negative', message: 'Erro ao compartilhar: ' + error.message })
  } finally {
    $q.loading.hide()
  }
}
</script>

<style scoped>
.history-card {
  border: 1px solid #424242;
  border-radius: 8px;
  overflow: hidden;
}

.bulk-bar {
  border: 1px solid #5f4328;
  border-radius: 8px;
  background: #2b241f;
}

.empty-state {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
