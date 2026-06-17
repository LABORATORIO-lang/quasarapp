<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <!-- CABEÇALHO DA TELA -->
    <div class="row items-center q-gutter-sm q-mb-lg">
      <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
      <div>
        <div class="text-h5 text-weight-bold">Painel de Acesso</div>
        <div class="text-caption text-grey-5">Gerencie permissões e unidades dos usuários</div>
      </div>
    </div>

    <!-- BARRA DE BUSCA -->
    <q-input
      v-model="busca"
      label="Buscar por nome ou email"
      dark
      outlined
      dense
      color="orange-8"
      class="q-mb-xl shadow-2"
    >
      <template v-slot:append>
        <q-icon name="search" color="orange-8" />
      </template>
    </q-input>

    <!-- ESTADO DE CARREGAMENTO -->
    <div v-if="carregando" class="text-center q-mt-xl">
      <q-spinner color="orange-8" size="50px" />
      <div class="text-grey-5 q-mt-md">Buscando usuários...</div>
    </div>

    <!-- MENSAGEM SE NÃO ENCONTRAR NINGUÉM -->
    <div v-else-if="usuariosFiltrados.length === 0" class="text-center q-mt-xl">
      <q-icon name="person_off" size="64px" color="grey-7" />
      <div class="text-grey-5 text-h6 q-mt-sm">Nenhum usuário encontrado.</div>
    </div>

    <!-- LISTA DE USUÁRIOS (CARTÕES) -->
    <div v-else class="row q-col-gutter-md">
      <!-- Usamos col-12 para celular e col-md-6 para dividir em 2 colunas em telas maiores -->
      <div class="col-12 col-md-6" v-for="user in usuariosFiltrados" :key="user.uid">
        <q-card class="bg-grey-9 user-card shadow-4">
          <!-- SEÇÃO 1: NOME E ACESSO -->
          <q-card-section
            class="row items-center justify-between bg-grey-10"
            style="border-bottom: 1px solid #333"
          >
            <div>
              <div class="text-subtitle1 text-weight-bold text-orange-8">{{ user.nome }}</div>
              <div class="text-caption text-grey-5">{{ user.email }}</div>
            </div>

            <div class="row items-center q-gutter-sm">
              <span class="text-caption text-grey-4">Acesso Aprovado:</span>
              <q-toggle
                :model-value="user.acessoAprovado"
                color="green-5"
                size="md"
                @update:model-value="(val) => (user.acessoAprovado = val)"
              />
            </div>
          </q-card-section>

          <!-- SEÇÃO 2: PERFIS E UNIDADE -->
          <q-card-section class="q-pa-md">
            <div class="text-caption text-weight-bold text-grey-5 q-mb-sm text-uppercase">
              Perfis de Acesso (Deixe vazio para Somente Visualização)
            </div>

            <!-- Checkboxes dos Perfis -->
            <div class="row wrap q-gutter-sm q-mb-md">
              <q-checkbox
                v-for="p in perfisDisponiveis"
                :key="p.value"
                :model-value="(user.perfis || []).includes(p.value)"
                :label="p.label"
                color="orange-8"
                dark
                dense
                @update:model-value="(val) => togglePerfil(user, p.value, val)"
              />
            </div>

            <q-separator dark class="q-my-md" />

            <!-- Seleção de Unidade e Botão Salvar -->
            <div class="row items-center q-gutter-md justify-between">
              <div class="col-grow">
                <q-select
                  v-model="user.unidade"
                  :options="unidades"
                  label="Unidade de Operação"
                  dark
                  outlined
                  dense
                  color="orange-8"
                  bg-color="grey-10"
                />
              </div>

              <div>
                <q-btn
                  color="orange-8"
                  text-color="white"
                  icon="save"
                  label="Salvar"
                  :loading="user.salvando"
                  class="text-weight-bold shadow-2"
                  @click="salvarUsuario(user)"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import { useQuasar } from 'quasar'
import { useUnidades } from 'src/composables/useUnidades'

const $q = useQuasar()

// --- ESTADOS (Variáveis da Tela) ---
const busca = ref('')
const usuarios = ref([])
const carregando = ref(false)

const { unidades, carregarUnidades } = useUnidades()

