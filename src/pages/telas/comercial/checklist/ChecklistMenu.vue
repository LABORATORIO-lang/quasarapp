<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center justify-between q-mb-xl q-col-gutter-sm">
      <div class="row items-center q-gutter-sm">
        <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
        <div>
          <div class="text-h5 text-weight-bold">Checklist Comercial</div>
          <div class="text-caption text-grey-5">
            Inicie novas vistorias ou gerencie seus relatórios
          </div>
        </div>
      </div>
    </div>

    <div class="column q-gutter-sm">
      <q-card
        clickable
        class="compact-card bg-grey-9 text-white"
        @click="router.push('/inicio/comercial/checklist/selecionar')"
      >
        <q-card-section class="row items-center no-wrap q-pa-sm">
          <q-avatar size="36px" color="grey-10" text-color="orange-8" class="icon-box">
            <q-icon name="note_add" size="20px" />
          </q-avatar>
          <div class="q-ml-md col">
            <div class="text-subtitle1 text-weight-bold text-orange-8">Novo Checklist</div>
            <div class="text-caption text-grey-5">
              Inicie uma nova vistoria selecionando o equipamento
            </div>
          </div>
          <q-icon name="chevron_right" color="grey-6" size="24px" />
        </q-card-section>
      </q-card>

      <q-card
        clickable
        class="compact-card bg-grey-9 text-white"
        @click="router.push('/inicio/comercial/checklist/rascunhos')"
      >
        <q-card-section class="row items-center no-wrap q-pa-sm">
          <q-avatar size="36px" color="grey-10" text-color="orange-8" class="icon-box">
            <q-icon name="pending_actions" size="20px" />
          </q-avatar>
          <div class="q-ml-md col">
            <div class="text-subtitle1 text-weight-bold text-orange-8">Em Andamento</div>
            <div class="text-caption text-grey-5">
              Continue rascunhos que ainda não foram finalizados
            </div>
          </div>
          <q-icon name="chevron_right" color="grey-6" size="24px" />
        </q-card-section>
      </q-card>
      <q-card
        clickable
        class="compact-card bg-grey-9 text-white"
        @click="router.push('/inicio/historico/comercial')"
      >
        <q-card-section class="row items-center no-wrap q-pa-sm">
          <q-avatar size="36px" color="grey-10" text-color="orange-8" class="icon-box">
            <q-icon name="history" size="20px" />
          </q-avatar>
          <div class="q-ml-md col">
            <div class="text-subtitle1 text-weight-bold text-orange-8">Histórico</div>
            <div class="text-caption text-grey-5">
              Acesse checklists antigos e relatórios finalizados
            </div>
          </div>
          <q-icon name="chevron_right" color="grey-6" size="24px" />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import localforage from 'localforage'

const router = useRouter()
const perfisUsuario = ref([])

onMounted(async () => {
  const sessao = await localforage.getItem('user_session')
  if (sessao && sessao.perfis) {
    perfisUsuario.value = sessao.perfis
  }
})
</script>

<style scoped>
.compact-card {
  border: 1px solid #333;
  border-radius: 8px;
  transition: border-color 0.2s;
}

.compact-card:hover {
  border-color: #ff9800;
}

.icon-box {
  border: 1px solid #ff9800;
}
</style>
