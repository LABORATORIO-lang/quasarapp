<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <!-- Cabeçalho -->
    <div class="row items-center q-mb-xl q-gutter-sm">
      <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
      <q-icon name="assignment_turned_in" size="40px" color="green-5" />
      <div>
        <div class="text-h5 text-weight-bold">Admin Starpes</div>
        <div class="text-caption text-grey-5">
          Gerenciamento de categorias, máquinas e itens do checklist Starpes
        </div>
      </div>
    </div>

    <!-- Lista de Categorias -->
    <div class="text-subtitle1 text-weight-bold text-orange-8 q-mb-md row items-center q-gutter-sm">
      <q-icon name="category" />
      <span>Categorias do Checklist</span>
    </div>

    <div class="row q-col-gutter-md">
      <div v-for="(categoria, index) in categorias" :key="categoria.id" class="col-12 col-sm-4">
        <q-card class="bg-grey-9 text-white custom-card">
          <q-card-section class="q-pa-sm">
            <div class="row items-center no-wrap">
              <div class="col" @click="editarCategoria(categoria.id)" style="cursor: pointer">
                <div class="text-subtitle1 text-weight-bold text-orange-8">
                  {{ categoria.nome }}
                </div>
                <div class="text-caption text-grey-5">
                  {{ categoria.secoes?.length || 0 }} seções cadastradas
                </div>
              </div>

              <div class="col-auto row q-gutter-xs">
                <q-btn
                  flat
                  round
                  dense
                  color="red-5"
                  icon="delete"
                  size="sm"
                  @click="solicitarExclusaoCategoria(index)"
                >
                  <q-tooltip>Excluir</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="orange-8"
                  icon="edit"
                  size="sm"
                  @click="editarCategoria(categoria.id)"
                >
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Botão Adicionar Categoria -->
    <q-btn
      color="orange-8"
      icon="add"
      label="Adicionar Categoria"
      class="q-mt-lg"
      @click="adicionarCategoria"
    />
  </q-page>
</template>
// Substitua o seu script setup em AdminStarpes.vue por este:

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const $q = useQuasar()
const router = useRouter()
const modelos = ref([]) // Unificado para o nome 'modelos'

const carregarModelos = async () => {
  $q.loading.show()
  try {
    const querySnapshot = await getDocs(collection(db, 'modelos_starpes'))
    const lista = []
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data()
      lista.push({
        id: docSnap.id,
        nome: data.tipo_maquina || 'Modelo sem nome',
      })
    })
    modelos.value = lista
  } catch (e) {
    console.error('Erro ao buscar modelos:', e)
  } finally {
    $q.loading.hide()
  }
}

const editarModelo = (idModelo) => {
  // Aponta para a nossa rota de edição de modelos
  router.push(`/admin/editar/modelos_starpes/${idModelo}`)
}

const adicionarNovaMaquina = () => {
  $q.dialog({
    dark: true,
    title: 'Novo Modelo de Máquina',
    message: 'Digite o nome da nova máquina (ex: Pulverizador):',
    prompt: { model: '', type: 'text' },
    cancel: true,
    ok: { label: 'Continuar', color: 'orange-8', flat: true },
    persistent: true,
  }).onOk((nome) => {
    if (nome.trim()) {
      const slug = nome.trim().toLowerCase().replace(/\s+/g, '_')
      router.push(`/admin/editar/modelos_starpes/${slug}`)
    }
  })
}

const solicitarExclusaoModelo = (index) => {
  const modelo = modelos.value[index]
  $q.dialog({
    dark: true,
    title: 'Excluir Modelo',
    message: `Excluir "${modelo.nome}" permanentemente?`,
    cancel: true,
    ok: { label: 'Excluir', color: 'red-5', flat: true },
  }).onOk(async () => {
    await deleteDoc(doc(db, 'modelos_starpes', modelo.id))
    modelos.value.splice(index, 1)
  })
}

onMounted(carregarModelos)
</script>

<style scoped>
.custom-card {
  border: 1px solid #333;
  border-radius: 8px;
  transition:
    transform 0.2s,
    border-color 0.2s;
  cursor: pointer;
}
.custom-card:hover {
  border-color: #ff9800;
}
.icon-box {
  border: 1px solid #ff9800;
}
.card-description {
  line-height: 1.35;
}
</style>
