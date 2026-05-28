<template>
  <q-page class="q-pa-md bg-grey-10 text-white">
    <!-- CABEÇALHO -->
    <div class="row items-center q-mb-md">
      <q-btn flat round icon="arrow_back" color="orange-8" @click="verificarSaida" />
      <div class="text-h6 text-weight-bold text-uppercase text-orange-8 q-ml-sm">
        {{ nomeMaquina || 'Carregando...' }}
      </div>
    </div>

    <!-- DADOS DA MÁQUINA -->
    <div class="text-subtitle2 text-weight-bold text-uppercase q-mb-sm q-ml-xs">
      Dados da Máquina
    </div>
    <q-card
      class="bg-grey-9 shadow-3 q-mb-lg"
      style="border-radius: 12px; border: 1px solid #424242"
    >
      <q-card-section class="q-gutter-y-md">
        <q-input
          v-model="formulario.cliente"
          label="Nome do Cliente"
          dark
          outlined
          dense
          color="orange-8"
          @update:model-value="temAlteracoes = true"
        />
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-input
              v-model="formulario.cidade"
              label="Cidade"
              dark
              outlined
              dense
              color="orange-8"
              @update:model-value="temAlteracoes = true"
            />
          </div>
          <div class="col-6">
            <q-input
              v-model="formulario.data"
              type="date"
              label="Data"
              dark
              outlined
              dense
              color="orange-8"
              @update:model-value="temAlteracoes = true"
            />
          </div>
        </div>
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-input
              v-model="formulario.marca"
              label="Marca"
              dark
              outlined
              dense
              color="orange-8"
              @update:model-value="temAlteracoes = true"
            />
          </div>
          <div class="col-6">
            <q-input
              v-model="formulario.modelo"
              label="Modelo"
              dark
              outlined
              dense
              color="orange-8"
              @update:model-value="temAlteracoes = true"
            />
          </div>
        </div>
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-input
              v-model="formulario.serie"
              label="Nº de Série"
              dark
              outlined
              dense
              color="orange-8"
              @update:model-value="temAlteracoes = true"
            />
          </div>
          <div class="col-6">
            <q-input
              v-model="formulario.horimetro"
              type="number"
              label="Horímetro"
              dark
              outlined
              dense
              color="orange-8"
              @update:model-value="temAlteracoes = true"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- FOTOS GERAIS -->
    <div class="text-subtitle2 text-weight-bold text-grey-5 text-uppercase q-mb-sm q-ml-xs">
      Fotos Gerais (Obrigatório)
    </div>
    <q-card
      class="bg-grey-9 shadow-3 q-mb-lg"
      style="border-radius: 12px; border: 1px solid #424242"
    >
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div
            class="col-6 col-md-3"
            v-for="posicao in ['Frente', 'Direita', 'Traseira', 'Esquerda']"
            :key="posicao"
          >
            <div class="text-center">
              <div
                class="bg-grey-10 flex flex-center cursor-pointer shadow-2"
                style="
                  height: 100px;
                  border-radius: 8px;
                  border: 1px dashed #555;
                  position: relative;
                "
                @click="abrirCameraFotoGeral(posicao)"
              >
                <q-img
                  v-if="fotosGerais[posicao]"
                  :src="fotosGerais[posicao]"
                  style="height: 100%; border-radius: 8px"
                />
                <q-icon v-else name="add_a_photo" color="grey-6" size="sm" />
                <q-btn
                  v-if="fotosGerais[posicao]"
                  round
                  dense
                  color="red"
                  icon="close"
                  size="xs"
                  style="position: absolute; top: -5px; right: -5px"
                  @click.stop="removerFotoGeral(posicao)"
                />
              </div>
              <div class="text-grey-4 text-caption q-mt-xs text-uppercase">{{ posicao }}</div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
    <input
      type="file"
      accept="image/*"
      capture="environment"
      id="file-input-geral"
      style="display: none"
      @change="processarFotoGeral"
    />

    <!-- ITENS DE VERIFICAÇÃO -->
    <div class="text-subtitle2 text-weight-bold text-uppercase q-mb-sm q-ml-xs">
      Itens de Verificação
    </div>
    <q-card
      class="bg-grey-9 shadow-3 q-mb-lg"
      style="border-radius: 12px; border: 1px solid #424242"
    >
      <ItemVerificacao
        v-for="(item, index) in itens"
        :key="index"
        :item="item"
        :index="index"
        @update:item="itens[index] = $event"
        @alteracao="temAlteracoes = true"
      />
    </q-card>

    <!-- VALIDAÇÃO E ASSINATURAS (Apenas com os botões limpos) -->
    <div class="text-subtitle2 text-weight-bold text-uppercase q-mb-sm q-ml-xs">
      Validação e Assinaturas
    </div>
    <q-card
      class="bg-grey-9 shadow-3 q-mb-lg q-pa-md"
      style="border-radius: 12px; border: 1px solid #424242"
    >
      <q-btn
        :color="statusAssinatura.vendedor ? 'green' : 'orange-8'"
        :label="statusAssinatura.vendedor ? 'Vendedor: Assinado' : 'Assinar Vendedor (Obrigatório)'"
        :icon="statusAssinatura.vendedor ? 'check_circle' : 'edit'"
        @click="abrirAssinatura('Vendedor')"
        class="full-width q-mb-sm"
      />

      <q-btn
        :color="statusAssinatura.cliente ? 'green' : 'orange-8'"
        :label="statusAssinatura.cliente ? 'Cliente: Assinado' : 'Assinar Cliente (Obrigatório)'"
        :icon="statusAssinatura.cliente ? 'check_circle' : 'edit'"
        @click="abrirAssinatura('Cliente')"
        class="full-width q-mb-sm"
      />

      <div class="q-mt-md">
        <q-btn
          :color="statusAssinatura.tecnico ? 'green' : 'grey-7'"
          :label="statusAssinatura.tecnico ? 'Técnico: Assinado' : 'Assinar Técnico (Opcional)'"
          :icon="statusAssinatura.tecnico ? 'check_circle' : 'engineering'"
          @click="abrirAssinatura('Tecnico')"
          class="full-width"
          outline
        />
        <div class="text-caption text-grey-5 text-center q-mt-xs">
          *O campo do técnico não é obrigatório para salvar o PDF.
        </div>
      </div>
    </q-card>

    <q-btn
      color="orange-8"
      label="Salvar e Gerar PDF"
      icon="save"
      @click="salvarChecklist"
      class="full-width q-mb-xl"
    />

    <!-- MODAL DE ASSINATURA (Onde os traços são realmente desenhados) -->
    <q-dialog
      v-model="showAssinaturaDialog"
      maximized
      persistent
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-10 text-white">
        <q-card-section class="row items-center">
          <div class="text-h6 text-orange-8">Assinar como: {{ tipoAssinatura }}</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="showAssinaturaDialog = false" />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div v-show="tipoAssinatura === 'Vendedor'">
            <AssinaturaPad
              id="vendedor"
              label="Nome do Vendedor"
              v-model:nome="assinaturas.vendedorNome"
              ref="assinaturaVendedorRef"
              @alteracao="temAlteracoes = true"
            />
          </div>
          <div v-show="tipoAssinatura === 'Cliente'">
            <AssinaturaPad
              id="cliente"
              label="Nome do Cliente"
              v-model:nome="assinaturas.clienteNome"
              ref="assinaturaClienteRef"
              @alteracao="temAlteracoes = true"
            />
          </div>
          <div v-show="tipoAssinatura === 'Tecnico'">
            <AssinaturaPad
              id="tecnico"
              label="Nome do Técnico"
              v-model:nome="assinaturas.tecnicoNome"
              ref="assinaturaTecnicoRef"
              @alteracao="temAlteracoes = true"
            />
          </div>
        </q-card-section>

        <q-card-actions align="center" class="q-pa-md">
          <q-btn
            label="Confirmar Assinatura"
            color="green"
            icon="check"
            @click="confirmarAssinatura"
            class="full-width"
            size="lg"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { doc, getDoc } from 'firebase/firestore'
