<template>
  <q-page class="bg-grey-10 text-white q-pa-md">
    <component :is="currentForm" @salvar="processarSalvamento" />
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useChecklistStore } from 'src/stores/checklist-store'
import PulverizadorForm from './components/PulverizadorForm.vue'
import PlantioForm from './components/PlantioForm.vue'
import DistribuidorForm from './components/DistribuidorForm.vue'

const store = useChecklistStore()

const currentForm = computed(() => {
  switch (store.tipoChecklist) {
    case 'PULVERIZADOR':
      return PulverizadorForm
    case 'PLANTIO':
      return PlantioForm
    case 'DISTRIBUIDOR':
      return DistribuidorForm
    default:
      return null
  }
})

function processarSalvamento(dados) {
  console.log('Dados recebidos do form:', dados)
  // Lógica de persistência aqui
}
</script>
