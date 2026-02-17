import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

const ExportWord = async (products, isCheck = []) => {
  const dataToExport = isCheck.length > 0
    ? products.filter(p => isCheck.includes(p._id))
    : products;

  try {
    const response = await fetch("/template.docx?" + Date.now(), { cache: "no-cache" });
    if (!response.ok) throw new Error(`Template not found. Status: ${response.status}`);
    const content = await response.arrayBuffer();

    for (let index = 0; index < dataToExport.length; index++) {
      const product = dataToExport[index];
      const borrowers = product.borrowers?.length > 0 ? product.borrowers : [{}];

      for (let bIndex = 0; bIndex < borrowers.length; bIndex++) {
        const borrower = borrowers[bIndex];
        const safeData = {
          borrowerName: borrower.borrowerName || "-",
          borrowerIdNumber: borrower.borrowerIdNumber || "-",
          borrowerFamily: borrower.borrowerFamily || "-",
          borrowerAddress: borrower.borrowerAddress || "-",
          borrowerEmail: borrower.borrowerEmail || "-",
        };

        const zip = new PizZip(content.slice(0));
        const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
        doc.setData(safeData);
        doc.render();

        const blob = doc.getZip().generate({ type: "blob" });
        const formData = new FormData();
        formData.append("file", blob, `${safeData.borrowerName}.docx`);

        // שולח את הקובץ לשרת
        await fetch("/api/upload-to-drive", {
          method: "POST",
          body: formData,
        });
      }
    }
    alert("✅ כל הקבצים הועלו ל‑Drive בהצלחה!");
  } catch (err) {
    console.error("Error processing files:", err);
  }
};

export default ExportWord;
