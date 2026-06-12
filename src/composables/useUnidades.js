import { ref } from 'vue'
import { doc, getDoc } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const unidades = ref([])
let carregado = false

export function useUnidades() {
  const carregarUnidades = async () => {
    if (carregado && unidades.value.length > 0) return
    try {
      const docSnap = await getDoc(doc(db, 'configuracoes', 'geral'))
      if (docSnap.exists()) {
        unidades.value = docSnap.data().unidades || []
      }
      carregado = true
    } catch (e) {
      console.error('Erro ao carregar unidades:', e)
      // Fallback
      unidades.value = [
        'Campo Novo do Parecis',
        'Tangará da Serra',
        'Nova Mutum',
        'Juína',
        'Agro reformas',
      ]
    }
  }

  return { unidades, carregarUnidades }
}
