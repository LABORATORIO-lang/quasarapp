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

    <div class="row q-col-gutter-md">
      <div v-for="modelo in modelos" :key="modelo.id" class="col-12 col-sm-4">
        <q-card class="bg-grey-9 text-white custom-card" clickable @click="iniciarChecklist(modelo.id)">
          <q-card-section class="q-pa-sm">
            <div class="row items-center no-wrap q-col-gutter-sm">
              <div class="col-auto">
                <q-avatar size="36px" color="grey-10" text-color="orange-8" class="icon-box">
                  <q-icon name="assignment" />
                </q-avatar>
              </div>
              <div class="col">
                <div class="text-subtitle1 text-weight-bold text-capitalize text-orange-8">
                  {{ modelo.nome }}
                </div>
                <div class="text-caption text-grey-5 card-description">
                  {{ obterDescricao(modelo.id) }}
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
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { collection, getDocs } from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import localforage from 'localforage' // <-- IMPORTANTE: Adicionado para podermos aceder à memória

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

// <-- AQUI ESTÁ A MÁGICA: Transformei em "async" e coloquei a vassoura
const iniciarChecklist = async (idModelo) => {
  // 1. A VASSOURA: Limpa as gavetas de assinaturas antigas
  await localforage.removeItem('assinatura_vendedor')
  await localforage.removeItem('assinatura_cliente')
  await localforage.removeItem('assinatura_tecnico')

  // 2. Agora sim, viaja para o checklist novinho em folha
  router.push(`/inicio/comercial/checklist/formulario/${idModelo}`)
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
