<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center justify-between q-mb-md">
      <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
      <div class="text-h5 text-weight-bold">Estoque e Trânsito</div>
    </div>

    <!-- Abas Atualizadas (Adicionado o filtro de Entregas Pendentes) -->
    <q-tabs
      v-model="abaAtual"
      dense
      class="text-grey"
      active-color="orange-8"
      indicator-color="orange-8"
      align="left"
    >
      <q-tab name="todos" label="Todas" />
      <q-tab name="em_estoque" label="Em Estoque" />
      <q-tab name="em_transito" label="Em Trânsito" />
      <q-tab name="aguardando_entrega_cliente" label="Aguardando Entrega" />
      <q-tab name="entregue" label="Entregues" />
    </q-tabs>
    <q-separator color="grey-8" class="q-mb-md" />

    <!-- Tabela Principal -->
    <q-table
      :rows="maquinasFiltradas"
      :columns="colunasVisiveis"
      row-key="serie"
      dark
      flat
      bordered
      class="bg-grey-9"
      no-data-label="Nenhuma máquina encontrada."
      :loading="carregando"
    >
      <!-- Estilização das Badges de Status -->
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="corDoStatus(props.row.status)" class="text-weight-bold q-pa-xs">
            {{ formatarStatus(props.row.status) }}
          </q-badge>
        </q-td>
      </template>

      <!-- Exibição de Localização e Rota de Destino -->
      <template v-slot:body-cell-unidade="props">
        <q-td :props="props">
          {{ props.row.unidadeAtual }}
          <div v-if="props.row.status === 'em_transito'" class="text-caption text-orange">
            ➝ Destino: {{ props.row.unidadeDestino }}
          </div>
          <div
            v-if="props.row.status === 'aguardando_entrega_cliente' && props.row.cliente"
            class="text-caption text-grey-4"
          >
            ➝ Cliente: {{ props.row.cliente }}
          </div>
        </q-td>
      </template>

      <!-- Botões de Ações Administrativas -->
      <template v-slot:body-cell-acoes="props">
        <q-td :props="props">
          <!-- Copiar Link do Cliente (só quando aguardando entrega) -->
          <q-btn
            v-if="props.row.status === 'aguardando_entrega_cliente'"
            size="sm"
            flat
            round
            icon="content_copy"
            color="orange-8"
            @click="copiarLinkCliente(props.row)"
          >
            <q-tooltip class="bg-grey-9 text-white">Copiar Link do Cliente</q-tooltip>
          </q-btn>

          <q-btn
            v-if="props.row.status === 'em_estoque' && podeEditarChecklist"
            size="sm"
            flat
            round
            icon="edit_note"
            color="orange-8"
            @click="editarChecklist(props.row)"
          >
            <q-tooltip class="bg-grey-9 text-orange-8">Editar Checklist</q-tooltip>
          </q-btn>

          <q-btn
            v-if="
              ['em_transito', 'despachada', 'carregado'].includes(props.row.status) &&
              podeAlterarDestino
            "
            size="sm"
            flat
            round
            icon="edit_location_alt"
            color="orange-8"
            @click="abrirAlterarDestino(props.row)"
          >
            <q-tooltip class="bg-grey-9 text-white">Alterar Destino</q-tooltip>
          </q-btn>

          <q-btn
            size="sm"
            flat
            round
            icon="history"
            color="grey-4"
            @click="verHistoricoSerie(props.row.serie)"
          >
            <q-tooltip class="bg-grey-9 text-white">Ver Histórico</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from 'src/boot/firebase'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useUnidades } from 'src/composables/useUnidades'
import localforage from 'localforage'

const $q = useQuasar()
const router = useRouter()
const { carregarUnidades: carregarUnidadesOptions } = useUnidades()
const abaAtual = ref('todos')
const maquinas = ref([])
const carregando = ref(false)
const unidadeUsuario = ref('')
const perfisUsuario = ref([])
const entregasLink = ref({})

const podeEditarChecklist = computed(
  () => perfisUsuario.value.includes('master') || perfisUsuario.value.includes('adm_pos_venda'),
)

const podeAlterarDestino = computed(
  () => perfisUsuario.value.includes('master') || perfisUsuario.value.includes('gerente_comercial'),
)

const verTodasUnidades = computed(
  () => perfisUsuario.value.includes('master') || perfisUsuario.value.includes('gerente_comercial'),
)

// Configuração das Colunas da Tabela
const colunas = [
  { name: 'serie', align: 'left', label: 'Nº Série', field: 'serie', sortable: true },
  { name: 'modelo', align: 'left', label: 'Modelo', field: 'modelo', sortable: true },
  { name: 'unidade', align: 'left', label: 'Localização', field: 'unidadeAtual' },
  { name: 'status', align: 'center', label: 'Status', field: 'status' },
  { name: 'acoes', align: 'center', label: 'Ações', field: 'serie' },
]

// Filtro de colunas baseado no perfil de acesso do usuário
const colunasVisiveis = computed(() => {
  const temAlgumaAcao =
    perfisUsuario.value.includes('master') ||
    perfisUsuario.value.includes('adm_pos_venda') ||
    perfisUsuario.value.includes('gerente_comercial')

  if (temAlgumaAcao) return colunas
  return colunas.filter((c) => c.name !== 'acoes')
})