import { db, auth } from 'src/boot/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import localforage from 'localforage'

import ItemVerificacao from 'src/components/ItemVerificacao.vue'
import AssinaturaPad from 'src/components/AssinaturaPad.vue'
import { gerarChecklistPdf } from 'src/utils/pdfGenerator'
import { redimensionarImagem } from 'src/utils/imageUtils'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

// Controle de Estado
const temAlteracoes = ref(false)
const showAssinaturaDialog = ref(false)
const tipoAssinatura = ref('')
const posAtual = ref('')

const statusAssinatura = ref({
  vendedor: false,
  cliente: false,
  tecnico: false,
})

// Refs
const assinaturaVendedorRef = ref(null)
const assinaturaClienteRef = ref(null)
const assinaturaTecnicoRef = ref(null)

const nomeMaquina = ref('')
const itens = ref([])

const formulario = ref({
  cliente: '',
  cidade: '',
  data: new Date().toISOString().split('T')[0],
  marca: '',
  modelo: '',
  serie: '',
  horimetro: '',
})

const assinaturas = ref({ vendedorNome: '', clienteNome: '', tecnicoNome: '' })
const fotosGerais = ref({ Frente: null, Direita: null, Traseira: null, Esquerda: null })

let authListenerUnsubscribe = null

onMounted(() => {
  $q.loading.show({ message: 'A carregar sessão...' })
  authListenerUnsubscribe = onAuthStateChanged(auth, (user) => {
    if (user && user.displayName) {
      assinaturas.value.vendedorNome = user.displayName
    } else if (user && user.email) {
      assinaturas.value.vendedorNome = user.email.split('@')[0]
    }
  })
  if (auth.currentUser?.displayName) {
    assinaturas.value.vendedorNome = auth.currentUser.displayName
  }
  carregarPerguntas()
})

