<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center justify-between q-mb-xl q-col-gutter-sm">
      <div class="row items-center q-gutter-sm">
        <q-btn flat round icon="arrow_back" color="orange-8" @click="$router.go(-1)" />
        <div>
          <div class="text-h5 text-weight-bold">Transferir Máquina</div>
          <div class="text-caption text-grey-5">Selecione o destino</div>
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <!-- Para Outra Unidade -->
      <div class="col-12 col-sm-6">
        <q-card
          clickable
          class="compact-card bg-grey-9 text-white"
          @click="
            navigator('/inicio/pos-venda/maquinas/transferir-selecionar', { tipo: 'unidade' })
          "
        >
          <q-card-section class="q-pa-md text-center">
            <q-icon name="warehouse" size="48px" color="orange-8" class="q-mb-sm" />
            <div class="text-h6 text-weight-bold text-orange-8">Outra Unidade</div>
            <div class="text-caption text-grey-5">Envie para Juína, Campo Novo, Tangará...</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Para Cliente -->
      <div class="col-12 col-sm-6">
        <q-card
          clickable
          class="compact-card bg-grey-9 text-white"
          @click="
            navigator('/inicio/pos-venda/maquinas/transferir-selecionar', { tipo: 'cliente' })
          "
        >
          <q-card-section class="q-pa-md text-center">
            <q-icon name="person_add" size="48px" color="orange-8" class="q-mb-sm" />
            <div class="text-h6 text-weight-bold text-orange-8">Venda ao Cliente</div>
            <div class="text-caption text-grey-5">Gerar checklist com link de assinatura</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const navigator = (path, query = null) => {
  if (query) router.push({ path, query })
  else router.push(path)
}
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
</style>
