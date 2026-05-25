<template>
  <q-page class="bg-grey-10 flex flex-center">
    <div class="q-pa-md full-width" style="max-width: 400px">
      <div class="text-h5 text-white text-weight-bold q-mb-xl text-center">Checklist</div>

      <div class="column q-gutter-md">
        <q-btn
          size="lg"
          color="orange-8"
          icon="add"
          label="Novo Checklist"
          class="full-width q-py-md text-bold"
          rounded
          @click="abrirSelecao"
        />

        <q-btn
          outline
          size="lg"
          color="orange-8"
          icon="pending"
          label="Em Andamento"
          class="full-width q-py-md text-bold"
          rounded
          @click="router.push('/inicio/comercial/checklist/rascunhos')"
        />
        <q-btn
          flat
          color="grey-5"
          icon="history"
          label="Histórico"
          class="full-width"
          @click="router.push('/inicio/comercial/checklist/historico')"
        />
      </div>

      <q-dialog v-model="mostrarModal">
        <q-card class="bg-grey-9 text-white" style="width: 300px">
          <q-card-section>
            <div class="text-h6">Selecione o Equipamento</div>
          </q-card-section>

          <q-card-section class="q-gutter-sm">
            <q-btn
              label="Pulverizador"
              color="orange-8"
              class="full-width"
              @click="iniciar('PULVERIZADOR')"
            />
            <q-btn
              label="Plantio"
              color="orange-8"
              class="full-width"
              @click="iniciar('PLANTIO')"
            />
            <q-btn
              label="Distribuidor"
              color="orange-8"
              class="full-width"
              @click="iniciar('DISTRIBUIDOR')"
            />
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useChecklistStore } from 'src/stores/checklist-store'

const router = useRouter()
const store = useChecklistStore()
const mostrarModal = ref(false) // Variável reativa para o modal

// Função explícita para abrir
function abrirSelecao() {
  mostrarModal.value = true
}

function iniciar(tipo) {
  store.setTipo(tipo)
  mostrarModal.value = false // Fecha o modal
  router.push('/inicio/comercial/checklist/formulario')
}
</script>
