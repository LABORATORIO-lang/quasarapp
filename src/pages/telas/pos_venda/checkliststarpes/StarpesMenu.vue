<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <!-- Cabeçalho com Botão de Voltar -->
    <div class="row items-center justify-between q-mb-xl q-col-gutter-sm">
      <div class="row items-center q-gutter-sm">
        <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
        <div>
          <div class="text-h5 text-weight-bold">Checklist Starpes</div>
          <div class="text-caption text-grey-5">
            Selecione a categoria de inspeção
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de Categorias -->
    <div class="row q-col-gutter-md">
      <div v-for="categoria in categorias" :key="categoria.id" class="col-12 col-sm-6">
        <q-card
          class="bg-grey-9 text-white custom-card"
          clickable
          @click="iniciarChecklist(categoria.id)"
        >
          <q-card-section class="q-pa-sm">
            <div class="row items-center no-wrap q-col-gutter-sm">
              <div class="col-auto">
                <q-avatar size="36px" color="grey-10" text-color="orange-8" class="icon-box">
                  <q-icon name="assignment_turned_in" />
                </q-avatar>
              </div>
              <div class="col">
                <div class="text-subtitle1 text-weight-bold text-capitalize text-orange-8">
                  {{ categoria.nome }}
                </div>
                <div class="text-caption text-grey-5 card-description">
                  {{ categoria.descricao || 'Inspeção Starpes' }}
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="arrow_forward" color="orange-8" size="20px" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Loading -->
    <q-inner-loading :showing="loading" color="orange-8" />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { collection, getDocs } from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import localforage from 'localforage'

const $q = useQuasar()
const router = useRouter()
const categorias = ref([])
const loading = ref(false)

const carregarCategorias = async () => {
  loading.value = true
  try {
    const querySnapshot = await getDocs(collection(db, 'checklists_starpes'))
    const lista = []
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data()
      lista.push({
        id: docSnap.id,
        nome: data.nome || docSnap.id,
        descricao: data.descricao || `Checklist de inspeção para ${data.nome || docSnap.id}`,
      })
    })
    // Ordenar alfabeticamente
    lista.sort((a, b) => a.nome.localeCompare(b.nome))
    categorias.value = lista
  } catch (e) {
    console.error('Erro ao buscar categorias:', e)
    $q.notify({ type: 'negative', message: 'Erro ao carregar categorias do Firebase.' })
  } finally {
    loading.value = false
  }
}

const iniciarChecklist = async (idCategoria) => {
  // Limpa assinaturas antigas
  await localforage.removeItem('starpes_assinatura_tecnico')
  await localforage.removeItem('starpes_assinatura_cliente')

  // Vai pro formulário da categoria escolhida
  router.push(`/inicio/pos-venda/starpes/formulario/${idCategoria}`)
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
