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
      <div v-for="categoria in categorias" :key="categoria.id" class="col-12 col-sm-4">
        <q-card
          class="bg-grey-9 text-white custom-card"
          clickable
          @click="editarCategoria(categoria.id)"
        >
          <q-card-section class="q-pa-sm">
            <div class="row items-center no-wrap q-col-gutter-sm">
              <div class="col-auto">
                <q-avatar size="36px" color="grey-10" text-color="orange-8" class="icon-box">
                  <q-icon name="agriculture" />
                </q-avatar>
              </div>
              <div class="col">
                <div class="text-subtitle1 text-weight-bold text-capitalize">
                  {{ categoria.nome }}
                </div>
                <div class="text-caption text-grey-5 card-description">
                  {{ categoria.maquinas?.length || 0 }} máquinas |
                  {{ categoria.secoes?.length || 0 }} seções
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="edit" color="orange-8" size="20px" />
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

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { collection, getDocs } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const $q = useQuasar()
const router = useRouter()
const categorias = ref([])

const carregarCategorias = async () => {
  $q.loading.show()
  try {
    const querySnapshot = await getDocs(collection(db, 'checklists_starpes'))
    const lista = []
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data()
      lista.push({
        id: docSnap.id,
        nome: data.nome || docSnap.id,
        maquinas: data.maquinas || [],
        secoes: data.secoes || [],
      })
    })
    categorias.value = lista
  } catch (e) {
    console.error('Erro ao buscar categorias:', e)
    $q.notify({ type: 'negative', message: 'Erro ao carregar categorias do Firebase.' })
  } finally {
    $q.loading.hide()
  }
}

const editarCategoria = (id) => {
  router.push(`/admin/editar/checklists_starpes/${id}`)
}

const adicionarCategoria = () => {
  $q.notify({ type: 'info', message: 'Funcionalidade em desenvolvimento.' })
}

onMounted(carregarCategorias)
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
