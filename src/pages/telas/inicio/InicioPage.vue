<template>
  <q-page class="q-pa-md bg-grey-10">
    <div class="column items-center text-center">
      <q-img
        src="~assets/logo_empresa.png"
        style="height: 90px; max-width: 300px"
        fit="contain"
        class="q-mb-sm"
      />

      <div class="text-h5 text-weight-bold text-white">
        Bem-vindo, {{ userName }}
      </div>

      <div class="text-body2 text-grey-5 q-mb-md">
        Sistema Dinâmica Máquinas
      </div>

      <q-select
        v-model="pracaSelecionada"
        :options="pracas"
        label="Sua região"
        placeholder="Selecione a praça"
        outlined
        dense
        dark
        bg-color="grey-9"
        color="orange-8"
        label-color="grey-4"
        class="full-width q-mb-md"
        style="max-width: 360px"
      >
        <template #prepend>
          <q-icon name="location_on" color="orange-8" size="18px" />
        </template>
      </q-select>

      <!-- Cotações -->
      <div class="cotacoes-container full-width">
        <!-- Dólar destaque -->
        <div class="cotacao-card cotacao-dolar">
          <div class="cotacao-header">
            <span class="cotacao-icon">💵</span>
            <span class="cotacao-title">Dólar Comercial</span>
            <span
              v-if="cotacoes.dolar?.variacao !== null && cotacoes.dolar?.variacao !== undefined"
              class="dolar-variacao"
              :class="getVariacaoClass(cotacoes.dolar?.variacao)"
            >
              <q-icon :name="getArrowIcon(cotacoes.dolar?.variacao)" size="12px" />
              {{ formatVar(cotacoes.dolar?.variacao) }}
            </span>
          </div>
          <div class="cotacao-valor-dolar">
            {{ loading ? '...' : formatCurrency(cotacoes.dolar?.valor) }}
          </div>

          <!-- Gráfico -->
          <div v-if="cotacoes.dolar?.historico?.length > 2" class="sparkline-section">
            <div class="periodo-btns">
              <button
                v-for="p in periodos"
                :key="p.key"
                class="periodo-btn"
                :class="{ active: periodoSelecionado === p.key }"
                @click="periodoSelecionado = p.key"
              >
                {{ p.label }}
              </button>
            </div>
            <div class="chart-container">
              <div class="chart-scale">
                <span>{{ sparklineMax }}</span>
                <span>{{ sparklineMid }}</span>
                <span>{{ sparklineMin }}</span>
              </div>
              <svg
                class="sparkline"
                viewBox="0 0 200 60"
                preserveAspectRatio="none"
              >
                <!-- Grid lines -->
                <line x1="0" y1="15" x2="200" y2="15" stroke="rgba(255,255,255,0.06)" stroke-width="0.5" />
                <line x1="0" y1="30" x2="200" y2="30" stroke="rgba(255,255,255,0.06)" stroke-width="0.5" />
                <line x1="0" y1="45" x2="200" y2="45" stroke="rgba(255,255,255,0.06)" stroke-width="0.5" />
                <!-- Line -->
                <polyline
                  :points="sparklinePoints"
                  fill="none"
                  stroke="#a5d6a7"
                  stroke-width="1"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  vector-effect="non-scaling-stroke"
                />
              </svg>
            </div>
          </div>

          <div class="cotacao-meta">
            <span>PTAX · Banco Central</span>
            <span>Últimos {{ periodoLabel }}</span>
          </div>
        </div>

        <!-- Lista commodities estilo IMEA -->
        <div class="commodities-list">
          <div class="commodities-header">
            <span>COMMODITY</span>
            <span>LOCALIDADE</span>
            <span>VALOR</span>
            <span>VAR.</span>
          </div>

          <!-- Soja -->
          <div class="commodity-row">
            <div class="commodity-name">
              <span class="commodity-emoji">🌱</span>
              <span>SOJA</span>
            </div>
            <div class="commodity-localidade">
              {{ cotacoes.soja?.localidade || pracaSelecionada || '--' }}
            </div>
            <div class="commodity-valor">
              R$/sc {{ loading || !pracaSelecionada ? '--' : formatValor(cotacoes.soja?.valor) }}
            </div>
            <div
              class="commodity-variacao"
              :class="getVariacaoClass(cotacoes.soja?.variacao)"
            >
              <q-icon :name="getArrowIcon(cotacoes.soja?.variacao)" size="10px" />
              <span>{{ formatVar(cotacoes.soja?.variacao) }}</span>
            </div>
          </div>

          <!-- Milho -->
          <div class="commodity-row">
            <div class="commodity-name">
              <span class="commodity-emoji">🌽</span>
              <span>MILHO</span>
            </div>
            <div class="commodity-localidade">
              {{ cotacoes.milho?.localidade || pracaSelecionada || '--' }}
            </div>
            <div class="commodity-valor">
              R$/sc {{ loading || !pracaSelecionada ? '--' : formatValor(cotacoes.milho?.valor) }}
            </div>
            <div
              class="commodity-variacao"
              :class="getVariacaoClass(cotacoes.milho?.variacao)"
            >
              <q-icon :name="getArrowIcon(cotacoes.milho?.variacao)" size="10px" />
              <span>{{ formatVar(cotacoes.milho?.variacao) }}</span>
            </div>
          </div>

          <!-- Algodão -->
          <div class="commodity-row">
            <div class="commodity-name">
              <span class="commodity-emoji">🧵</span>
              <span>ALGODÃO</span>
            </div>
            <div class="commodity-localidade">
              {{ cotacoes.algodao?.localidade || pracaSelecionada || '--' }}
            </div>
            <div class="commodity-valor">
              R$/@ {{ loading || !pracaSelecionada ? '--' : formatValor(cotacoes.algodao?.valor) }}
            </div>
            <div
              class="commodity-variacao"
              :class="getVariacaoClass(cotacoes.algodao?.variacao)"
            >
              <q-icon :name="getArrowIcon(cotacoes.algodao?.variacao)" size="10px" />
              <span>{{ formatVar(cotacoes.algodao?.variacao) }}</span>
            </div>
          </div>
        </div>

        <!-- Última atualização -->
        <div class="cotacoes-update-row">
          <q-icon name="update" size="12px" color="grey-6" />
          <span class="update-text">
            {{ formatDate(cotacoes.soja?.data) || '--' }} · IMEA / BCB
          </span>
          <q-btn
            flat
            round
            dense
            icon="refresh"
            color="orange-8"
            size="xs"
            :loading="loading"
            @click="forceRefresh"
            class="q-ml-auto"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useCotacoes } from 'src/composables/useCotacoes'
