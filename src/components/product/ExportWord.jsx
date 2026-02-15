// src/components/product/exportWordFunction.js
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

const ExportWord = (products, isCheck = []) => {
  // תמיד יוצרים רשימה של מוצרים לייצוא
  const dataToExport = isCheck.length > 0
    ? products.filter(p => isCheck.includes(p._id))
    : products; // אם לא בחרת – כל המוצרים

  // עבור כל מוצר – יוצרים קובץ נפרד
  dataToExport.forEach((product, index) => {
    const borrower = product.borrowers?.[0] || {};

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [new TextRun({ text: `שלום ל-${borrower.borrowerName || "-"}`, bold: true })],
            }),
            new Paragraph({ children: [new TextRun(`משפחה: ${borrower.borrowerFamily || "-"}`)] }),
            new Paragraph({ children: [new TextRun(`תעודת זהות: ${borrower.borrowerIdNumber || "-"}`)] }),
            new Paragraph({ children: [new TextRun(`כתובת: ${borrower.borrowerAddress || "-"}`)] }),
            new Paragraph({ children: [new TextRun(`מייל: ${borrower.borrowerEmail || "-"}`)] }),
            new Paragraph({ children: [new TextRun(" ")] }),
          ],
        },
      ],
    });

    // מוסיפים זמן קצר בין ההורדות כדי למנוע שהדפדפן יחסום את ההורדה
    setTimeout(() => {
      Packer.toBlob(doc).then(blob => {
        const fileName = `${borrower.borrowerName || "Product"}_${index + 1}.docx`;
        saveAs(blob, fileName);
      });
    }, index * 300);
  });
};

export default ExportWord;
