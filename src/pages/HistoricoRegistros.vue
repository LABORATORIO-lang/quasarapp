<template>
  <q-page class="q-pa-lg bg-grey-10 text-white">
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center">
        <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.back()" />
        <div class="text-h6 text-uppercase text-orange-8 q-ml-sm">Histórico: {{ tituloSetor }}</div>
      </div>
    </div>

    <q-input
      v-model="filtro"
      dark
      outlined
      dense
      placeholder="Pesquisar por cliente ou equipamento..."
      bg-color="grey-9"
      color="orange-8"
      class="q-mb-md"
    >
      <template v-slot:prepend>
        <q-icon name="search" color="orange-8" />
      </template>
    </q-input>

    <q-card class="bg-grey-9 shadow-3" style="border-radius: 12px">
      <q-list separator dark>
        <q-item v-for="chk in listaFiltrada" :key="chk.id" class="q-py-md">
          <q-item-section avatar>
            <q-avatar color="grey-8" text-color="orange-8" icon="description" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-bold">{{
              chk.formulario?.cliente || 'Cliente não identificado'
            }}</q-item-label>
            <q-item-label caption class="text-grey-4"
              >{{ chk.nomeMaquina }} - {{ formatarData(chk.dataCriacao) }}</q-item-label
            >
          </q-item-section>

          <q-item-section side>
            <q-btn-dropdown flat color="orange-8" icon="more_vert">
              <q-list dark style="min-width: 150px">
                <q-item clickable v-close-popup @click="abrirPDF(chk)">
                  <q-item-section avatar><q-icon name="visibility" /></q-item-section>
                  <q-item-section>Visualizar</q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="compartilharChecklist(chk)">
                  <q-item-section avatar><q-icon name="share" /></q-item-section>
                  <q-item-section>Compartilhar</q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="excluirRegisto(chk.id)" class="text-red">
                  <q-item-section avatar><q-icon name="delete" /></q-item-section>
                  <q-item-section>Excluir</q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue' // Apenas um import destes
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import localforage from 'localforage'
import { gerarChecklistPdf } from 'src/utils/pdfGenerator'

const $q = useQuasar()
const route = useRoute()
const filtro = ref('')
const checklists = ref([]) // Apenas uma definição

// 1. Pega o setor da URL. Ex: '/inicio/historico/comercial' -> setorAtual = 'comercial'
const setorAtual = route.params.setor || 'geral'

// 2. Define a chave de busca
const chaveArmazenamento = `historico_${setorAtual}`

const tituloSetor = computed(() => {
  return setorAtual.charAt(0).toUpperCase() + setorAtual.slice(1).replace('-', ' ')
})

onMounted(async () => {
  await carregarHistoricoOffline()
})

const carregarHistoricoOffline = async () => {
  $q.loading.show({ message: 'A carregar ficheiros...' })
  try {
    const dadosLocais = await localforage.getItem(chaveArmazenamento)
    checklists.value = dadosLocais || []
  } catch (error) {
    console.error('Erro ao buscar histórico:', error)
  } finally {
    $q.loading.hide()
  }
}

const abrirPDF = async (dadosDoRegisto) => {
  $q.loading.show({ message: 'A processar PDF...' })
  try {
    // Esta inteligência permite-lhe no futuro gerar PDFs diferentes dependendo do setor
    if (setorAtual === 'comercial') {
      await gerarChecklistPdf(dadosDoRegisto)
    } else if (setorAtual === 'pos-venda') {
      // Quando criar o PDF do Pós-venda, chame-o aqui!
      $q.notify({ message: 'PDF do Pós-Venda ainda em desenvolvimento.', color: 'info' })
    } else {
      await gerarChecklistPdf(dadosDoRegisto) // Fallback
    }
  } catch (error) {
    console.error(error)
    $q.notify({ message: 'Erro ao abrir o PDF', color: 'red' })
  } finally {
    $q.loading.hide()
  }
}

const excluirRegisto = (id) => {
  $q.dialog({
    title: 'Confirmar Exclusão',
    message: 'Tem a certeza que deseja apagar este registo do dispositivo?',
    cancel: true,
    persistent: true,
    ok: { color: 'red', label: 'Apagar' },
  }).onOk(async () => {
    checklists.value = checklists.value.filter((chk) => chk.id !== id)
    // Atualiza a gaveta correta na memória
    await localforage.setItem(chaveArmazenamento, checklists.value)
    $q.notify({ message: 'Registo removido do dispositivo.', color: 'positive' })
  })
}

const formatarData = (dataIso) => {
  if (!dataIso) return '-'
  const data = new Date(dataIso)
  return data.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
const listaFiltrada = computed(() => {
  const f = filtro.value.toLowerCase()
  return checklists.value.filter(
    (chk) =>
      chk.formulario?.cliente?.toLowerCase().includes(f) ||
      chk.nomeMaquina?.toLowerCase().includes(f),
  )
})

// Lógica de Compartilhamento via Web Share API
const compartilharChecklist = async (chk) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Checklist Dinâmica',
        text: `Relatório de ${chk.formulario?.cliente}`,
        url: window.location.href, // Aqui futuramente pode enviar um link do seu PDF
      })
    } catch (err) {
      console.error('Erro ao compartilhar', err)
    }
  } else {
    $q.notify('O seu dispositivo não suporta compartilhamento direto.')
  }
}
</script>
