import localforage from 'localforage'

// Configuração do localForage para o Pós-Venda
const db = localforage.createInstance({ name: 'DinamicaPosVenda' })

export const PosVendaService = {
  // 1. Salvar uma nova máquina (recebimento inicial)
  async salvarMaquina(maquina) {
    const series = (await db.getItem('maquinas')) || []
    maquina.id = Date.now()
    maquina.status = 'em_estoque'
    maquina.historico = [
      {
        data: new Date().toISOString(),
        acao: 'Recebimento Inicial',
        unidade: maquina.unidadeAtual,
      },
    ]
    series.push(maquina)
    await db.setItem('maquinas', series)
    return maquina
  },

  // 2. Listar máquinas (filtrando por unidade)
  async listarMaquinas() {
    return (await db.getItem('maquinas')) || []
  },

  // 3. Registrar movimentação (Transferência ou Venda)
  async registrarMovimentacao(serie, tipo, destino, checklist) {
    let maquinas = (await db.getItem('maquinas')) || []
    let maquina = maquinas.find((m) => m.serie === serie)

    if (maquina) {
      maquina.status = tipo === 'venda' ? 'vendida' : 'em_transito'
      maquina.unidadeDestino = destino
      maquina.historico.push({
        data: new Date().toISOString(),
        tipo,
        destino,
        checklist,
      })
      await db.setItem('maquinas', maquinas)
    }
  },

  // 4. Salvar checklist no Painel Master (Configuração)
  async salvarConfigChecklist(itens) {
    await db.setItem('config_checklist', itens)
  },

  // Dentro do seu PosVendaService.js

  // Buscar itens já configurados no Painel Master (reaproveitando o que você já tem)
  async getItensChecklistConfigurados() {
    // Aqui você busca do local onde o Painel Master salva as configurações
    // Se o seu Painel Master salva em uma chave chamada 'config_checklists', faremos:
    const configs = (await localforage.getItem('config_checklists')) || []

    // Filtramos apenas o que pertence ao setor 'pos_venda'
    return configs.filter((item) => item.setor === 'pos_venda')
  },

  // Buscar os dados de uma máquina específica pelo número de série
  async getMaquinaBySerie(serie) {
    const maquinas = (await localforage.getItem('maquinas')) || []
    return maquinas.find((m) => m.serie === serie)
  },
}
