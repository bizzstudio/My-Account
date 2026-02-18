import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

const ExportWord = async (products, isCheck = []) => {
  const uploadedFiles = [];

  const dataToExport =
    isCheck.length > 0
      ? products.filter((p) => isCheck.includes(p._id))
      : products;

  try {
    // טוענים את התבנית
    const response = await fetch(`/template.docx?${Date.now()}`, {
      cache: "no-cache",
    });
    if (!response.ok)
      throw new Error(`Template not found. Status: ${response.status}`);

    const content = await response.arrayBuffer();

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
        const uniqueFolderName = safeData.borrowerIdNumber || "Unknown";
        formData.append("folderName", uniqueFolderName);

        const res = await fetch("/api/upload-to-drive", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) console.error("❌ Upload failed for", safeData.borrowerName);
        else uploadedFiles.push(`${safeData.borrowerName}.docx`);
      }
    }

    // אלרט בהתאם למספר הקבצים
    if (uploadedFiles.length === 1) {
      alert(`✅ הקובץ ${uploadedFiles[0]} הועלה בהצלחה!`);
    } else if (uploadedFiles.length > 1) {
      alert(
        `✅ ${uploadedFiles.length} קבצים הועלו בהצלחה:\n- ${uploadedFiles.join(
          "\n- "
        )}`
      );
    }
  } catch (err) {
    console.error("Error processing files:", err);
  }
};

export default ExportWord;
