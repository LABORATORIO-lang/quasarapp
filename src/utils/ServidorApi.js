// Serviço para comunicar com a API do servidor local
// Substitui/armazena dados além do Firebase

export const API_BASE_URL = 'https://gonna-sessions-farms-org.trycloudflare.com'

// ==========================================
// CHECKLIST COMERCIAL (por cidade/vendedor)
// ==========================================

/**
 * Salvar checklist comercial no servidor (pasta da cidade do vendedor)
 * @param {string} cidade - Nome completo da cidade (ex: "Campo Novo do Parecis")
 * @param {string} vendedor - Nome do vendedor
 * @param {object} checklistData - Dados do checklist
 */
export async function salvarChecklistComercial(cidade, vendedor, pdfBase64, cliente, nomeMaquina) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/comercial/checklist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cidade,
        vendedor,
        pdfBase64,
        cliente,
        nomeMaquina,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro ao salvar checklist comercial no servidor:', error)
    throw error
  }
}

/**
 * Listar checklists comerciais de uma cidade
 * @param {string} sigla - Sigla da cidade (cnp, nm, tga, jna)
 */
export async function listarChecklistsComerciais(sigla) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/comercial/${sigla}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('Erro ao listar checklists comerciais:', error)
    return []
  }
}

/**
 * Listar checklists comerciais de um vendedor
 * @param {string} sigla - Sigla da cidade
 * @param {string} vendedor - Nome do vendedor
 */
export async function listarChecklistsVendedor(sigla, vendedor) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/comercial/${sigla}/${encodeURIComponent(vendedor)}`,
    )
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('Erro ao listar checklists do vendedor:', error)
    return []
  }
}

/**
 * Salvar checklist no servidor
 */
export async function salvarChecklistNoServidor(categoria, checklistData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/checklists/${categoria}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checklistData),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro ao salvar checklist no servidor:', error)
    throw error
  }
}

/**
 * Listar checklists do servidor
 */
export async function listarChecklistsDoServidor(categoria) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/checklists/${categoria}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro ao listar checklists do servidor:', error)
    return []
  }
}

/**
 * Upload de PDF para o servidor
 */
export async function uploadPdfParaServidor(pdfBase64, filename, tipo = 'checklists') {
  try {
    // Remove o prefixo data:application/pdf;base64, se existir
    const base64Data = pdfBase64.includes(',') ? pdfBase64.split(',')[1] : pdfBase64

    const response = await fetch(`${API_BASE_URL}/api/upload/base64/${tipo}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename,
        data: base64Data,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro ao fazer upload do PDF:', error)
    throw error
  }
}
// ... dentro do seu ServidorApi.js ...

export async function salvarChecklistLogistica(cidade, pdfNome, pdfBase64) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/logistica/carregamento`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cidade,
        pdfNome,
        pdfBase64,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro ao salvar checklist logística no servidor:', error)
    throw error
  }
}

export async function salvarTransferenciaPosVenda(cidade, pdfNome, pdfBase64) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pos-venda/transferencia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cidade, pdfNome, pdfBase64 }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro ao salvar PDF transferência no servidor:', error)
    throw error
  }
}

export async function salvarEdicaoPosVenda(cidade, pdfNome, pdfBase64) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pos-venda/edicao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cidade, pdfNome, pdfBase64 }),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('Erro ao salvar edicao no servidor:', error)
    throw error
  }
}

/**
 * Upload de foto para o servidor
 */
export async function uploadFotoParaServidor(fotoBase64, filename, tipo = 'fotos') {
  try {
    // Remove o prefixo data:image/...;base64, se existir
    const base64Data = fotoBase64.includes(',') ? fotoBase64.split(',')[1] : fotoBase64

    const response = await fetch(`${API_BASE_URL}/api/upload/base64/${tipo}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename,
        data: base64Data,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro ao fazer upload da foto:', error)
    throw error
  }
}

/**
 * Fazer backup completo no servidor
 */
export async function fazerBackupNoServidor(dadosCompletos) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/backup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosCompletos),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro ao fazer backup no servidor:', error)
    throw error
  }
}

/**
 * Listar backups do servidor
 */
export async function listarBackupsDoServidor() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/backup/lista`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro ao listar backups do servidor:', error)
    return []
  }
}

/**
 * Verificar status do servidor
 */
export async function verificarStatusServidor() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      // Timeout de 5 segundos
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      return { online: false, error: `HTTP ${response.status}` }
    }

    const data = await response.json()
    return { online: true, ...data }
  } catch (error) {
    return { online: false, error: error.message }
  }
}

export async function salvarChecklistPosVenda(cidade, pdfNome, pdfBase64) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pos-venda/checklist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cidade,
        pdfNome,
        pdfBase64,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro ao salvar checklist pós-venda no servidor:', error)
    throw error
  }
}

/**
 * Salvar checklist com PDF no servidor (função completa)
 * Usada no StarpesForm.vue e ChecklistPosForm.vue
 */
export async function salvarChecklistCompleto(categoria, dados) {
  const resultado = {
    checklistSalvo: false,
    pdfSalvo: false,
    checklist: null,
    pdf: null,
    error: null,
  }

  try {
    // 1. Salvar o checklist JSON
    const checklistResult = await salvarChecklistNoServidor(categoria, dados)
    resultado.checklistSalvo = checklistResult.success
    resultado.checklist = checklistResult

    // 2. Se tiver PDF, salvar também
    if (dados.pdfFisico) {
      const filename = `checklist_${dados.id || Date.now()}.pdf`
      const pdfResult = await uploadPdfParaServidor(dados.pdfFisico, filename, categoria)
      resultado.pdfSalvo = pdfResult.success
      resultado.pdf = pdfResult
    }

    return resultado
  } catch (error) {
    resultado.error = error.message
    console.error('Erro ao salvar checklist completo:', error)
    return resultado
  }
}

export default {
  salvarChecklistNoServidor,
  listarChecklistsDoServidor,
  uploadPdfParaServidor,
  uploadFotoParaServidor,
  fazerBackupNoServidor,
  listarBackupsDoServidor,
  verificarStatusServidor,
  salvarChecklistCompleto,
  salvarChecklistLogistica,
}
