import { defineStore } from 'pinia'

export const useChecklistStore = defineStore('checklist', {
  state: () => ({
    tipoChecklist: '', // Ex: 'Pulverizador', 'Plantio'
    items: [], // Lista de itens do checklist
    rascunhos: [], // Lista de rascunhos salvos localmente
  }),

  actions: {
    setTipo(tipo) {
      this.tipoChecklist = tipo
    },

    // Aqui vamos implementar a lógica para salvar no LocalStorage
    salvarRascunho(dados) {
      this.rascunhos.push(dados)
      localStorage.setItem('checklist_rascunhos', JSON.stringify(this.rascunhos))
    },

    carregarRascunhos() {
      const salvos = localStorage.getItem('checklist_rascunhos')
      if (salvos) {
        this.rascunhos = JSON.parse(salvos)
      }
    },
  },
})
