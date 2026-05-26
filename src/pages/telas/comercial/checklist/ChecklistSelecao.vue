<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center justify-between q-mb-xl q-col-gutter-sm">
      <div class="row items-center q-gutter-sm">
        <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
        <div>
          <div class="text-h5 text-weight-bold">Selecione o Equipamento</div>
          <div class="text-caption text-grey-5">
            Escolha uma das máquinas cadastradas para iniciar a vistoria
          </div>
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div v-for="modelo in modelos" :key="modelo.id" class="col-12 col-sm-4">
        <q-card class="bg-grey-9 text-white custom-card column justify-between">
          <q-card-section class="q-pa-lg col column justify-center">
            <div class="text-h5 text-weight-bolder text-capitalize text-orange-8 q-mb-sm">
              {{ modelo.nome }}
            </div>
            <div class="text-subtitle2 text-grey-5" style="line-height: 1.4">
              {{ obterDescricao(modelo.id) }}
            </div>
          </q-card-section>

          <q-separator color="grey-8" />

          <q-card-actions align="right" class="bg-grey-10 q-pa-sm">
            <q-btn
              flat
              color="orange-8"
              label="FAZER CHECKLIST"
              icon-right="assignment"
              @click="iniciarChecklist(modelo.id)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
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
const modelos = ref([])

const formatarTitulo = (slug) => (slug ? slug.replace('_', ' ').replace('-', ' ') : '')

const obterDescricao = (m) =>
  ({
    distribuidor: 'Checklist completo para inspeção de distribuidores.',
    pulverizador: 'Checklist completo para inspeção de pulverizadores.',
    plantadeira: 'Checklist completo para inspeção de plantadeiras.',
    plataforma: 'Checklist completo para plataformas de corte/milho.',
    trator: 'Checklist completo para tratores.',
  })[m] || `Clique para responder as perguntas de ${formatarTitulo(m)}.`

const carregarModelos = async () => {
  $q.loading.show()
  try {
    const querySnapshot = await getDocs(collection(db, 'modelos_checklists'))
    const lista = []
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data()
      lista.push({
        id: docSnap.id,
        nome: data.nome || formatarTitulo(docSnap.id),
      })
    })
    modelos.value = lista
  } catch (e) {
    console.error('Erro ao buscar modelos:', e)
  } finally {
    $q.loading.hide()
  }
}

function iniciarChecklist(idModelo) {
  // Redireciona passando o ID da máquina diretamente na URL
  router.push(`/inicio/comercial/checklist/formulario/${idModelo}`)
}

onMounted(carregarModelos)
</script>

<style scoped>
.custom-card {
  border: 1px solid #424242;
  border-radius: 12px;
  overflow: hidden;
  transition:
    transform 0.2s,
    border-color 0.2s;
  height: 185px !important;
}
.custom-card:hover {
  transform: translateY(-4px);
  border-color: #ff9800;
}
</style>