onUnmounted(() => {
  if (authListenerUnsubscribe) authListenerUnsubscribe()
})

const carregarPerguntas = async () => {
  const tipoSelecionado = route.params.tipo
  if (!tipoSelecionado) return router.push('/inicio/comercial/checklist/selecionar')
  try {
    const docSnap = await getDoc(doc(db, 'modelos_checklists', tipoSelecionado))
    if (docSnap.exists()) {
      const data = docSnap.data()
      nomeMaquina.value = data.nome || tipoSelecionado.replace('_', ' ')
      itens.value = (data.itens || []).map((i) => ({
        texto: i.texto,
        tipo: i.tipo || 'YES_NO',
        resposta: null,
        observacao: '',
        fotos: [],
      }))
    }
  } catch (e) {
    console.error(e)
  } finally {
    $q.loading.hide()
  }
}

// Funções de Assinatura
const abrirAssinatura = (tipo) => {
  tipoAssinatura.value = tipo
  showAssinaturaDialog.value = true
}

const confirmarAssinatura = () => {
  if (tipoAssinatura.value === 'Vendedor') {
    statusAssinatura.value.vendedor = assinaturaVendedorRef.value?.hasSigned || false
  } else if (tipoAssinatura.value === 'Cliente') {
    statusAssinatura.value.cliente = assinaturaClienteRef.value?.hasSigned || false
  } else if (tipoAssinatura.value === 'Tecnico') {
    statusAssinatura.value.tecnico = assinaturaTecnicoRef.value?.hasSigned || false
  }
  showAssinaturaDialog.value = false
}

// Funções de Fotos Gerais
const abrirCameraFotoGeral = (pos) => {
  posAtual.value = pos
  document.getElementById('file-input-geral').click()
}

const processarFotoGeral = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const fotoProcessada = await redimensionarImagem(file)
    fotosGerais.value[posAtual.value] = fotoProcessada
    temAlteracoes.value = true
  } catch (e) {
    console.error('Erro ao processar imagem:', e)
    $q.notify({ message: 'Erro ao processar a foto.', color: 'red' })
  }
}

