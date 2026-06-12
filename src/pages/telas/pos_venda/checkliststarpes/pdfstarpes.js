import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import logoTimbrado from 'src/assets/logo-timbrado.png'
import localforage from 'localforage'
pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts.default?.pdfMake?.vfs || pdfFonts.vfs

const imagemParaBase64 = async (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = (e) => reject(e)
    img.src = url
  })
}

const formatarImagem = (img) => {
  if (!img || typeof img !== 'string') return null
  const limpa = img.replace(/\s+/g, '')
  if (
    limpa.startsWith('data:image/png') ||
    limpa.startsWith('data:image/jpeg') ||
    limpa.startsWith('data:image/jpg')
  ) {
    return limpa
  }
  console.warn('⚠️ IMAGEM BLOQUEADA: Formato não suportado pelo PDF ->', limpa.substring(0, 30))
  return null
}

export const gerarStarpesPdf = async (dadosDaTela, retornarBase64 = false) => {
  console.log('DADOS RECEBIDOS NO GERADOR DE PDF STARPES:', dadosDaTela)

  let nomeUsuario = dadosDaTela.userName || 'Usuário'
  if (nomeUsuario === 'Usuário') {
    try {
      const sessao = await localforage.getItem('user_session')
      if (sessao?.nome) nomeUsuario = sessao.nome
    } catch {
      // segue com 'Usuário'
    }
  }

  const dataHoraPdf = dadosDaTela.dataHoraFormatada || new Date().toLocaleString('pt-BR')
  const {
    categoriaNome,
    formulario,
    maquinasSelecionadas,
    secoes,
    assinaturas,
  } = dadosDaTela

  const imgTec = formatarImagem(assinaturas?.tecnicoImagem)
  const imgCli = formatarImagem(assinaturas?.clienteImagem)

  let logoBase64 = null
  try {
    logoBase64 = formatarImagem(await imagemParaBase64(logoTimbrado))
  } catch (e) {
    console.error('Erro ao carregar a logo', e)
  }

  // ================= MÁQUINAS (grid com checkbox) =================
  const maquinasRows = []
  if (maquinasSelecionadas && maquinasSelecionadas.length > 0) {
    // Divide em pares para grid de 2 colunas
    for (let i = 0; i < maquinasSelecionadas.length; i += 2) {
      const row = []
      row.push({
        text: `☑ ${maquinasSelecionadas[i]}`,
        style: 'maquinaText',
        width: '*',
      })
      if (maquinasSelecionadas[i + 1]) {
        row.push({
          text: `☑ ${maquinasSelecionadas[i + 1]}`,
          style: 'maquinaText',
          width: '*',
        })
      } else {
        row.push({ text: '', width: '*' })
      }
      maquinasRows.push(row)
    }
  }

  // ================= ITENS POR SEÇÃO =================
  const secoesContent = []
  if (secoes && secoes.length > 0) {
    secoes.forEach((secao) => {
      // Título da seção
      secoesContent.push({
        text: secao.titulo,
        style: 'sectionTitulo',
        margin: [0, 15, 0, 5],
      })

      // Tabela de itens da seção
      const body = [
        [
          { text: 'ITEM', style: 'itemHeader' },
          { text: 'R', style: 'itemHeader', alignment: 'center' },
          { text: 'A', style: 'itemHeader', alignment: 'center' },
          { text: 'V', style: 'itemHeader', alignment: 'center' },
          { text: 'OBSERVAÇÕES', style: 'itemHeader' },
        ],
      ]

      if (secao.itens && secao.itens.length > 0) {
        secao.itens.forEach((item) => {
          const resposta = item.resposta || ''
          body.push([
            { text: item.texto, style: 'itemText' },
            {
              text: resposta === 'R' ? '●' : '○',
              style: 'statusCircle',
              color: resposta === 'R' ? '#c62828' : '#ccc',
              alignment: 'center',
            },
            {
              text: resposta === 'A' ? '●' : '○',
              style: 'statusCircle',
              color: resposta === 'A' ? '#ef6c00' : '#ccc',
              alignment: 'center',
            },
            {
              text: resposta === 'V' ? '●' : '○',
              style: 'statusCircle',
              color: resposta === 'V' ? '#2e7d32' : '#ccc',
              alignment: 'center',
            },
            { text: item.observacao || '-', style: 'itemText' },
          ])
        })
      }

      secoesContent.push({
        table: {
          widths: ['*', 25, 25, 25, '*'],
          headerRows: 1,
          dontBreakRows: true,
          body,
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#ddd',
          vLineColor: () => '#ddd',
          fillColor: (rowIndex) => (rowIndex === 0 ? '#f5f5f5' : null),
        },
        margin: [0, 0, 0, 10],
      })
    })
  }

  // ================= ASSINATURAS =================
  const blocoAssinatura = (img, nome, label) => ({
    stack: [
      img
        ? { image: img, width: 150, alignment: 'center' }
        : { text: '\n(Sem assinatura)\n', alignment: 'center', color: '#ccc' },
      { text: '____________________________________', alignment: 'center', margin: [0, 5, 0, 0] },
      { text: `${label}: ${nome || ''}`, alignment: 'center' },
    ],
  })

  const colunasAssinaturas = [
    blocoAssinatura(imgTec, assinaturas?.tecnicoNome, 'Técnico'),
    blocoAssinatura(imgCli, assinaturas?.clienteNome, 'Cliente'),
  ]

  // ================= DOCUMENTO PDF =================
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 70, 40, 70],

    header: () =>
      logoBase64
        ? { image: logoBase64, width: 515, alignment: 'center', margin: [0, 20, 0, 10] }
        : null,

    footer: (currentPage, pageCount) => {
      return {
        stack: [
          {
            text: `Checklist Starpes realizado por: ${nomeUsuario} em ${dataHoraPdf}`,
            fontSize: 8,
            color: '#F3772C',
            alignment: 'center',
            margin: [40, 0, 40, 3],
            bold: true,
          },
          {
            canvas: [
              { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#F3772C' },
            ],
            margin: [40, 0, 40, 5],
          },
          {
            text: `Dinâmica Máquinas Agrícolas LTDA — Página ${currentPage} de ${pageCount}`,
            fontSize: 7,
            color: '#555',
            alignment: 'center',
            margin: [40, 0, 40, 0],
          },
        ],
      }
    },

    content: [
      { text: '\nCHECKLIST STARPES', style: 'header', alignment: 'center' },
      {
        text: `\n${categoriaNome ? categoriaNome.toUpperCase() : 'INSPEÇÃO'}`,
        style: 'subheader',
        alignment: 'center',
      },

      // DADOS DO CHECKLIST
      { text: 'DADOS DO CHECKLIST', style: 'sectionTitulo' },
      { text: '\n' },
      {
        margin: [0, 0, 0, 20],
        columns: [
          {
            width: '45%',
            stack: [
              { text: 'CONCESSIONÁRIA', style: 'label' },
              { text: formulario?.concessionaria || '-', style: 'value', alignment: 'left' },
              {
                canvas: [
                  { type: 'line', x1: 0, y1: 5, x2: 230, y2: 5, lineWidth: 0.5, lineColor: '#F3772C' },
                ],
                margin: [0, 0, 0, 10],
              },

              { text: 'CLIENTE', style: 'label' },
              { text: formulario?.cliente || '-', style: 'value', alignment: 'left' },
              {
                canvas: [
                  { type: 'line', x1: 0, y1: 5, x2: 230, y2: 5, lineWidth: 0.5, lineColor: '#F3772C' },
                ],
                margin: [0, 0, 0, 10],
              },

              { text: 'PRODUTO', style: 'label' },
              { text: formulario?.produto || '-', style: 'value', alignment: 'left' },
              {
                canvas: [
                  { type: 'line', x1: 0, y1: 5, x2: 230, y2: 5, lineWidth: 0.5, lineColor: '#F3772C' },
                ],
                margin: [0, 0, 0, 10],
              },
            ],
          },
          { text: '', width: '10%' },
          {
            width: '45%',
            stack: [
              { text: 'DATA', style: 'label' },
              { text: formulario?.data || '-', style: 'value', alignment: 'left' },
              {
                canvas: [
                  { type: 'line', x1: 0, y1: 5, x2: 230, y2: 5, lineWidth: 0.5, lineColor: '#F3772C' },
                ],
                margin: [0, 0, 0, 10],
              },

              { text: 'TÉCNICO', style: 'label' },
              { text: formulario?.tecnico || '-', style: 'value', alignment: 'left' },
              {
                canvas: [
                  { type: 'line', x1: 0, y1: 5, x2: 230, y2: 5, lineWidth: 0.5, lineColor: '#F3772C' },
                ],
                margin: [0, 0, 0, 10],
              },

              { text: 'SÉRIE / ANO', style: 'label' },
              { text: formulario?.serieAno || '-', style: 'value', alignment: 'left' },
              {
                canvas: [
                  { type: 'line', x1: 0, y1: 5, x2: 230, y2: 5, lineWidth: 0.5, lineColor: '#F3772C' },
                ],
                margin: [0, 0, 0, 10],
              },
            ],
          },
        ],
      },

      // MÁQUINAS
      { text: 'MÁQUINAS', style: 'sectionTitulo' },
      ...(maquinasRows.length > 0
        ? [
            {
              table: {
                widths: ['*', '*'],
                body: maquinasRows,
              },
              layout: { hLineWidth: () => 0, vLineWidth: () => 0 },
              margin: [0, 5, 0, 15],
            },
          ]
        : [{ text: 'Nenhuma máquina selecionada', style: 'itemText', margin: [0, 5, 0, 15] }]),

      // ITENS POR SEÇÃO
      ...secoesContent,

      // LEGENDA
      {
        text: '\nLEGENDA',
        style: 'sectionTitulo',
        margin: [0, 20, 0, 5],
      },
      {
        columns: [
          {
            stack: [
              { text: '● R = Reparo Imediato', color: '#c62828', style: 'legendaText' },
              { text: '● A = Reparo Futuro', color: '#ef6c00', style: 'legendaText' },
              { text: '● V = OK (Verificado)', color: '#2e7d32', style: 'legendaText' },
            ],
          },
        ],
        margin: [0, 0, 0, 20],
      },

      // ASSINATURAS
      {
        text: 'ASSINATURAS',
        style: 'sectionTitulo',
        margin: [0, 30, 0, 10],
        pageBreak: 'before',
      },

      { columns: colunasAssinaturas },
    ],

    styles: {
      header: { fontSize: 18, bold: true, color: '#F3772C', alignment: 'center' },
      subheader: { fontSize: 12, color: '#555', alignment: 'center', margin: [0, 0, 0, 20] },
      sectionTitulo: {
        fontSize: 14,
        bold: true,
        color: '#333',
        margin: [0, 5, 0, 10],
        decoration: 'underline',
        decorationColor: '#F3772C',
      },
      label: { fontSize: 8, bold: true, color: '#F3772C', letterSpacing: 1 },
      value: { fontSize: 11, color: '#000', margin: [0, 2, 0, 0] },
      itemHeader: { fontSize: 9, bold: true, color: '#666', margin: [0, 5, 0, 5] },
      itemText: { fontSize: 10, color: '#333', margin: [0, 5, 0, 5] },
      statusCircle: { fontSize: 14, bold: true, alignment: 'center', margin: [5, 2, 5, 2] },
      maquinaText: { fontSize: 10, color: '#333', margin: [0, 3, 0, 3] },
      legendaText: { fontSize: 10, bold: true, margin: [0, 2, 0, 2] },
    },
  }

  const pdfDoc = pdfMake.createPdf(docDefinition)

  if (retornarBase64) {
    return await pdfDoc.getDataUrl()
  }

  const nomeArquivo = formulario?.cliente || formulario?.produto || categoriaNome || 'Starpes'
  await pdfDoc.download(`Checklist_Starpes_${nomeArquivo}.pdf`)
}
