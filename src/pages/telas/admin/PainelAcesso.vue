<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center q-gutter-sm q-mb-lg">
      <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
      <div>
        <div class="text-h5 text-weight-bold">Painel de Acesso</div>
        <div class="text-caption text-grey-5">Gerencie permissões dos usuários</div>
      </div>
    </div>

    <q-input
      v-model="busca"
      label="Buscar por nome ou email"
      dark
      outlined
      dense
      color="orange-8"
      class="q-mb-md"
    >
      <template v-slot:append>
        <q-icon name="search" color="orange-8" />
      </template>
    </q-input>

    <div v-if="carregando" class="text-center q-mt-xl">
      <q-spinner color="orange-8" size="40px" />
    </div>

    <div v-else-if="usuariosFiltrados.length === 0" class="text-center q-mt-xl">
      <q-icon name="person_off" size="48px" color="grey-6" />
      <div class="text-grey-5 q-mt-sm">Nenhum usuário encontrado.</div>
    </div>

    <div v-else class="column q-gutter-sm">
      <q-card
        v-for="user in usuariosFiltrados"
        :key="user.uid"
        class="bg-grey-9"
        style="border-radius: 8px; border: 1px solid #424242"
      >
        <q-card-section class="q-pa-sm">
          <!-- Cabeçalho: nome + toggle -->
          <div class="row items-center justify-between q-mb-xs">
            <div>
              <span class="text-subtitle2 text-weight-bold text-orange-8">{{ user.nome }}</span>
              <span class="text-caption text-grey-5 q-ml-sm">{{ user.email }}</span>
            </div>
            <div class="row items-center q-gutter-xs">
              <q-icon v-if="user.salvo" name="check_circle" color="green" size="20px" />
              <q-toggle
                :model-value="user.acessoAprovado"
                color="green"
                dense
                @update:model-value="(val) => (user.acessoAprovado = val)"
              />
            </div>
          </div>

          <!-- Campos -->
          <div class="row q-col-gutter-sm items-center">
            <!-- Perfis (checkboxes) -->
            <div class="col-12 col-sm-8">
              <div class="text-caption text-grey-4 q-mb-xs">Perfis:</div>
              <div class="row q-gutter-sm">
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
            </div>

            <!-- Unidade -->
            <div class="col-12 col-sm-3">
              <q-select
                v-model="user.unidade"
                :options="unidades"
                label="Unidade"
                dark
                outlined
                dense
                color="orange-8"
              />
            </div>

            <!-- Salvar -->
            <div class="col-12 col-sm-1 flex items-center justify-center">
              <q-btn
                round
                dense
                icon="save"
                color="orange-8"
                size="sm"
                :loading="user.salvando"
                @click="salvarUsuario(user)"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
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
const busca = ref('')
const usuarios = ref([])
const carregando = ref(false)

const { unidades, carregarUnidades } = useUnidades()

const perfisDisponiveis = [
  { label: 'Técnico', value: 'tecnico' },
  { label: 'Adm. Pós-Venda', value: 'adm_pos_venda' },
  { label: 'Vendedor', value: 'vendedor' },
  { label: 'Gerente Comercial', value: 'gerente_comercial' },
  { label: 'Gerente Pós-Venda', value: 'gerente_pos_venda' },
  { label: 'Master', value: 'master' },
  { label: 'Motorista', value: 'motorista' },
]

const usuariosFiltrados = computed(() => {
  if (!busca.value) return usuarios.value
  const termo = busca.value.toLowerCase()
  return usuarios.value.filter(
    (u) => u.nome?.toLowerCase().includes(termo) || u.email?.toLowerCase().includes(termo),
  )
})

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
        perfis: docSnap.data().perfis || [],
        unidade: docSnap.data().unidade || null,
        salvando: false,
        salvo: false,
      })
    })
    usuarios.value = lista
  } catch (e) {
    console.error('Erro ao carregar usuários:', e)
    $q.notify({ type: 'negative', message: 'Erro ao carregar usuários.' })
  } finally {
    carregando.value = false
  }
}

const togglePerfil = (user, perfil, ativo) => {
  if (!user.perfis) user.perfis = []
  if (ativo) {
    if (!user.perfis.includes(perfil)) user.perfis.push(perfil)
  } else {
    user.perfis = user.perfis.filter((p) => p !== perfil)
  }
}

const salvarUsuario = async (user) => {
  if (!user.unidade) {
    $q.notify({ type: 'warning', message: 'Selecione a unidade.' })
    return
  }
  if (!user.perfis || user.perfis.length === 0) {
    $q.notify({ type: 'warning', message: 'Selecione ao menos um perfil.' })
    return
  }

  user.salvando = true
  try {
    await updateDoc(doc(db, 'usuarios', user.uid), {
      unidade: user.unidade,
      perfis: user.perfis,
      acessoAprovado: user.acessoAprovado,
    })

    user.salvo = true
    setTimeout(() => {
      user.salvo = false
    }, 2000)

    $q.notify({ type: 'positive', message: `${user.nome} salvo!` })
  } catch (e) {
    console.error('Erro ao salvar:', e)
    $q.notify({ type: 'negative', message: 'Erro ao salvar.' })
  } finally {
    user.salvando = false
  }
}

onMounted(async () => {
  await carregarUnidades()
  await carregarUsuarios()
})
</script>