import localforage from 'localforage'

const pracas = [
  'Campo Novo do Parecis',
  'Nova Mutum',
  'Tangará da Serra',
]

const pracaSelecionada = ref(null)
const userName = ref('Usuário')
const { cotacoes, loading, buscarCotacoes } = useCotacoes(pracaSelecionada)

const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '--'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const formatValor = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '--'
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const formatDate = (dateStr) => {
  if (!dateStr) return null
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return dateStr
}

const getArrowIcon = (variacao) => {
  if (variacao === null || variacao === undefined) return 'remove'
  return variacao >= 0 ? 'north' : 'south'
}

const getVariacaoClass = (variacao) => {
  if (variacao === null || variacao === undefined) return 'variacao-neutral'
  return variacao >= 0 ? 'variacao-up' : 'variacao-down'
}

const formatVar = (value) => {
  if (value === null || value === undefined || isNaN(value)) return ''
  return `${Math.abs(value).toFixed(2)}%`
}

const sparklinePoints = computed(() => {
  const data = sparklineData.value
  if (!data || data.length < 2) return ''
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = 200 / (data.length - 1)
  return data.map((v, i) => `${(i * stepX).toFixed(1)},${(55 - ((v - min) / range) * 50).toFixed(1)}`).join(' ')
})

const periodos = [
  { key: '5d', label: '5D', dias: 5 },
  { key: '1s', label: '1S', dias: 7 },
  { key: '1m', label: '1M', dias: 30 },
]

const periodoSelecionado = ref('1m')

