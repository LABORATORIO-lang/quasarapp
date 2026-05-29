import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import logoTimbrado from 'src/assets/logo-timbrado.png'

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

// ==========================================
// MÁQUINA DE LIMPEZA DE IMAGENS (BLINDAGEM)
// ==========================================
// ==========================================
// MÁQUINA DE LIMPEZA DE IMAGENS (BLINDAGEM ESTILIZADA)
// ==========================================
const formatarImagem = (img) => {
  if (!img || typeof img !== 'string') return null

  // Limpa espaços invisíveis ou quebras de linha que corrompem o base64
  const limpa = img.replace(/\s+/g, '')

  // O pdfMake SÓ suporta PNG, JPG e JPEG.
  // Bloqueamos WebP, SVG, GIF, etc., que causam o erro "Unknown image format"
  if (
    limpa.startsWith('data:image/png') ||
    limpa.startsWith('data:image/jpeg') ||
    limpa.startsWith('data:image/jpg')
  ) {
    return limpa
  }

  // Se chegar aqui, é porque a imagem está num formato não suportado (ex: WebP)
  console.warn('⚠️ IMAGEM BLOQUEADA: Formato não suportado pelo PDF ->', limpa.substring(0, 30))
  return null
}

export const gerarChecklistPdf = async (dadosDaTela) => {
  console.log('DADOS RECEBIDOS NO GERADOR DE PDF:', dadosDaTela)

  const { nomeMaquina, formulario, itens, assinaturas, fotosGerais } = dadosDaTela

  // 1. Limpar e validar as assinaturas com segurança logo de início
  const imgVend = formatarImagem(assinaturas?.vendedorImagem)
  const imgCli = formatarImagem(assinaturas?.clienteImagem)
  const imgTec = formatarImagem(assinaturas?.tecnicoImagem)

  let logoBase64 = null
  try {
    logoBase64 = formatarImagem(await imagemParaBase64(logoTimbrado))
  } catch (e) {
    console.error('Erro ao carregar a logo', e)
  }

  // --- MONTANDO LISTA ÚNICA DE FOTOS ---
  const todasAsFotos = []

  // 2. Fotos Gerais com BLINDAGEM MÁXIMA
  if (fotosGerais) {
    ;['Frente', 'Direita', 'Traseira', 'Esquerda'].forEach((pos) => {
      const fotoLimpa = formatarImagem(fotosGerais[pos])
      if (fotoLimpa) {
        todasAsFotos.push({ titulo: `Foto Geral - ${pos}`, base64: fotoLimpa })
      }
    })
  }

  // 3. Fotos dos Itens com BLINDAGEM MÁXIMA
  if (itens && itens.length > 0) {
    itens.forEach((item, index) => {
      if (item.fotos?.length > 0) {
        item.fotos.forEach((foto) => {
          const fotoLimpa = formatarImagem(foto)
          if (fotoLimpa) {
            todasAsFotos.push({ titulo: `Item ${index + 1}: ${item.texto}`, base64: fotoLimpa })
          }
        })
      }
    })
  }

  // --- CRIANDO PÁGINAS DE FOTOS ---
  const anexosContent = []
  for (let i = 0; i < todasAsFotos.length; i += 2) {
    const par = todasAsFotos.slice(i, i + 2)

    const pagina = {
      stack: [],
      pageBreak: 'before',
      margin: [0, 0],
    }

    par.forEach((foto, index) => {
      pagina.stack.push({
        text: foto.titulo,
        style: 'sectionTitulo',
        fontSize: 12,
        alignment: 'center',
        margin: [0, index === 0 ? 0 : 10, 0, 5],
      })
      pagina.stack.push({
        image: foto.base64,
        width: 400,
        height: 300,
        fit: [400, 300],
        alignment: 'center',
        margin: [0, 0, 0, 5],
      })
    })
    anexosContent.push(pagina)
  }

  // --- DEFINIÇÃO DO DOCUMENTO ---
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
            canvas: [
              { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#F3772C' },
            ],
            margin: [40, 0, 40, 5],
          },
          {
            text: `Dinâmica Máquinas Agrícolas LTDA, Fone: (65) 3382-4743\nEndereço: Av. Olacyr Francisco de Moraes, nº 3005 - Bairro Area Urbana II, CEP 78.360-000 - Campo Novo do Parecis/MT\nPágina ${currentPage} de ${pageCount}`,
            fontSize: 8,
            color: '#555',
            alignment: 'center',
            margin: [40, 0, 40, 0],
          },
        ],
      }
    },

    content: [
      { text: '\nRELATÓRIO DE AVALIAÇÃO', style: 'header', alignment: 'center' },
      {
        text: `\n${nomeMaquina ? nomeMaquina.toUpperCase() : 'EQUIPAMENTO'}`,
        style: 'subheader',
        alignment: 'center',
      },

      { text: 'DADOS DO EQUIPAMENTO', style: 'sectionTitulo' },
      { text: '\n' },
      {
        margin: [0, 0, 0, 20],
        columns: [
          // ==========================================
          // COLUNA DA ESQUERDA (4 Campos)
          // ==========================================
          {
            width: '45%',
            stack: [
              { text: 'CLIENTE', style: 'label' },
              { text: formulario?.cliente || '-', style: 'value', alignment: 'left' },
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 0,
                    y1: 5,
                    x2: 230,
                    y2: 5,
                    lineWidth: 0.5,
                    lineColor: '#F3772C',
                  },
                ],
                margin: [0, 0, 0, 10],
              },

              { text: 'MARCA', style: 'label' },
              { text: formulario?.marca || '-', style: 'value', alignment: 'left' },
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 0,
                    y1: 5,
                    x2: 230,
                    y2: 5,
                    lineWidth: 0.5,
                    lineColor: '#F3772C',
                  },
                ],
                margin: [0, 0, 0, 10],
              },

              { text: 'SÉRIE', style: 'label' },
              { text: formulario?.serie || '-', style: 'value', alignment: 'left' },
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 0,
                    y1: 5,
                    x2: 230,
                    y2: 5,
                    lineWidth: 0.5,
                    lineColor: '#F3772C',
                  },
                ],
                margin: [0, 0, 0, 10],
              },

              // ---> HORÍMETRO NA ESQUERDA <---
              { text: 'HORÍMETRO', style: 'label' },
              { text: formulario?.horimetro || '-', style: 'value', alignment: 'left' },
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 0,
                    y1: 5,
                    x2: 230,
                    y2: 5,
                    lineWidth: 0.5,
                    lineColor: '#F3772C',
                  },
                ],
                margin: [0, 0, 0, 10],
              },
            ],
          },

          // ==========================================
          // ESPAÇO VAZIO NO MEIO
          // ==========================================
          { text: '', width: '10%' },

          // ==========================================
          // COLUNA DA DIREITA (3 Campos)
          // ==========================================
          {
            width: '45%',
            stack: [
              { text: 'CIDADE', style: 'label' },
              { text: formulario?.cidade || '-', style: 'value', alignment: 'left' },
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 0,
                    y1: 5,
                    x2: 230,
                    y2: 5,
                    lineWidth: 0.5,
                    lineColor: '#F3772C',
                  },
                ],
                margin: [0, 0, 0, 10],
              },

              { text: 'MODELO', style: 'label' },
              { text: formulario?.modelo || '-', style: 'value', alignment: 'left' },
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 0,
                    y1: 5,
                    x2: 230,
                    y2: 5,
                    lineWidth: 0.5,
                    lineColor: '#F3772C',
                  },
                ],
                margin: [0, 0, 0, 10],
              },

              { text: 'ANO', style: 'label' },
              { text: formulario?.ano || '-', style: 'value', alignment: 'left' },
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 0,
                    y1: 5,
                    x2: 230,
                    y2: 5,
                    lineWidth: 0.5,
                    lineColor: '#F3772C',
                  },
                ],
                margin: [0, 0, 0, 10],
              },
            ],
          },
        ],
      },

      { text: 'ITENS VERIFICADOS', style: 'sectionTitulo' },
      {
        table: {
          widths: ['*', 70, '*'],
          headerRows: 1,
          dontBreakRows: true,
          body: [
            [
              { text: 'ITEM', style: 'itemHeader' },
              { text: 'STATUS', style: 'itemHeader', alignment: 'center' },
              { text: 'OBSERVAÇÕES', style: 'itemHeader' },
            ],
            ...(itens || []).map((i) => {
              let corStatus = '#666'
              let textoStatus = i.resposta || 'N/A'
              if (['SIM', 'BOM', 'OK'].includes(textoStatus)) corStatus = '#2e7d32'
              else if (textoStatus === 'ATENCAO') corStatus = '#ef6c00'
              else if (['RUIM', 'NAO'].includes(textoStatus)) corStatus = '#c62828'
              return [
                { text: i.texto, style: 'itemText' },
                { text: textoStatus, style: 'statusBadge', color: corStatus, bold: true },
                { text: i.observacao || '-', style: 'itemText' },
              ]
            }),
          ],
        },
        layout: { hLineWidth: () => 0.5, vLineWidth: () => 0, hLineColor: () => '#ddd' },
        margin: [0, 0, 0, 20],
      },

      // --- 1º ANEXOS (Fotos aparecem antes das assinaturas) ---
      ...(anexosContent || []),

      // --- 2º ASSINATURAS ---
      {
        text: 'ASSINATURAS',
        style: 'sectionTitulo',
        margin: [0, 30, 0, 10],
        // A MÁGICA DA QUEBRA DE PÁGINA DEPENDENDO DO NÚMERO DE FOTOS
        ...(todasAsFotos.length > 0 && todasAsFotos.length % 2 === 0
          ? { pageBreak: 'before' }
          : {}),
      },

      {
        columns: [
          // Vendedor
          {
            stack: [
              imgVend
                ? { image: imgVend, width: 150, alignment: 'center' }
                : { text: '\n(Sem assinatura)\n', alignment: 'center', color: '#ccc' },
              {
                text: '____________________________________',
                alignment: 'center',
                margin: [0, 5, 0, 0],
              },
              { text: 'Vendedor(a): ' + (assinaturas?.vendedorNome || ''), alignment: 'center' },
            ],
          },
          // Cliente
          {
            stack: [
              imgCli
                ? { image: imgCli, width: 150, alignment: 'center' }
                : { text: '\n(Sem assinatura)\n', alignment: 'center', color: '#ccc' },
              {
                text: '____________________________________',
                alignment: 'center',
                margin: [0, 5, 0, 0],
              },
              { text: 'Cliente: ' + (assinaturas?.clienteNome || ''), alignment: 'center' },
            ],
          },
        ],
      },
      // Técnico
      imgTec || assinaturas?.tecnicoNome
        ? {
            stack: [
              imgTec
                ? { image: imgTec, width: 150, alignment: 'center' }
                : { text: '\n(Sem assinatura)\n', alignment: 'center', color: '#ccc' },
              {
                text: '____________________________________',
                alignment: 'center',
                margin: [0, 5, 0, 0],
              },
              { text: 'Técnico: ' + (assinaturas?.tecnicoNome || ''), alignment: 'center' },
            ],
            margin: [0, 40, 0, 0],
          }
        : null,
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
      statusBadge: { fontSize: 9, bold: true, alignment: 'center', margin: [5, 2, 5, 2] },
    },
  }

  pdfMake.createPdf(docDefinition).download(`Checklist_${formulario?.cliente || 'Equipamento'}.pdf`)
}
