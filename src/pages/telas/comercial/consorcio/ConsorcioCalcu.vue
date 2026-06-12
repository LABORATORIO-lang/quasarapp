<template>
  <q-page class="consorcio-page text-white">
    <div class="page-container">
      <div class="row items-center q-col-gutter-sm q-mb-lg no-wrap">
        <div class="col-auto">
          <q-btn flat round icon="arrow_back" color="orange-8" @click="router.back()" />
        </div>
        <div class="col">
          <div class="text-h5 text-weight-bold text-orange-8">Calculadora de Consórcio</div>
          <div class="text-caption text-grey-5">Simule parcelas, taxas e estratégias de lance</div>
        </div>
      </div>

      <q-card flat class="section-card bg-grey-9 q-mb-md">
        <q-card-section>
          <div class="section-title">Dados do Plano</div>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                outlined
                dark
                color="orange-8"
                label-color="grey-5"
                bg-color="grey-10"
                label="Valor do Crédito (R$)"
                :model-value="creditoDisplay"
                inputmode="numeric"
                @update:model-value="onCreditoInput"
              />
            </div>
            <div class="col-12 col-sm-4">
              <q-input
                v-model="prazoMeses"
                outlined
                dark
                color="orange-8"
                label-color="grey-5"
                bg-color="grey-10"
                label="Prazo (Meses)"
                inputmode="numeric"
                @update:model-value="prazoMeses = onlyDigits($event)"
              />
            </div>
            <div class="col-12 col-sm-4">
              <q-input
                v-model="taxaAdministracao"
                outlined
                dark
                color="orange-8"
                label-color="grey-5"
                bg-color="grey-10"
                label="Taxa Administração (%)"
                inputmode="decimal"
                @update:model-value="taxaAdministracao = sanitizeDecimal($event)"
              />
            </div>
            <div class="col-12 col-sm-4">
              <q-input
                v-model="fundoReserva"
                outlined
                dark
                color="orange-8"
                label-color="grey-5"
                bg-color="grey-10"
                label="Fundo Reserva (%)"
                inputmode="decimal"
                @update:model-value="fundoReserva = sanitizeDecimal($event)"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat class="section-card bg-grey-9 q-mb-md">
        <q-card-section>
          <div class="section-title">Oferta de Lances</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="offer-title">Lance Livre</div>
              <div class="row q-col-gutter-sm">
                <div class="col-7">
                  <q-input
                    outlined
                    dark
                    color="orange-8"
                    label-color="grey-5"
                    bg-color="grey-10"
                    label="Valor (R$)"
                    :model-value="lanceLivreValorDisplay"
                    inputmode="numeric"
                    @update:model-value="onLanceLivreValorInput"
                  />
                </div>
                <div class="col-5">
                  <q-input
                    v-model="lanceLivrePercentual"
                    outlined
                    dark
                    color="orange-8"
                    label-color="grey-5"
                    bg-color="grey-10"
                    label="Porcentagem (%)"
                    inputmode="decimal"
                    @update:model-value="onLanceLivrePercentualInput"
                  />
                </div>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="offer-title">Lance Embutido</div>
              <div class="row q-col-gutter-sm">
                <div class="col-7">
                  <q-input
                    outlined
                    dark
                    color="orange-8"
                    label-color="grey-5"
                    bg-color="grey-10"
                    label="Valor (R$)"
                    :model-value="lanceEmbutidoValorDisplay"
                    inputmode="numeric"
                    @update:model-value="onLanceEmbutidoValorInput"
                  />
                </div>
                <div class="col-5">
                  <q-input
                    v-model="lanceEmbutidoPercentual"
                    outlined
                    dark
                    color="orange-8"
                    label-color="grey-5"
                    bg-color="grey-10"
                    label="Porcentagem (%)"
                    inputmode="decimal"
                    @update:model-value="onLanceEmbutidoPercentualInput"
                  />
                </div>
              </div>
            </div>
          </div>

          <q-banner
            v-if="lancesInvalidos"
            dense
            rounded
            inline-actions
            class="bg-red-10 text-white q-mt-md"
          >
            A soma dos lances ultrapassa o crédito
          </q-banner>
        </q-card-section>
      </q-card>

      <q-card flat class="section-card bg-grey-9 q-mb-md">
        <q-card-section>
          <div class="section-title">Opção de Contemplação</div>
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-btn
                unelevated
                no-caps
                class="toggle-btn full-width"
                :outline="tipoContemplacao !== 'PARCELA'"
                :color="tipoContemplacao === 'PARCELA' ? 'orange-8' : 'grey-7'"
                :text-color="tipoContemplacao === 'PARCELA' ? 'black' : 'white'"
                label="Reduzir Parcela"
                @click="tipoContemplacao = 'PARCELA'"
              />
            </div>
            <div class="col-6">
              <q-btn
                unelevated
                no-caps
                class="toggle-btn full-width"
                :outline="tipoContemplacao !== 'PRAZO'"
                :color="tipoContemplacao === 'PRAZO' ? 'orange-8' : 'grey-7'"
                :text-color="tipoContemplacao === 'PRAZO' ? 'black' : 'white'"
                label="Reduzir Prazo"
                @click="tipoContemplacao = 'PRAZO'"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat class="section-card bg-grey-9">
        <q-card-section>
          <div class="section-title">Resumo da Simulação</div>

          <div class="summary-list">
            <div class="summary-row">
              <span class="summary-label">Valor do Crédito</span>
              <span class="summary-value">{{ formatCurrencyFromNumber(creditoReais) }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Total c/ Taxas</span>
              <span class="summary-value">{{ formatCurrencyFromNumber(totalConsorcio) }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Parcela Original</span>
              <span class="summary-value">{{ formatCurrencyFromNumber(parcelaOriginal) }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Lance Livre</span>
              <span class="summary-value">
                {{ formatCurrencyFromNumber(lanceLivreValorReais) }} ({{
                  formatPercent(lanceLivrePercentualNumero)
                }})
              </span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Lance Embutido</span>
              <span class="summary-value">
                {{ formatCurrencyFromNumber(lanceEmbutidoValorReais) }} ({{
                  formatPercent(lanceEmbutidoPercentualNumero)
                }})
              </span>
            </div>
            <div class="summary-row" :class="{ 'text-red-5': lancesInvalidos }">
              <span class="summary-label">Total Ofertado</span>
              <span class="summary-value">
                {{ formatCurrencyFromNumber(totalLances) }} ({{
                  formatPercent(totalLancesPercentual)
                }})
              </span>
            </div>
          </div>

          <div
            class="projection-card q-mt-lg"
            :class="lancesInvalidos ? 'bg-red-10' : 'bg-green-9'"
          >
            <div class="projection-title">
              {{ lancesInvalidos ? 'Cálculo indisponível' : 'Projeção da contemplação' }}
            </div>

            <template v-if="!lancesInvalidos">
              <div class="projection-row">
                <span class="summary-label">Saldo Devedor</span>
                <span class="summary-value">{{ formatCurrencyFromNumber(saldoDevedor) }}</span>
              </div>
              <div v-if="tipoContemplacao === 'PARCELA'" class="projection-row">
                <span class="summary-label">Nova Parcela</span>
                <span class="summary-value">{{ formatCurrencyFromNumber(novaParcela) }}</span>
              </div>
              <div v-if="tipoContemplacao === 'PARCELA'" class="projection-row">
                <span class="summary-label">Prazo Mantido</span>
                <span class="summary-value">{{ prazoMesesNumero }} meses</span>
              </div>
              <template v-else>
                <div class="projection-row">
                  <span class="summary-label">Novo Prazo</span>
                  <span class="summary-value">{{ novoPrazo }} meses</span>
                </div>
                <div class="projection-row">
                  <span class="summary-label">Parcela Mantida</span>
                  <span class="summary-value">{{ formatCurrencyFromNumber(parcelaOriginal) }}</span>
                </div>
              </template>
            </template>

            <template v-else>
              <div class="projection-unavailable">Ajuste os lances para continuar a simulação.</div>
            </template>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const creditoCentavos = ref('0')
const prazoMeses = ref('')
const taxaAdministracao = ref('')
const fundoReserva = ref('')

const lanceLivreCentavos = ref('')
const lanceLivrePercentual = ref('')
const lanceEmbutidoCentavos = ref('')
const lanceEmbutidoPercentual = ref('')

const tipoContemplacao = ref('PARCELA')

const syncingLivre = ref(false)
const syncingEmbutido = ref(false)

function onlyDigits(value) {
  return String(value ?? '').replace(/\D/g, '')
}

function sanitizeDecimal(value) {
  const normalized = String(value ?? '')
    .replace(',', '.')
    .replace(/[^0-9.]/g, '')
  const parts = normalized.split('.')

  if (parts.length <= 1) {
    return normalized
  }

  return `${parts[0]}.${parts.slice(1).join('')}`
}

function parseDecimal(value) {
  const parsed = Number.parseFloat(String(value ?? '').replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : 0
}

function formatarMoeda(centavos) {
  const valor = Number(centavos || 0) / 100
  return currencyFormatter.format(valor)
}

function formatCurrencyFromNumber(value) {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0)
}

function formatPercent(value) {
  return `${percentFormatter.format(Number.isFinite(value) ? value : 0)}%`
}

function formatPercentInput(value) {
  return Number.isFinite(value) ? value.toFixed(2).replace(/\.?0+$/, '') : '0'
}

function calculatePercentFromValue(valorReais, creditoAtual) {
  if (!creditoAtual) {
    return 0
  }

  return (valorReais / creditoAtual) * 100
}

function calculateValueFromPercent(percentual, creditoAtual) {
  if (!creditoAtual) {
    return 0
  }

  return creditoAtual * (percentual / 100)
}

function onCreditoInput(value) {
  creditoCentavos.value = onlyDigits(value)
  syncAllLancesFromCurrentMode()
}

function onLanceLivreValorInput(value) {
  if (syncingLivre.value) {
    return
  }

  syncingLivre.value = true
  lanceLivreCentavos.value = onlyDigits(value)
  const percentual = calculatePercentFromValue(lanceLivreValorReais.value, creditoReais.value)
  lanceLivrePercentual.value = formatPercentInput(percentual)
  syncingLivre.value = false
}

function onLanceLivrePercentualInput(value) {
  if (syncingLivre.value) {
    return
  }

  syncingLivre.value = true
  lanceLivrePercentual.value = sanitizeDecimal(value)
  const valor = calculateValueFromPercent(lanceLivrePercentualNumero.value, creditoReais.value)
  lanceLivreCentavos.value = Math.round(valor * 100).toString()
  syncingLivre.value = false
}

function onLanceEmbutidoValorInput(value) {
  if (syncingEmbutido.value) {
    return
  }

  syncingEmbutido.value = true
  lanceEmbutidoCentavos.value = onlyDigits(value)
  const percentual = calculatePercentFromValue(lanceEmbutidoValorReais.value, creditoReais.value)
  lanceEmbutidoPercentual.value = formatPercentInput(percentual)
  syncingEmbutido.value = false
}

function onLanceEmbutidoPercentualInput(value) {
  if (syncingEmbutido.value) {
    return
  }

  syncingEmbutido.value = true
  lanceEmbutidoPercentual.value = sanitizeDecimal(value)
  const valor = calculateValueFromPercent(lanceEmbutidoPercentualNumero.value, creditoReais.value)
  lanceEmbutidoCentavos.value = Math.round(valor * 100).toString()
  syncingEmbutido.value = false
}

function syncAllLancesFromCurrentMode() {
  onLanceLivrePercentualInput(lanceLivrePercentual.value)
  onLanceEmbutidoPercentualInput(lanceEmbutidoPercentual.value)
}

const creditoDisplay = computed(() => formatarMoeda(creditoCentavos.value))
const lanceLivreValorDisplay = computed(() => formatarMoeda(lanceLivreCentavos.value))
const lanceEmbutidoValorDisplay = computed(() => formatarMoeda(lanceEmbutidoCentavos.value))

const creditoReais = computed(() => Number(creditoCentavos.value || 0) / 100)
const prazoMesesNumero = computed(() => Number.parseInt(prazoMeses.value || '0', 10) || 0)
const taxaAdministracaoNumero = computed(() => parseDecimal(taxaAdministracao.value))
const fundoReservaNumero = computed(() => parseDecimal(fundoReserva.value))

const lanceLivreValorReais = computed(() => Number(lanceLivreCentavos.value || 0) / 100)
const lanceLivrePercentualNumero = computed(() => parseDecimal(lanceLivrePercentual.value))
const lanceEmbutidoValorReais = computed(() => Number(lanceEmbutidoCentavos.value || 0) / 100)
const lanceEmbutidoPercentualNumero = computed(() => parseDecimal(lanceEmbutidoPercentual.value))

const totalConsorcio = computed(() => {
  return (
    creditoReais.value * (1 + taxaAdministracaoNumero.value / 100 + fundoReservaNumero.value / 100)
  )
})

const parcelaOriginal = computed(() => {
  if (!prazoMesesNumero.value) {
    return 0
  }

  return totalConsorcio.value / prazoMesesNumero.value
})

const totalLances = computed(() => lanceLivreValorReais.value + lanceEmbutidoValorReais.value)
const totalLancesPercentual = computed(() =>
  calculatePercentFromValue(totalLances.value, creditoReais.value),
)
const lancesInvalidos = computed(() => totalLances.value > creditoReais.value)
const saldoDevedor = computed(() => Math.max(0, totalConsorcio.value - totalLances.value))
const novaParcela = computed(() => {
  if (!prazoMesesNumero.value) {
    return 0
  }

  return saldoDevedor.value / prazoMesesNumero.value
})
const novoPrazo = computed(() => {
  if (!parcelaOriginal.value) {
    return 0
  }

  return Math.ceil(saldoDevedor.value / parcelaOriginal.value)
})
</script>

<style scoped>
.consorcio-page {
  background: #121212;
  min-height: 100vh;
}

.page-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 20px 16px 32px;
}

.section-card {
  border: 1px solid #2f2f2f;
  border-radius: 16px;
}

.section-title {
  color: #fb8c00;
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.offer-title {
  color: #e0e0e0;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.toggle-btn {
  min-height: 44px;
  border-radius: 12px;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-row,
.projection-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.summary-label {
  color: #9e9e9e;
  font-size: 0.92rem;
}

.summary-value {
  color: #fafafa;
  font-size: 0.95rem;
  font-weight: 600;
  text-align: right;
}

.projection-card {
  border-radius: 16px;
  padding: 16px;
}

.projection-title {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 14px;
  text-transform: uppercase;
}

.projection-unavailable {
  font-size: 0.95rem;
  font-weight: 500;
}

@media (min-width: 600px) {
  .page-container {
    padding: 24px 20px 40px;
  }
}
</style>