const removerFotoGeral = (pos) => {
  fotosGerais.value[pos] = null
  temAlteracoes.value = true
}

// Guardião de Navegação
const verificarSaida = () => {
  if (temAlteracoes.value) {
    $q.dialog({
      title: 'Atenção: Progresso não salvo',
      message:
        'Detetámos que preencheu dados neste checklist. Pretende guardar em "Em Andamento" antes de sair?',
      persistent: true,
      ok: { label: 'Sim, Guardar', color: 'positive' },
      cancel: { label: 'Sair sem guardar', color: 'negative', flat: true },
    })
      .onOk(() => {
        $q.notify({ type: 'positive', message: 'Rascunho guardado (Simulação)!' })
        temAlteracoes.value = false
        router.back()
      })
      .onCancel(() => {
        temAlteracoes.value = false
        router.back()
      })
  } else {
    router.back()
  }
}

// Salvamento Final
const salvarChecklist = async () => {
  // 1. Validar se o nome do cliente foi preenchido
  if (!formulario.value.cliente) {
    return $q.notify({
      message: 'Preencha o nome do Cliente!',
      color: 'orange-8',
      icon: 'warning',
    })
  }

  // 2. Validar assinaturas OBRIGATÓRIAS (Vendedor e Cliente apenas)
  if (!statusAssinatura.value.vendedor || !statusAssinatura.value.cliente) {
    return $q.notify({
      message: 'As assinaturas do Vendedor e do Cliente são obrigatórias!',
      color: 'red-8',
      icon: 'warning',
    })
  }

  // 3. Validar Fotos Gerais
  const posicoes = ['Frente', 'Direita', 'Traseira', 'Esquerda']
  const faltantes = posicoes.filter((pos) => !fotosGerais.value[pos])

  if (faltantes.length > 0) {
    return $q.notify({
      message: `Fotos gerais obrigatórias! Faltam: ${faltantes.join(', ')}`,
      color: 'red-8',
      icon: 'camera_alt',
      position: 'top',
    })
  }

  // 4. Executar Salvamento
  try {
    $q.loading.show({ message: 'Processando...' })

    // ---> NOVO CÓDIGO: Extrair a imagem (Base64) de cada assinatura <---
    // A maioria das bibliotecas de assinatura usa o método saveSignature()

    const imgVendedor = assinaturaVendedorRef.value?.extrairImagem
      ? assinaturaVendedorRef.value.extrairImagem()
      : null
    const imgCliente = assinaturaClienteRef.value?.extrairImagem
      ? assinaturaClienteRef.value.extrairImagem()
      : null

    const imgTecnico =
      statusAssinatura.value.tecnico && assinaturaTecnicoRef.value?.extrairImagem
        ? assinaturaTecnicoRef.value.extrairImagem()
        : null

    // Adicionamos as imagens ao nosso objeto de assinaturas
    assinaturas.value.vendedorImagem = imgVendedor
    assinaturas.value.clienteImagem = imgCliente
    assinaturas.value.tecnicoImagem = imgTecnico

    const pacoteDeDados = JSON.parse(
      JSON.stringify({
        id: Date.now().toString(),
        nomeMaquina: nomeMaquina.value,
        formulario: formulario.value,
        itens: itens.value,
        assinaturas: assinaturas.value, // Agora leva os nomes E as imagens!
        fotosGerais: fotosGerais.value,
        dataCriacao: new Date().toISOString(),
      }),
    )

    if ($q.platform.is.capacitor) {
      const historico = (await localforage.getItem('historico_comercial')) || []
      historico.unshift(pacoteDeDados)
      await localforage.setItem('historico_comercial', historico)
    }

    await gerarChecklistPdf(pacoteDeDados)
    temAlteracoes.value = false
    router.push('/inicio/comercial/checklist')
  } catch (e) {
    console.error(e)
    $q.notify({ message: 'Erro ao processar checklist.', color: 'red-8' })
  } finally {
    $q.loading.hide()
  }
}
</script>

<style scoped>
:deep(input::-webkit-outer-spin-button),
:deep(input::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}
</style>
