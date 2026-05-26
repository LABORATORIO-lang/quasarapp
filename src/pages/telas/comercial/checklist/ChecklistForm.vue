<template>
  <q-page class="q-pa-lg text-white bg-grey-10">
    <div class="row items-center q-mb-lg q-gutter-sm">
      <q-btn flat round icon="arrow_back" color="orange-8" @click="voltar" />
      <div>
        <div class="text-h5 text-weight-bold text-capitalize">
          Checklist: {{ nomeMaquina || 'Carregando...' }}
        </div>
        <div class="text-caption text-grey-5">
          Preencha os dados do cliente e os itens da vistoria.
        </div>
      </div>
    </div>

    <q-card class="bg-grey-9 text-white q-mb-lg custom-card-borda">
      <q-card-section>
        <div class="text-h6 text-orange-8 q-mb-md">Informações Gerais</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="formulario.cliente"
              label="Nome do Cliente / Fazenda"
              label-color="orange-8"
              color="orange-8"
              bg-color="grey-10"
              filled
              dark
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="formulario.chassi"
              label="Número de Série / Chassi"
              label-color="orange-8"
              color="orange-8"
              bg-color="grey-10"
              filled
              dark
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="formulario.cidade"
              label="Cidade / Estado"
              label-color="orange-8"
              color="orange-8"
              bg-color="grey-10"
              filled
              dark
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="formulario.data"
              type="date"
              label="Data da Vistoria"
              label-color="orange-8"
              color="orange-8"
              bg-color="grey-10"
              filled
              dark
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card class="bg-grey-9 text-white custom-card-borda">
      <q-card-section>
        <div class="text-h6 text-orange-8 q-mb-md">Itens de Inspeção</div>

        <div v-if="itens.length === 0" class="text-center q-pa-lg text-grey-5">
          <q-icon name="hourglass_empty" size="48px" class="q-mb-sm" />
          <div>Nenhuma pergunta encontrada para este modelo.</div>
        </div>

        <div v-for="(item, index) in itens" :key="index" class="q-mb-lg">
          <div class="text-subtitle1 text-weight-bold q-mb-sm">
            {{ index + 1 }}. {{ item.texto }}
          </div>

          <q-btn-toggle
            v-model="item.resposta"
            spread
            no-caps
            rounded
            unelevated
            toggle-color="orange-8"
            color="grey-10"
            text-color="white"
            :options="[
              { label: 'Conforme', value: 'CONFORME' },
              { label: 'Não Conforme', value: 'NAO_CONFORME' },
              { label: 'N/A', value: 'NA' },
            ]"
            class="q-mb-sm"
          />

          <q-input
            v-model="item.observacao"
            label="Observação (Opcional)"
            label-color="grey-5"
            color="orange-8"
            bg-color="grey-10"
            filled
            dark
            autogrow
          />
          <q-separator color="grey-8" class="q-mt-md" />
        </div>
      </q-card-section>
    </q-card>

    <div class="row justify-end q-mt-lg">
      <q-btn
        size="lg"
        color="orange-8"
        text-color="white"
        icon="save"
        label="Salvar Relatório"
        class="text-bold shadow-3"
        @click="salvarChecklist"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { doc, getDoc, collection, addDoc } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const nomeMaquina = ref('')
const itens = ref([])
const formulario = ref({
  cliente: '',
  chassi: '',
  cidade: '',
  data: new Date().toISOString().split('T')[0],
})

const carregarPerguntas = async () => {
  // Pega o ID da máquina diretamente da URL (infalível)
  const tipoSelecionado = route.params.tipo

  if (!tipoSelecionado) {
    $q.notify({ message: 'Selecione uma máquina primeiro!', color: 'red-8' })
    router.push('/inicio/comercial/checklist/selecionar')
    return
  }

  $q.loading.show()
  try {
    const docRef = doc(db, 'modelos_checklists', tipoSelecionado)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      nomeMaquina.value = data.nome || tipoSelecionado.replace('_', ' ')

      itens.value = (data.itens || []).map((itemFirebase) => ({
        texto: itemFirebase.texto,
        tipo_original: itemFirebase.tipo,
        resposta: null,
        observacao: '',
      }))
    } else {
      $q.notify({
        message: 'O modelo de checklist não possui perguntas cadastradas.',
        color: 'orange-8',
      })
    }
  } catch (error) {
    console.error('Erro ao buscar o checklist:', error)
    $q.notify({ message: 'Erro ao conectar ao banco de dados.', color: 'red-8' })
  } finally {
    $q.loading.hide()
  }
}

async function salvarChecklist() {
  if (!formulario.value.cliente || !formulario.value.chassi) {
    $q.notify({ message: 'Preencha o nome do cliente e o chassi.', color: 'red-8' })
    return
  }

  $q.loading.show({ message: 'Salvando relatório...' })
  try {
    const tipoSelecionado = route.params.tipo

    await addDoc(collection(db, 'checklists'), {
      tipoMaquina: tipoSelecionado,
      nomeMaquina: nomeMaquina.value,
      dadosCliente: formulario.value,
      respostas: itens.value,
      status: 'FINALIZADO',
      dataCriacao: new Date().toISOString(),
    })

    $q.notify({ icon: 'check_circle', message: 'Relatório salvo com sucesso!', color: 'green-8' })
    router.push('/inicio/comercial/checklist')
  } catch (error) {
    console.error('Erro ao salvar:', error)
    $q.notify({ message: 'Erro ao salvar o relatório.', color: 'red-8' })
  } finally {
    $q.loading.hide()
  }
}

function voltar() {
  router.push('/inicio/comercial/checklist/selecionar')
}

onMounted(carregarPerguntas)
</script>

<style scoped>
.custom-card-borda {
  border: 1px solid #424242;
  border-radius: 12px;
}
</style>
