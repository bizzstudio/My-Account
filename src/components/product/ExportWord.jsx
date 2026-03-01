import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import Cookies from "js-cookie";

// מחזיר מפה של { productId: driveFolderLink } לשימוש בשליחת מייל
const ExportWord = async (products, isCheck = [], template = null) => {
  const uploadedFiles = [];
  const driveLinks = {}; // productId → folder webViewLink

  const dataToExport =
    isCheck.length > 0
      ? products.filter((p) => isCheck.includes(p._id))
      : products;

  try {
    let content;

    if (template) {
      // תבנית שהועלתה על ידי האדמין — מורידים מהדרייב דרך הבקאנד
      const tokenHolder = Cookies.get("userInfo") ? JSON.parse(Cookies.get("userInfo")) : null;
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_BASE_URL}/templates/${template._id}/file`,
        {
          headers: {
            Authorization: tokenHolder ? `Bearer ${tokenHolder.token}` : "",
            "Cache-Control": "no-cache",
          },
        }
      );
      if (!response.ok)
        throw new Error(`Template fetch failed. Status: ${response.status}`);
      content = await response.arrayBuffer();
    } else {
      // תבנית ברירת מחדל — מהתיקייה הציבורית
      const response = await fetch(`/template.docx?${Date.now()}`, {
        cache: "no-cache",
      });
      if (!response.ok)
        throw new Error(`Template not found. Status: ${response.status}`);
      content = await response.arrayBuffer();
    }

    for (let product of dataToExport) {
      const borrowers = product.borrowers?.length ? product.borrowers : [{}];

      for (let borrower of borrowers) {
        const safeData = {
          borrowerName: borrower.borrowerName || "-",
          borrowerIdNumber: borrower.borrowerIdNumber || "-",
          borrowerFamily: borrower.borrowerFamily || "-",
          borrowerAddress: borrower.borrowerAddress || "-",
          borrowerEmail: borrower.borrowerEmail || "-",
        };

        const zip = new PizZip(content.slice(0));
        const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
        await doc.renderAsync(safeData);

        const blob = doc.getZip().generate({ type: "blob" });

        const formData = new FormData();
        formData.append("file", blob, `${safeData.borrowerName}.docx`);
        const uniqueFolderName = safeData.borrowerName || "Unknown";
        formData.append("folderName", uniqueFolderName);

        const res = await fetch("/api/upload-to-drive", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          console.error("❌ Upload failed for", safeData.borrowerName);
        } else {
          const templateName = template?.name || "תבנית ברירת מחדל";
          uploadedFiles.push({ borrower: safeData.borrowerName, template: templateName });
          const data = await res.json();
          if (data?.folder?.webViewLink) {
            driveLinks[product._id] = data.folder.webViewLink;
          }
        }
      }
    }

    return { driveLinks, uploadedFiles };
  } catch (err) {
    console.error("Error processing files:", err);
    return { driveLinks: {}, uploadedFiles: [] };
  }
};

export default ExportWord;
