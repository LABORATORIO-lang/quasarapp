<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center q-mb-xl q-gutter-sm">
      <q-btn flat round icon="arrow_back" color="blue-5" @click="$router.go(-1)" />
      <div>
        <div class="text-h5 text-weight-bold">Checklists Pós-Venda</div>
        <div class="text-caption text-grey-5">
          Selecione o modelo para gerenciar os itens de entrega técnica.
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-sm-4">
        <q-card class="bg-grey-9 text-white custom-card column justify-between">
          <q-card-section class="q-pa-lg col">
            <div class="row justify-between items-center q-mb-md">
              <q-avatar size="48px" color="grey-10" text-color="blue-5" class="icon-box-blue">
                <q-icon name="support_agent" />
              </q-avatar>
            </div>
            <div class="text-h6 text-weight-bold">Entrega Técnica</div>
            <div class="text-caption text-grey-5 q-mt-xs">Itens para entrega ao cliente.</div>
          </q-card-section>
          <q-separator color="grey-8" />
          <q-card-actions align="right" class="bg-grey-10 q-pa-sm">
            <q-btn
              flat
              color="blue-5"
              label="EDITAR ITENS"
              icon-right="edit"
              @click="editarModelo('entrega_tecnica')"
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
  border-color: #2196f3;
}
.icon-box-blue {
  border: 1px solid #2196f3;
}
</style>
