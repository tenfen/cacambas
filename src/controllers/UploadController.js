// Resources
import API from "../helpers/API"

export const UploadController = {
  upload: async (files, path, keys = []) => {
    console.log('images----------------------', files)
    console.log('path----------------------', path)
    console.log('keys----------------------', keys)
    const Images ={
      files:[],
      path:path,
      keys:keys,
    };
    
    // Função para converter o arquivo para Base64
    const toBase64 = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);  // Converte a imagem para base64
      reader.onload = () => {
        // Remove o prefixo 'data:image/jpeg;base64,' ou 'data:image/png;base64,' antes de enviar
        const base64 = reader.result.split(',')[1]; // Pega a parte depois da vírgula
        resolve(base64);
      };
      reader.onerror = error => reject(error);  // Lida com erro
    });


    for (const file of files) {
      console.log('imagefile-------', file.imageFile)

      if (file.imageFile && file.imageFile instanceof File) {
        try {
          const base64 = await toBase64(file.imageFile);  // Converte a imagem para Base64

          // Cria um objeto com base64, fileName e mimeType
          Images.files.push({
            base64: base64,
            fileName: file.imageFile.name,
            mimeType: file.imageFile.type,
          });
        } catch (error) {
          console.error("Error converting file to Base64:", error);
        }
      } 
      else {
        console.error("imageFile is not a valid File object:", file.imageFile);
      }
    }
    console.log('Images------------',Images)

    return API.request("/upload", Images, "POST")
  },
}

export default UploadController
