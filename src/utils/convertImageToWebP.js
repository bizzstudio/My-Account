// convertImageToWebP.js
import Pica from 'pica';

const pica = new Pica(); // יצירת מופע של pica

/**
 * ממיר תמונה לפורמט WebP ודוחס אותה.
 * @param {File} file - קובץ התמונה להמרה
 * @returns {Promise<File>} - קובץ WebP מומר ודחוס
 */
const convertImageToWebP = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
  
      img.onload = async () => {
        try {
          const canvas = document.createElement("canvas");
  
          const maxWidth = 1920;
          const scale = img.width > maxWidth ? maxWidth / img.width : 1;
  
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
  
          await pica.resize(img, canvas);
          const blob = await pica.toBlob(canvas, "image/webp", 0.8);
  
          URL.revokeObjectURL(url);
  
          resolve(
            new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, ".webp"),
              { type: "image/webp" }
            )
          );
        } catch (err) {
          console.error("WebP conversion failed:", err);
          URL.revokeObjectURL(url);
          resolve(null);
        }
      };
  
      img.onerror = () => {
        console.error("Image load failed:", file.name);
        URL.revokeObjectURL(url);
        resolve(null);
      };
  
      img.src = url;
    });
  };
  

/**
 * מבצע המרה של קבצים לפורמט WebP אם הם תמונות.
 * @param {File[]} acceptedFiles - רשימת הקבצים להמרה
 * @returns {Promise<File[]>} - רשימת הקבצים לאחר המרה ודחיסה
 */
const handleFileUpload = async (acceptedFiles) => {
    const webPFiles = await Promise.all(
        acceptedFiles.map(async (file) => {
            if (file.type.startsWith('image/')) {
                return await convertImageToWebP(file);
            }
            return file;
        })
    );

    // ⬅️ זה מה שמונע את הקריסה
    return webPFiles.filter(
        (file) => file && typeof file.size === "number"
    );
};


export default handleFileUpload;
