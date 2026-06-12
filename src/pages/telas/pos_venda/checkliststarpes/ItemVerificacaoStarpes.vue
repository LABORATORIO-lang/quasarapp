<template>
  <div class="pdf-no-break">
    <q-card-section class="q-py-md">
      <div class="text-orange-8 text-weight-bold q-mb-sm">{{ index + 1 }}. {{ item.texto }}</div>

      <!-- Toggle R / A / V -->
      <div class="row q-gutter-xs">
        <q-btn
          flat
          no-caps
          class="col rounded-borders pdf-status-btn"
          :class="item.resposta === 'R' ? 'bg-red-7 text-white' : 'bg-grey-8 text-white'"
          label="R"
          @click="toggleResposta('R')"
        >
          <q-tooltip>Reparo Imediato</q-tooltip>
        </q-btn>
        <q-btn
          flat
          no-caps
          class="col rounded-borders pdf-status-btn"
          :class="item.resposta === 'A' ? 'bg-yellow-8 text-black' : 'bg-grey-8 text-white'"
          label="A"
          @click="toggleResposta('A')"
        >
          <q-tooltip>Reparo Futuro</q-tooltip>
        </q-btn>
        <q-btn
          flat
          no-caps
          class="col rounded-borders pdf-status-btn"
          :class="item.resposta === 'V' ? 'bg-green-7 text-white' : 'bg-grey-8 text-white'"
          label="V"
          @click="toggleResposta('V')"
        >
          <q-tooltip>OK</q-tooltip>
        </q-btn>
      </div>

      <!-- Campo Observação -->
      <q-input
        :model-value="item.observacao"
        @update:model-value="atualizarCampo('observacao', $event)"
        label="Observação"
        dark
        outlined
        dense
        color="orange-8"
        class="q-mt-sm pdf-input"
      />
    </q-card-section>

    <q-separator color="grey-8" class="pdf-separator" />
  </div>
</template>

<script setup>
const props = defineProps({
  item: Object,
  index: Number,
})

const emit = defineEmits(['alteracao', 'update:item'])

const atualizarCampo = (campo, valor) => {
  const novoItem = { ...props.item, [campo]: valor }
  emit('update:item', novoItem)
  emit('alteracao')
}

// Toggle: clica para marcar, clica de novo para desmarcar
const toggleResposta = (res) => {
  if (props.item.resposta === res) {
    atualizarCampo('resposta', null)
  } else {
    atualizarCampo('resposta', res)
  }
}
</script>
