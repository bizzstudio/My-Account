import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import Cookies from "js-cookie";
import { buildWordTemplateData } from "@/utils/buildWordTemplateData";

// מנקה token מתווים לא חוקיים ב-header (שורה חדשה, רווח מיותר) — מונע "Invalid character in header content [Authorization]"
const safeAuthHeader = (token) => {
  if (!token || typeof token !== "string") return "";
  const t = token.replace(/\s+/g, " ").trim();
  return t ? `Bearer ${t}` : "";
};

// מחזיר מפה של { productId: driveFolderLink } לשימוש בשליחת מייל
// options.singleDocumentPerProduct — true: קובץ Word אחד לכל תיק (לתבנית זו); false: קובץ נפרד לכל לווה.
// תגים ממוספרים {borrowerName1}, {borrowerName2}, … מתמלאים תמיד לפי סדר הלווים בתיק; {borrowerName} = הלווה «של הקובץ» (במצב קובץ אחד — הלווה הראשון).
const ExportWord = async (products, isCheck = [], template = null, options = {}) => {
  const { singleDocumentPerProduct = false } = options;
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
      const authHeader = safeAuthHeader(tokenHolder?.token);
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_BASE_URL}/templates/${template._id}/file`,
        {
          headers: {
            ...(authHeader && { Authorization: authHeader }),
            "Cache-Control": "no-cache",
          },
        }
      );
      if (!response.ok) {
        let message = `שגיאה בהורדת התבנית (${response.status})`;
        try {
          const body = await response.json();
          if (body?.message) message = body.message;
        } catch (_) {}
        throw new Error(message);
      }
      const buffer = await response.arrayBuffer();
      content = new Uint8Array(buffer);
      // וידוא שהתגובה היא קובץ docx (ZIP: מתחיל ב-PK) ולא JSON/הודעת שגיאה
      const isZip = content.length >= 2 && content[0] === 0x50 && content[1] === 0x4b;
      const ct = response.headers.get("content-type") || "";
      const tooSmall = content.length < 1000; // קובץ docx מינימלי גדול בהרבה
      if (!isZip || ct.includes("application/json") || tooSmall) {
        let msg = "לא התקבל קובץ תבנית תקין מהשרת. ייתכן שאין הרשאה לשימוש בתבנית זו.";
        try {
          const text = new TextDecoder().decode(content);
          if (text.trim().startsWith("{")) {
            const j = JSON.parse(text);
            if (j?.message) msg = j.message;
          } else if (tooSmall && text.length > 0) {
            msg = "השרת החזיר תגובה קצרה במקום קובץ התבנית. ייתכן שנדרשת הרשאת אדמין.";
          }
        } catch (_) {}
        throw new Error(msg);
      }
    } else {
      // תבנית ברירת מחדל — מהתיקייה הציבורית
      const response = await fetch(`/template.docx?${Date.now()}`, {
        cache: "no-cache",
      });
      if (!response.ok)
        throw new Error(`Template not found. Status: ${response.status}`);
      content = new Uint8Array(await response.arrayBuffer());
    }

    for (let product of dataToExport) {
      const borrowers = product.borrowers?.length ? product.borrowers : [{}];
      const driveFolderName =
        borrowers
          .map((br) => (br.borrowerName && String(br.borrowerName).trim()) || "")
          .filter(Boolean)
          .join(" ו ") || "Unknown";

      const templateFileName = template?.name || "תבנית ברירת מחדל";
      const templateName = templateFileName;

      const uploadOneDoc = async (blob, fileBaseName, uploadedBorrowerLabel) => {
        const formData = new FormData();
        formData.append("file", blob, "document.docx");
        formData.append("folderName", driveFolderName);
        formData.append("productId", product._id || "");

        const apiBase = import.meta.env.VITE_APP_API_BASE_URL || "";
        const backendOrigin = apiBase.replace(/\/api\/?$/, "");
        const encodedFileName = encodeURIComponent(`${fileBaseName}.docx`);
        const res = await fetch(`${backendOrigin}/api/upload-to-drive?fileName=${encodedFileName}`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const text = await res.text();
          let errMsg = `העלאה ל-Drive נכשלה (${res.status})`;
          try {
            const errBody = JSON.parse(text);
            if (errBody?.message) errMsg = errBody.message;
          } catch (_) {
            if (text) errMsg = text.slice(0, 200);
          }
          throw new Error(errMsg);
        }

        uploadedFiles.push({
          borrower: uploadedBorrowerLabel,
          folder: driveFolderName,
          template: templateName,
          singleDocument: singleDocumentPerProduct,
        });
        const data = JSON.parse(await res.text());
        if (data?.folder?.webViewLink) {
          driveLinks[product._id] = data.folder.webViewLink;
        }
        if (product._id) {
          const tokenHolder = Cookies.get("userInfo") ? JSON.parse(Cookies.get("userInfo")) : null;
          const authHeader = safeAuthHeader(tokenHolder?.token);
          fetch(
            `${import.meta.env.VITE_APP_API_BASE_URL}/products/${product._id}/exported-templates`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(authHeader && { Authorization: authHeader }),
              },
              body: JSON.stringify({
                id: template?._id || "default",
                name: templateName,
                singleDocument: singleDocumentPerProduct,
              }),
            }
          ).catch(() => {});
        }
      };

      const renderZip = async (safeData) => {
        const zip = new PizZip(new Uint8Array(content));
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
          nullGetter: () => "-",
        });
        await doc.renderAsync(safeData);
        return doc.getZip().generate({ type: "blob" });
      };

      if (singleDocumentPerProduct) {
        const anchorBorrower = borrowers[0] || {};
        const safeData = buildWordTemplateData(product, anchorBorrower);
        const blob = await renderZip(safeData);
        const label =
          driveFolderName !== "Unknown" ? driveFolderName : anchorBorrower.borrowerName || "-";
        await uploadOneDoc(blob, templateFileName, label);
      } else {
        for (let bi = 0; bi < borrowers.length; bi++) {
          const borrower = borrowers[bi];
          const safeData = buildWordTemplateData(product, borrower);
          const blob = await renderZip(safeData);
          const fileBaseName =
            borrowers.length > 1 ? `${templateFileName} (${bi + 1})` : templateFileName;
          const uploadedBorrowerLabel =
            (borrower.borrowerName && String(borrower.borrowerName).trim()) || "-";
          await uploadOneDoc(blob, fileBaseName, uploadedBorrowerLabel);
        }
      }
    }

    return { driveLinks, uploadedFiles };
  } catch (err) {
    console.error("Error processing files:", err);
    throw err;
  }
};

export default ExportWord;