const sparklineData = computed(() => {
  const historico = cotacoes.value.dolar?.historico || []
  const periodo = periodos.find(p => p.key === periodoSelecionado.value)
  const dias = periodo?.dias || 30
  return historico.slice(-dias)
})

const sparklineMin = computed(() => {
  const data = sparklineData.value
  if (!data.length) return ''
  return Math.min(...data).toFixed(2)
})

const sparklineMax = computed(() => {
  const data = sparklineData.value
  if (!data.length) return ''
  return Math.max(...data).toFixed(2)
})

const sparklineMid = computed(() => {
  const data = sparklineData.value
  if (!data.length) return ''
  const min = Math.min(...data)
  const max = Math.max(...data)
  return ((min + max) / 2).toFixed(2)
})

const periodoLabel = computed(() => {
  const p = periodos.find(x => x.key === periodoSelecionado.value)
  if (p?.key === '5d') return '5 dias'
  if (p?.key === '1s') return '1 semana'
  return '30 dias'
})

const forceRefresh = async () => {
  await localforage.removeItem('cotacoes_cache')
  await buscarCotacoes()
}

onMounted(async () => {
  const savedPraca = await localforage.getItem('praca_cotacoes')
  if (savedPraca && pracas.includes(savedPraca)) {
    pracaSelecionada.value = savedPraca
  }
  await buscarCotacoes()

  const sessao = await localforage.getItem('user_session')
  if (sessao?.nome) {
    userName.value = sessao.nome
  } else if (sessao?.email) {
    const emailName = sessao.email.split('@')[0]
    userName.value = emailName.charAt(0).toUpperCase() + emailName.slice(1)
  }
})

watch(pracaSelecionada, async (novaPraca) => {
  if (!novaPraca) return
  await localforage.setItem('praca_cotacoes', novaPraca)
  await localforage.removeItem('cotacoes_cache')
  await buscarCotacoes()
})
</script>

<style scoped>
.cotacoes-container {
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Dólar card */
.cotacao-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 14px 16px;
}

.cotacao-dolar {
  background: linear-gradient(135deg, rgba(46, 125, 50, 0.15) 0%, rgba(27, 94, 32, 0.08) 100%);
  border-color: rgba(76, 175, 80, 0.2);
}

.cotacao-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.cotacao-icon {
  font-size: 16px;
}

.cotacao-title {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cotacao-valor-dolar {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.3;
}

.dolar-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.sparkline-section {
  margin-top: 8px;
}

.periodo-btns {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
}

.periodo-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.periodo-btn.active {
  background: rgba(102, 187, 106, 0.2);
  border-color: #66bb6a;
  color: #66bb6a;
}

.sparkline {
  width: 100%;
  height: 70px;
}

.chart-container {
  display: flex;
  align-items: stretch;
  gap: 6px;
}

.chart-scale {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.35);
  padding: 2px 0;
  min-width: 32px;
  text-align: right;
}

.sparkline-labels {
  display: none;
}

.cotacao-meta {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.35);
  margin-top: 4px;
}

.dolar-variacao {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  font-size: 11px;
  font-weight: 700;
  margin-left: auto;
}

/* Lista commodities */
.commodities-list {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
}

.commodities-header {
  display: grid;
  grid-template-columns: 2fr 2fr 2fr 70px;
  padding: 8px 14px;
  font-size: 9px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.02);
}

.commodity-row {
  display: grid;
  grid-template-columns: 2fr 2fr 2fr 70px;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.15s ease;
}

.commodity-row:last-child {
  border-bottom: none;
}

.commodity-row:active {
  background: rgba(255, 255, 255, 0.03);
}

.commodity-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.3px;
}

.commodity-emoji {
  font-size: 18px;
}

.commodity-localidade {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.commodity-valor {
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  text-align: right;
}

.commodity-variacao {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.variacao-up {
  color: #4caf50;
}

.variacao-down {
  color: #f44336;
}

.variacao-neutral {
  color: rgba(255, 255, 255, 0.4);
}

/* Update row */
.cotacoes-update-row {
  display: flex;
  align-items: center;
  padding: 4px 0;
}

.update-text {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.35);
  margin-left: 4px;
}
</style>
