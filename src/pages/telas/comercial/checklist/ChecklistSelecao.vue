<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center justify-between q-mb-xl q-col-gutter-sm">
      <div class="row items-center q-gutter-sm">
        <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
        <div>
          <div class="text-h5 text-weight-bold">
            {{ isRevisao ? 'Máquina para Revisão' : 'Selecione o Equipamento' }}
          </div>
          <div class="text-caption text-grey-5">
            Escolha qual modelo de máquina você vai
            {{ isRevisao ? 'receber para revisão' : 'iniciar a vistoria' }}
          </div>
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div v-for="modelo in modelos" :key="modelo.id" class="col-12 col-sm-4">
        <q-card
          class="bg-grey-9 text-white custom-card"
          clickable
          @click="iniciarChecklist(modelo.id)"
        >
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
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { collection, getDocs } from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import localforage from 'localforage'

const $q = useQuasar()
const router = useRouter()
const route = useRoute() // <-- Adicionado para ler a URL
const modelos = ref([])

// Variável que checa se estamos no modo de revisão
const isRevisao = computed(() => route.query.modo === 'revisao')

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

const iniciarChecklist = async (idModelo) => {
  // Limpa as gavetas de assinaturas antigas
  await localforage.removeItem('assinatura_vendedor')
  await localforage.removeItem('assinatura_cliente')
  await localforage.removeItem('assinatura_tecnico')

  // DESVIO INTELIGENTE DE ROTA:
  if (isRevisao.value) {
    // Se for modo revisão, manda para a tela nova que criamos, passando o modelo na URL
    router.push(`/inicio/maquinas/revisao?modelo=${idModelo}`)
  } else {
    // Se for o fluxo normal do comercial, mantém a rota antiga
    router.push(`/inicio/comercial/checklist/formulario/${idModelo}`)
  }
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
