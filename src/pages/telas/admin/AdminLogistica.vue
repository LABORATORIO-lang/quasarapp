<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center q-mb-xl q-gutter-sm">
      <q-btn flat round icon="arrow_back" color="green-5" @click="$router.go(-1)" />
      <div>
        <div class="text-h5 text-weight-bold">Checklists Logística</div>
        <div class="text-caption text-grey-5">
          Selecione o modelo para gerenciar os itens de transporte.
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-sm-4">
        <q-card class="bg-grey-9 text-white custom-card column justify-between">
          <q-card-section class="q-pa-lg col">
            <div class="row justify-between items-center q-mb-md">
              <q-avatar size="48px" color="grey-10" text-color="green-5" class="icon-box-green">
                <q-icon name="local_shipping" />
              </q-avatar>
            </div>
            <div class="text-h6 text-weight-bold">Transporte</div>
            <div class="text-caption text-grey-5 q-mt-xs">Itens de verificação de frete.</div>
          </q-card-section>
          <q-separator color="grey-8" />
          <q-card-actions align="right" class="bg-grey-10 q-pa-sm">
            <q-btn
              flat
              color="green-5"
              label="EDITAR ITENS"
              icon-right="edit"
              @click="editarModelo('transporte')"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
function editarModelo(modelo) {
  // Envia: Coleção = 'checklistlogistica' | Modelo = 'transporte'
  router.push(`/admin/editar/checklistlogistica/${modelo}`)
}
</script>

<style scoped>
.custom-card {
  border: 1px solid #424242;
  border-radius: 12px;
  height: 280px !important;
}
.custom-card:hover {
  transform: translateY(-4px);
  border-color: #4caf50;
}
.icon-box-green {
  border: 1px solid #4caf50;
}
</style>