const carregarLinksEntrega = async () => {
  try {
    if (!unidadeUsuario.value) return

    const snap = await getDocs(
      query(
        collection(db, 'entregas_cliente'),
        where('status', '==', 'pendente'),
        where('unidade', '==', unidadeUsuario.value),
      ),
    )
    const map = {}
    snap.forEach((docSnap) => {
      const d = docSnap.data()
      if (d.serie && d.token) {
        map[d.serie] = {
          token: d.token,
          link: `${window.location.origin}/#/verificacao/${d.token}`,
          cliente: d.cliente || '',
        }
      }
    })
    entregasLink.value = map
  } catch (e) {
    console.error('Erro ao carregar links:', e)
  }
}
const copiarLinkCliente = (maquina) => {
  const entrega = entregasLink.value[maquina.serie]
  if (entrega && entrega.link) {
    navigator.clipboard.writeText(entrega.link)
    $q.notify({ type: 'positive', message: 'Link copiado para a área de transferência!' })
    return
  }

  // Fallback: se não carregou o link, tenta recriar a URL baseada no histórico
  const ultimoHistorico = maquina.historico?.length
    ? [...maquina.historico].reverse().find((h) => h.tipo === 'venda' && h.linkCliente)
    : null

  if (ultimoHistorico?.linkCliente) {
    navigator.clipboard.writeText(ultimoHistorico.linkCliente)
    $q.notify({ type: 'positive', message: 'Link copiado!' })
  } else {
    $q.notify({ type: 'warning', message: 'Link não encontrado para esta máquina.' })
  }
}

const editarChecklist = (maquina) => {
  router.push({
    path: '/inicio/pos-venda/maquinas/editar-checklist',
    query: { serie: maquina.serie },
  })
}

const abrirAlterarDestino = (maquina) => {
  router.push({
    path: '/inicio/pos-venda/maquinas/transferir',
    query: { serie: maquina.serie },
  })
}

// Atalho útil para navegar direto para a linha do tempo da máquina (Melhoria #8 integrada)
const verHistoricoSerie = (serie) => {
  router.push(`/inicio/pos-venda/maquinas/historico?serie=${encodeURIComponent(serie)}`)
}

// Carrega os documentos cadastrados na coleção 'maquinas'
const carregarMaquinas = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'maquinas'))
    const lista = []
    querySnapshot.forEach((docSnap) => {
      lista.push({ id: docSnap.id, ...docSnap.data() })
    })
    maquinas.value = lista
  } catch (e) {
    console.error('Erro ao carregar máquinas:', e)
    $q.notify({ type: 'negative', message: 'Erro ao carregar máquinas do Firebase.' })
  }
}

// Filtro Inteligente: Aplica restrição por filial (unidade) e aba ativa
const maquinasFiltradas = computed(() => {
  let lista = maquinas.value

  // Aplica o filtro de unidade: apenas não-master veem apenas sua unidade
  if (unidadeUsuario.value && !verTodasUnidades.value) {
    lista = lista.filter((m) => m.unidadeAtual === unidadeUsuario.value)
  }

  if (abaAtual.value === 'todos') return lista

  const statusPorAba = {
    em_estoque: ['em_estoque', 'recebida_usada', 'disponivel'],
    em_transito: ['em_transito', 'despachada', 'carregado'],
    aguardando_entrega_cliente: ['aguardando_entrega_cliente'],
    entregue: ['entregue'],
  }

  const statusValidos = statusPorAba[abaAtual.value] || [abaAtual.value]
  return lista.filter((m) => statusValidos.includes(m.status))
})

// Tradutor amigável das strings armazenadas no banco
const formatarStatus = (status) =>
  ({
    em_estoque: 'Em Estoque',
    em_transito: 'Em Trânsito',
    aguardando_entrega_cliente: 'Link Emitido / Pendente',
    entregue: 'Entregue ao Cliente',
    despachada: 'Despachada para Coleta',
    carregado: 'Carregada - Em Trânsito',
    recebida_usada: 'Recebida na Unidade',
    disponivel: 'Disponível para Venda',
  })[status] || status

// Gerenciador de Paleta de Cores Quasar
const corDoStatus = (status) =>
  ({
    em_estoque: 'positive',
    em_transito: 'warning',
    aguardando_entrega_cliente: 'orange-8',
    entregue: 'green-10',
    despachada: 'orange-8',
    carregado: 'warning',
    recebida_usada: 'positive',
    disponivel: 'green-10',
  })[status] || 'grey'

// Inicialização e Validação de Sessão Unificada
onMounted(async () => {
  carregando.value = true

  try {
    const user = getAuth().currentUser

    if (user) {
      const docSnap = await getDoc(doc(db, 'usuarios', user.uid))
      if (docSnap.exists()) {
        const dados = docSnap.data()
        perfisUsuario.value = dados.perfis || []
        unidadeUsuario.value = dados.unidade || ''
      }
    }

    if (!perfisUsuario.value.length) {
      const cache = (await localforage.getItem('user_session')) || {}
      perfisUsuario.value = cache.perfis || []
      unidadeUsuario.value = cache.unidade || ''
    }

    await carregarUnidadesOptions()
    await carregarLinksEntrega()
    await carregarMaquinas()
  } catch (e) {
    console.error('Erro na inicialização:', e)
    $q.notify({ type: 'negative', message: 'Erro ao carregar dados do usuário.' })
  } finally {
    carregando.value = false
  }
})
</script>