// Lista de perfis que o administrador pode escolher
const perfisDisponiveis = [
  { label: 'Técnico', value: 'tecnico' },
  { label: 'Adm. Pós-Venda', value: 'adm_pos_venda' },
  { label: 'Vendedor', value: 'vendedor' },
  { label: 'Gerente Comercial', value: 'gerente_comercial' },
  { label: 'Gerente Pós-Venda', value: 'gerente_pos_venda' },
  { label: 'Master', value: 'master' },
  { label: 'Motorista', value: 'motorista' },
]

// --- LÓGICA DE FILTRO DA BUSCA ---
// --- LÓGICA DE FILTRO E ORDENAÇÃO ---
const usuariosFiltrados = computed(() => {
  let filtrados = usuarios.value

  // 1. Aplica o filtro se o usuário digitar algo na busca
  if (busca.value) {
    const termo = busca.value.toLowerCase()
    filtrados = filtrados.filter(
      (u) => u.nome?.toLowerCase().includes(termo) || u.email?.toLowerCase().includes(termo),
    )
  }

  // 2. Organiza a lista em ordem alfabética (A-Z) ignorando maiúsculas e minúsculas
  return filtrados.sort((a, b) => {
    const nomeA = (a.nome || '').trim().toLowerCase()
    const nomeB = (b.nome || '').trim().toLowerCase()
    return nomeA.localeCompare(nomeB)
  })
})

// --- CARREGAR USUÁRIOS DO FIREBASE ---
const carregarUsuarios = async () => {
  carregando.value = true
  try {
    const snapshot = await getDocs(collection(db, 'usuarios'))
    const lista = []
    snapshot.forEach((docSnap) => {
      lista.push({
        uid: docSnap.id,
        ...docSnap.data(),
        acessoAprovado: docSnap.data().acessoAprovado ?? false,
        perfis: docSnap.data().perfis || [], // Se não tiver perfil, inicia como array vazio
        unidade: docSnap.data().unidade || null,
        salvando: false,
      })
    })

    // Organiza a lista em ordem alfabética para ficar mais bonito
    lista.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
    usuarios.value = lista
  } catch (e) {
    console.error('Erro ao carregar usuários:', e)
    $q.notify({ type: 'negative', message: 'Erro ao carregar usuários do banco de dados.' })
  } finally {
    carregando.value = false
  }
}

// --- MARCAR E DESMARCAR PERFIS ---
const togglePerfil = (user, perfil, ativo) => {
  if (!user.perfis) user.perfis = []
  if (ativo) {
    // Adiciona o perfil ao array
    if (!user.perfis.includes(perfil)) user.perfis.push(perfil)
  } else {
    // Remove o perfil do array
    user.perfis = user.perfis.filter((p) => p !== perfil)
  }
}

// --- SALVAR ALTERAÇÕES NO FIREBASE ---
const salvarUsuario = async (user) => {
  // Verificação de segurança: a unidade ainda é obrigatória
  if (!user.unidade) {
    $q.notify({ type: 'warning', message: 'Por favor, selecione a unidade do usuário.' })
    return
  }

  // NOTA: Removemos a obrigatoriedade de ter um perfil.
  // Agora, se user.perfis estiver vazio, ele será salvo normalmente (modo somente leitura).

  user.salvando = true
  try {
    // Atualiza apenas os campos necessários no Firestore
    await updateDoc(doc(db, 'usuarios', user.uid), {
      unidade: user.unidade,
      perfis: user.perfis || [], // Garante que salva um array vazio se não houver marcação
      acessoAprovado: user.acessoAprovado,
    })

    $q.notify({ type: 'positive', message: `Permissões de ${user.nome} atualizadas com sucesso!` })
  } catch (e) {
    console.error('Erro ao salvar usuário:', e)
    $q.notify({ type: 'negative', message: 'Falha ao salvar as alterações.' })
  } finally {
    user.salvando = false
  }
}

// --- CICLO DE VIDA (Quando a tela abre) ---
onMounted(async () => {
  await carregarUnidades()
  await carregarUsuarios()
})
</script>

<style scoped>
/* Estilo para dar um efeito elegante aos cartões de usuário */
.user-card {
  border-radius: 12px;
  border: 1px solid #424242;
  transition: all 0.3s ease;
}

/* Efeito ao passar o mouse (hover) apenas em telas maiores */
@media (min-width: 1024px) {
  .user-card:hover {
    border-color: #e65100;
    box-shadow: 0 4px 15px rgba(230, 81, 0, 0.2);
    transform: translateY(-2px);
  }
}
</style>
