import { ref } from 'vue'
import { Capacitor } from '@capacitor/core'
import localforage from 'localforage'

const CACHE_KEY = 'cotacoes_cache'
const CACHE_TTL_MS = 4 * 60 * 60 * 1000

const isNative = Capacitor.isNativePlatform()
const IMEA_BASE = isNative ? 'https://api1.imea.com.br/api' : '/imea-api'
const BCB_BASE = isNative ? 'https://olinda.bcb.gov.br' : '/bcb-api'
const IMEA_ENDPOINTS = {
  soja: '/v2/mobile/cadeias/4/cotacoes',
  milho: '/v2/mobile/cadeias/3/cotacoes',
  algodao: '/v2/mobile/cadeias/1/cotacoes',
}

// IndicadorFinalId for "DISPONÍVEL" price per city
const INDICADOR_IDS = {
  soja: '708192508838936580',
  milho: '708192508838936581',
  algodao: '708192508935405570', // PLUMA DISPONÍVEL
}

const PRACA_MAP = {
  'Campo Novo do Parecis': 'Campo Novo do Parecis',
  'Nova Mutum': 'Nova Mutum',
  'Tangará da Serra': 'Tangará da Serra',
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function formatBcbDate(date) {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${m}-${d}-${date.getFullYear()}`
}

async function fetchDolar() {
  const valores = []
  for (let offset = 0; offset < 10 && valores.length < 2; offset++) {
    const date = new Date()
    date.setDate(date.getDate() - offset)
    const url = `${BCB_BASE}/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao='${formatBcbDate(date)}'&$format=json`

    try {
      const response = await fetch(url)
      if (!response.ok) continue
      const data = await response.json()
      if (data.value?.length) {
        valores.push(data.value[0].cotacaoVenda)
      }
    } catch {
      continue
    }
  }

  if (valores.length === 0) return { valor: null, variacao: null, historico: [] }

  const hoje = valores[0]
  const ontem = valores.length >= 2 ? valores[1] : null
  const variacao = ontem ? ((hoje - ontem) / ontem) * 100 : null

  // Fetch last 30 days for sparkline
  let historico = []
  try {
    const fim = new Date()
    const inicio = new Date()
    inicio.setDate(inicio.getDate() - 30)
    const url = `${BCB_BASE}/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@di,dataFinalCotacao=@df)?@di='${formatBcbDate(inicio)}'&@df='${formatBcbDate(fim)}'&$format=json&$select=cotacaoVenda,dataHoraCotacao&$orderby=dataHoraCotacao asc`
    const res = await fetch(url)
    if (res.ok) {
      const json = await res.json()
      if (json.value?.length) {
        // Get only last value per day
        const porDia = {}
        json.value.forEach(item => {
          const dia = item.dataHoraCotacao.split(' ')[0]
          porDia[dia] = item.cotacaoVenda
        })
        historico = Object.values(porDia)
      }
    }
  } catch {
    // sparkline optional
  }

  return { valor: hoje, variacao: variacao ? parseFloat(variacao.toFixed(2)) : null, historico }
}

async function fetchImeaCotacao(commodity, praca) {
  try {
    const url = IMEA_BASE + IMEA_ENDPOINTS[commodity]
    const response = await fetch(url)
    if (!response.ok) return { valor: null, variacao: null }

    const data = await response.json()
    const indicadorId = INDICADOR_IDS[commodity]
    const targetPraca = PRACA_MAP[praca] || praca
    const normalizedTarget = normalizeText(targetPraca)

    // Filter by IndicadorFinalId (DISPONÍVEL)
    const cotacoes = data.filter(item => item.IndicadorFinalId === indicadorId)

    // Find the specific city
    let found = cotacoes.find(item => normalizeText(item.Localidade) === normalizedTarget)

    // Fallback: try "Mato Grosso" (state average)
    if (!found) {
      found = cotacoes.find(item => normalizeText(item.Localidade) === 'mato grosso')
    }

    // Fallback: first available
    if (!found && cotacoes.length > 0) {
      found = cotacoes[0]
    }

    if (found) {
      return {
        valor: found.Valor,
        variacao: found.Variacao,
        data: found.DataPublicacao ? found.DataPublicacao.split(' ')[0] : null,
        localidade: found.Localidade,
        unidade: found.UnidadeSigla,
      }
    }

    return { valor: null, variacao: null, data: null, localidade: null, unidade: null }
  } catch {
    return { valor: null, variacao: null, data: null, localidade: null, unidade: null }
  }
}

export function useCotacoes(pracaSelecionada) {
  const cotacoes = ref({
    dolar: { valor: null, variacao: null },
    soja: { valor: null, variacao: null },
    milho: { valor: null, variacao: null },
    algodao: { valor: null, variacao: null },
  })
  const loading = ref(false)

  const buscarCotacoes = async () => {
    loading.value = true
    try {
      const praca = pracaSelecionada.value
      const cache = await localforage.getItem(CACHE_KEY)

      if (cache && cache.praca === praca && Date.now() - cache.timestamp < CACHE_TTL_MS) {
        cotacoes.value = cache.data
        return
      }

      const [dolar, soja, milho, algodao] = await Promise.all([
        fetchDolar(),
        praca ? fetchImeaCotacao('soja', praca) : Promise.resolve({ valor: null, variacao: null }),
        praca ? fetchImeaCotacao('milho', praca) : Promise.resolve({ valor: null, variacao: null }),
        praca ? fetchImeaCotacao('algodao', praca) : Promise.resolve({ valor: null, variacao: null }),
      ])

      cotacoes.value = { dolar, soja, milho, algodao }

      await localforage.setItem(CACHE_KEY, {
        praca,
        data: cotacoes.value,
        timestamp: Date.now(),
      })
    } catch {
      // keep current values
    } finally {
      loading.value = false
    }
  }

  return { cotacoes, loading, buscarCotacoes }
}
