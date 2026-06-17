<template>
  <div class="pdf-no-break">
    <q-card-section class="q-py-md">
      <div class="text-orange-8 text-weight-bold q-mb-sm">
        {{ index + 1 }}. {{ item.texto }}
        <span v-if="item.obrigatorio" class="text-red-5 q-ml-xs">*</span>
      </div>

      <div class="row q-gutter-xs">
        <template v-if="item.tipo === 'TRAFFIC_LIGHT'">
          <q-btn
            flat
            no-caps
            class="col rounded-borders pdf-status-btn"
            :class="item.resposta === 'BOM' ? 'bg-green-7 text-white' : 'bg-grey-8 text-white'"
            label="Bom"
            @click="setResposta('BOM')"
          />
          <q-btn
            flat
            no-caps
            class="col rounded-borders pdf-status-btn"
            :class="item.resposta === 'ATENCAO' ? 'bg-yellow-8 text-black' : 'bg-grey-8 text-white'"
            label="Atenção"
            @click="setResposta('ATENCAO')"
          />
          <q-btn
            flat
            no-caps
            class="col rounded-borders pdf-status-btn"
            :class="item.resposta === 'RUIM' ? 'bg-red-7 text-white' : 'bg-grey-8 text-white'"
            label="Ruim"
            @click="setResposta('RUIM')"
          />
        </template>
        <template v-else>
          <q-btn
            flat
            no-caps
            class="col rounded-borders pdf-status-btn"
            :class="item.resposta === 'SIM' ? 'bg-green-7 text-white' : 'bg-grey-8 text-white'"
            label="SIM"
            @click="setResposta('SIM')"
          />
          <q-btn
            flat
            no-caps
            class="col rounded-borders pdf-status-btn"
            :class="item.resposta === 'NAO' ? 'bg-red-7 text-white' : 'bg-grey-8 text-white'"
            label="NÃO"
            @click="setResposta('NAO')"
          />
        </template>
      </div>

      <div v-if="precisaDeFoto" class="q-mt-md hide-on-pdf">
        <q-btn
          color="orange-8"
          icon="add_a_photo"
          label="ADICIONAR FOTO"
          class="full-width"
          @click="showPhotoDialog = true"
        />
        <input
          type="file"
          accept="image/*"
          :id="'file-input-' + index"
          style="display: none"
          @change="fotosSelecionadas"
        />

        <div class="row q-gutter-sm q-mt-sm">
          <div v-for="(foto, i) in item.fotos" :key="i" style="position: relative">
            <q-img :src="foto" style="width: 70px; height: 70px; border-radius: 4px" />
            <q-btn
              round
              dense
              color="red"
              icon="close"
              size="xs"
              style="position: absolute; top: -5px; right: -5px"
              @click="removerFoto(i)"
            />
          </div>
        </div>
      </div>

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

    <q-dialog v-model="showPhotoDialog">
      <q-card
        style="width: 300px; border-radius: 16px; border: 1px solid #424242"
        class="bg-grey-9 text-white"
      >
        <q-card-section class="row items-center q-pb-none">
          <div class="text-subtitle1 text-weight-bold text-orange-8">Origem da Foto</div>
          <q-space /><q-btn icon="close" flat round dense v-close-popup color="grey-5" />
        </q-card-section>
        <q-card-section class="q-pt-md">
          <div class="q-gutter-y-sm">
            <q-btn
              no-caps
              class="full-width bg-grey-8 text-white"
              icon="camera_alt"
              label="Câmara"
              @click="capturarCamera"
            />
            <q-btn
              no-caps
              class="full-width bg-grey-8 text-white"
              icon="photo_library"
              label="Galeria"
              @click="abrirGaleria"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  item: Object,
  index: Number,
})

// Declaramos os emits necessários
const emit = defineEmits(['alteracao', 'update:item'])
const showPhotoDialog = ref(false)

const precisaDeFoto = computed(() => {
  return (
    props.item.resposta === 'RUIM' ||
    props.item.resposta === 'ATENCAO' ||
    props.item.resposta === 'NAO'
  )
})

// Função Central que resolve a mutação! Cria cópia e avisa o Pai
const atualizarCampo = (campo, valor) => {
  const novoItem = { ...props.item, [campo]: valor }
  emit('update:item', novoItem) // Envia o item atualizado para o ChecklistForm.vue
  emit('alteracao') // Avisa que houve edição para o alerta de guardar rascunho
}

const setResposta = (res) => {
  atualizarCampo('resposta', res)
}

const capturarCamera = () => {
  const input = document.getElementById('file-input-' + props.index)
  input.multiple = false
  input.setAttribute('capture', 'environment')
  input.click()
  showPhotoDialog.value = false
}

const abrirGaleria = () => {
  const input = document.getElementById('file-input-' + props.index)
  input.multiple = true
  input.removeAttribute('capture')
  input.click()
  showPhotoDialog.value = false
}

const fotosSelecionadas = (event) => {
  const files = event.target.files
  for (let file of files) {
    const reader = new FileReader()
    reader.onload = (e) => {
      // Clona o array e adiciona a foto nova
      const novasFotos = [...props.item.fotos, e.target.result]
      atualizarCampo('fotos', novasFotos)
    }
    reader.readAsDataURL(file)
  }
}

const removerFoto = (i) => {
  // Clona o array e tira a foto escolhida
  const novasFotos = [...props.item.fotos]
  novasFotos.splice(i, 1)
  atualizarCampo('fotos', novasFotos)
}
</script>
