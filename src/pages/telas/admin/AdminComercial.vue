<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center justify-between q-mb-xl q-col-gutter-sm">
      <div class="row items-center q-gutter-sm">
        <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
        <div>
          <div class="text-h5 text-weight-bold">Checklists Comerciais</div>
          <div class="text-caption text-grey-5">
            Selecione o modelo de máquina para gerenciar as perguntas
          </div>
        </div>
      </div>

      <q-btn
        color="orange-8"
        text-color="black"
        label="Nova Máquina"
        icon="add"
        no-caps
        class="text-weight-bold q-px-md"
        @click="adicionarNovaMaquina"
      />
    </div>

    <div class="row q-col-gutter-md">
      <div v-for="(modelo, index) in modelos" :key="modelo.id" class="col-12 col-sm-4">
        <q-card class="bg-grey-9 text-white custom-card">
          <q-card-section class="q-pa-sm">
            <div class="row items-center no-wrap q-col-gutter-sm">
              <div class="col-auto">
                <q-avatar size="36px" color="grey-10" text-color="orange-8" class="icon-box">
                  <q-icon name="edit_note" />
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
                <div class="row items-center no-wrap q-gutter-xs">
                  <q-btn
                    flat
                    round
                    dense
                    color="red-5"
                    icon="delete"
                    @click.stop="solicitarExclusaoModelo(index)"
                  >
                    <q-tooltip class="bg-red text-white">Excluir Máquina</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    dense
                    color="orange-8"
                    label="Editar"
                    icon-right="arrow_forward"
                    @click="editarModelo(modelo.id)"
                  />
                </div>
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
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const $q = useQuasar()
const router = useRouter()
const modelos = ref([])

const formatarTitulo = (slug) => (slug ? slug.replace('_', ' ').replace('-', ' ') : '')

const obterDescricao = (m) =>
  ({
    distribuidor: 'Itens de verificação para distribuidores.',
    pulverizador: 'Itens de verificação para pulverizadores.',
    plantadeira: 'Itens de verificação para plantadeiras.',
    plataforma: 'Itens de verificação para plataformas de corte/milho.',
    carreta_graneleira: 'Itens de verificação para carretas graneleiras.',
    trator: 'Itens de verificação geral para tratores.',
  })[m] || `Itens de verificação para checklists de ${formatarTitulo(m)}.`

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
    console.error('Erro ao buscar modelos do Firebase:', e)
  } finally {
    $q.loading.hide()
  }
}

function editarModelo(modelo) {
  router.push(`/admin/editar/modelos_checklists/${modelo}`)
}

// ADICIONAR NOVA MÁQUINA COM VALIDAÇÃO
function adicionarNovaMaquina() {
  $q.dialog({
    dark: true,
    title: 'Adicionar Novo Modelo',
    message: 'Digite o nome do novo tipo de máquina (ex: Colheitadeira):',
    prompt: {
      model: '',
      type: 'text',
    },
    cancel: { label: 'Cancelar', color: 'grey-5', flat: true },
    ok: { label: 'Continuar', color: 'orange-8', flat: true },
    color: 'orange-8',
    persistent: true,
  }).onOk((nome) => {
    if (nome.trim()) {
      const slug = nome
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')

      const jaExiste = modelos.value.some((m) => m.id === slug)
      if (jaExiste) {
        $q.dialog({
          dark: true,
          title: 'Modelo Duplicado',
          message: `O modelo "${nome}" já existe no sistema. Escolha outro nome.`,
          color: 'orange-8',
          ok: { label: 'Fechar', color: 'orange-8', flat: true },
        })
        return
      }

      router.push(`/admin/editar/modelos_checklists/${slug}`)
    }
  })
}

// EXCLUIR DEFINITIVAMENTE DO BANCO DE DADOS
function solicitarExclusaoModelo(index) {
  const modeloAtual = modelos.value[index]

  $q.dialog({
    dark: true,
    title: '⚠️ Exclusão Permanente',
    message: `Tem certeza que deseja excluir o modelo "${modeloAtual.nome}" e todas as suas perguntas?\n\nEssa ação apagará tudo do banco de dados e não poderá ser desfeita.`,
    cancel: { label: 'Cancelar', color: 'grey-5', flat: true },
    ok: { label: 'Excluir Tudo', color: 'red-5', flat: true },
    color: 'red-5',
    persistent: true,
  }).onOk(async () => {
    $q.loading.show()
    try {
      await deleteDoc(doc(db, 'modelos_checklists', modeloAtual.id))
      modelos.value.splice(index, 1)

      $q.notify({
        icon: 'check_circle',
        message: 'Máquina excluída do banco de dados!',
        color: 'green-8',
        position: 'top-right',
      })
    } catch (error) {
      console.error('Erro ao excluir:', error)
      $q.notify({
        icon: 'error',
        message: 'Erro ao excluir do banco',
        color: 'red-8',
        position: 'top-right',
      })
    } finally {
      $q.loading.hide()
    }
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
