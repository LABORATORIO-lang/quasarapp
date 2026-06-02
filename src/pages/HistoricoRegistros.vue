<template>
  <q-page class="q-pa-lg bg-grey-10 text-white">
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center">
        <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.back()" />
        <div class="text-h6 text-uppercase text-orange-8 q-ml-sm">Histórico: {{ tituloSetor }}</div>
      </div>
    </div>
    <q-page class="q-pa-md">
      <div v-if="checklists.length === 0" class="text-center text-grey">
        Nenhum registo encontrado para {{ tituloSetor }} (Chave: {{ chaveArmazenamento }})
      </div>

      <div v-for="item in listaFiltrada" :key="item.id">
        {{ item.formulario.cliente }}
      </div>
    </q-page>
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
// ================= 1. IMPORTAÇÕES =================
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import localforage from 'localforage'
import { gerarChecklistPdf } from 'src/utils/pdfGenerator'

// ================= 2. INICIALIZAÇÃO DE PLUGINS =================
const $q = useQuasar()
const route = useRoute()

// ================= 3. ESTADOS (Variáveis Reativas) =================
const checklists = ref([])
const filtro = ref('')

// ================= 4. INTELIGÊNCIA DE ROTEAMENTO E ARMAZENAMENTO =================

const setorAtual = computed(() => route.params.setor || 'geral')
const chaveArmazenamento = computed(() => `historico_${setorAtual.value}`)

const tituloSetor = computed(() => {
  return setorAtual.value.charAt(0).toUpperCase() + setorAtual.value.slice(1).replace('-', ' ')
})

// ================= 5. CICLO DE VIDA =================
onMounted(async () => {
  console.log('DEBUG: Página carregada. Setor:', setorAtual.value)
  await carregarHistoricoOffline()
})

// ================= 6. FUNÇÕES PRINCIPAIS =================

const carregarHistoricoOffline = async () => {
  $q.loading.show({ message: 'A carregar ficheiros...' })
  try {
    const dadosLocais = await localforage.getItem(chaveArmazenamento.value)
    checklists.value = dadosLocais || []
  } catch (error) {
    console.error('Erro ao buscar histórico:', error)
    $q.notify({ type: 'negative', message: 'Erro ao carregar os dados.' })
  } finally {
    $q.loading.hide()
  }
}

const listaFiltrada = computed(() => {
  const textoPesquisa = filtro.value.toLowerCase()
  return checklists.value.filter((chk) => {
    const nomeCliente = chk.formulario?.cliente?.toLowerCase() || ''
    const nomeMaquina = chk.nomeMaquina?.toLowerCase() || ''
    return nomeCliente.includes(textoPesquisa) || nomeMaquina.includes(textoPesquisa)
  })
})

/**
 * NOVA LÓGICA DE VISUALIZAÇÃO DE PDF:
 * Agora não precisamos de gerar o PDF novamente.
 * Abrimos diretamente o que foi guardado no momento do salvamento.
 */
const abrirPDF = (registo) => {
  if (registo.pdfFisico) {
    // Abre o PDF que já foi "congelado" no momento do salvamento
    const win = window.open('', '_blank')
    win.document.write(
      `<iframe src="${registo.pdfFisico}" style="width:100%; height:100%; border:none;"></iframe>`,
    )
  } else {
    // Fallback: se por algum motivo o PDF não existir no registo, tenta gerar na hora
    $q.notify({ message: 'A processar PDF de emergência...', color: 'info' })
    gerarChecklistPdf(registo)
  }
}

const excluirRegisto = (id) => {
  $q.dialog({
    title: 'Confirmar Exclusão',
    message: 'Tem a certeza que deseja apagar este registo permanentemente?',
    cancel: 'Cancelar',
    persistent: true,
    ok: { color: 'negative', label: 'Apagar' },
  }).onOk(async () => {
    checklists.value = checklists.value.filter((chk) => chk.id !== id)
    await localforage.setItem(chaveArmazenamento.value, checklists.value)
    $q.notify({ message: 'Registo removido do dispositivo.', color: 'positive' })
  })
}

// ================= 7. UTILITÁRIOS =================

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

const compartilharChecklist = async (chk) => {
  // Como agora o PDF é um Base64, o compartilhamento pode ser via a abertura do PDF
  // que o próprio telemóvel saberá partilhar através do botão nativo do leitor de PDF.
  abrirPDF(chk)
}
</script>
