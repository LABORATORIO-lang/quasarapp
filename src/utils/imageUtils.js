export const redimensionarImagem = (file, maxWidth = 800) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // Calcula a proporção para manter a qualidade e evitar distorção
        const scale = maxWidth / img.width
        const canvas = document.createElement('canvas')
        canvas.width = maxWidth
        canvas.height = img.height * scale

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // Retorna a imagem redimensionada (JPEG, qualidade 0.7)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.onerror = (err) => reject(err)
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}
