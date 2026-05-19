import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import Cookies from "js-cookie";
import { buildWordTemplateData, formatBorrowerDisplayName } from "@/utils/buildWordTemplateData";

/**
 * מחיל גופן David על כל ה-runs (PizZip לאחר מילוי docxtemplater).
 * גודל הגופן הקיים בתבנית נשמר — כדי שלא יישברו טבלאות חתימה ולא יתווסף עמוד מיותר.
 */
function applyDocumentFont(zip, fontName = "David", sizePt = 12) {
  const halfPt = String(sizePt * 2);
  const fontTag = `<w:rFonts w:ascii="${fontName}" w:hAnsi="${fontName}" w:cs="${fontName}" w:eastAsia="${fontName}"/>`;
  const defaultSizeTag = `<w:sz w:val="${halfPt}"/><w:szCs w:val="${halfPt}"/>`;

  const patchRpr = (xml) =>
    xml.replace(
      /(<w:rPr(?:\s[^>]*)?>)([\s\S]*?)(<\/w:rPr>)/g,
      (_, open, inner, close) => {
        const cleaned = inner.replace(/<w:rFonts\b[^/]*\/>/g, "");
        const sizePart = /<w:sz\b/.test(inner) ? "" : defaultSizeTag;
        return `${open}${fontTag}${sizePart}${cleaned}${close}`;
      }
    );

  // styles.xml — docDefaults
  try {
    const stylesFile = zip.file("word/styles.xml");
    if (stylesFile) {
      let xml = stylesFile.asText();
      if (/<w:rPrDefault/.test(xml)) {
        xml = patchRpr(xml);
      } else if (/<w:docDefaults/.test(xml)) {
        xml = xml.replace(
          /(<w:docDefaults[^>]*>)/,
          `$1<w:rPrDefault><w:rPr>${fontTag}${defaultSizeTag}</w:rPr></w:rPrDefault>`
        );
      } else {
        xml = xml.replace(
          /(<w:style\b)/,
          `<w:docDefaults><w:rPrDefault><w:rPr>${fontTag}${defaultSizeTag}</w:rPr></w:rPrDefault></w:docDefaults>$1`
        );
      }
      zip.file("word/styles.xml", xml);
    }
  } catch (_) {}

  // document.xml — כל <w:rPr> קיים
  try {
    const docFile = zip.file("word/document.xml");
    if (docFile) {
      let xml = docFile.asText();
      // פטח rPr קיימים
      xml = patchRpr(xml);
      // הוסף rPr ל-run שאין לו (<w:r> ו-<w:r ...> ואחריו <w:t ולא <w:rPr>)
      xml = xml.replace(
        /(<w:r(?:\s[^>]*)?>)(?![\s\S]*?<w:rPr)(<w:t\b)/g,
        `$1<w:rPr>${fontTag}${defaultSizeTag}</w:rPr>$2`
      );
      zip.file("word/document.xml", xml);
    }
  } catch (_) {}
}

/** תיקון OOXML בגוף המסמך / כותרות / תחתיות — טבלאות חתימה ורווחים מיותרים */
function patchDocxPartXml(xml) {
  if (!xml) return xml;

  // טבלאות: פריסה קבועה — מונע מיזוג עמודות (תאריך שיורד מתחת לשם עו"ד)
  xml = xml.replace(/<w:tblPr([^>]*)>([\s\S]*?)<\/w:tblPr>/g, (match, attrs, inner) => {
    let patched = inner.replace(/<w:tblLayout\b[^/]*\/>/g, "");
    patched += '<w:tblLayout w:type="fixed"/>';
    return `<w:tblPr${attrs}>${patched}</w:tblPr>`;
  });

  // שורות טבלה שלא נשברות בין עמודים
  xml = xml.replace(/<w:tr>(\s*<w:tc)/g, "<w:tr><w:trPr><w:cantSplit/></w:trPr>$1");
  xml = xml.replace(/<w:trPr([^>]*)>([\s\S]*?)<\/w:trPr>/g, (match, attrs, inner) => {
    if (/<w:cantSplit\b/.test(inner)) return match;
    return `<w:trPr${attrs}>${inner}<w:cantSplit/></w:trPr>`;
  });

  // תאים: יישור לתחתית (שורת חתימה)
  xml = xml.replace(/<w:tcPr([^>]*)>([\s\S]*?)<\/w:tcPr>/g, (match, attrs, inner) => {
    if (/<w:vAlign\b/.test(inner)) return match;
    return `<w:tcPr${attrs}>${inner}<w:vAlign w:val="bottom"/></w:tcPr>`;
  });
  xml = xml.replace(/<w:tc>(\s*<w:p)/g, '<w:tc><w:tcPr><w:vAlign w:val="bottom"/></w:tcPr>$1');

  // רווח אחרי פסקה גדול מדי — מקור נפוץ לעמוד שלישי מיותר
  xml = xml.replace(/<w:spacing\b([^>]*)\/>/g, (tag, attrs) => {
    const after = attrs.match(/\bw:after="(\d+)"/);
    if (!after) return tag;
    const n = parseInt(after[1], 10);
    if (n <= 160) return tag;
    const trimmed = attrs.replace(/\bw:after="\d+"/, ' w:after="160"');
    return `<w:spacing${trimmed}/>`;
  });

  // פסקאות ריקות לחלוטין אחרי מילוי (לעיתים נוצרות מ-docxtemplater)
  xml = xml.replace(
    /<w:p\b[^>]*>(?:(?!<\/w:p>).)*<w:t[^>]*>\s*<\/w:t>(?:(?!<\/w:p>).)*<\/w:p>\s*/g,
    ""
  );

  return xml;
}

function fixDocxLayoutAfterMerge(zip) {
  const paths = Object.keys(zip.files).filter((p) =>
    /^word\/(document|header\d+|footer\d+)\.xml$/.test(p)
  );
  for (const path of paths) {
    try {
      const file = zip.file(path);
      if (!file) continue;
      zip.file(path, patchDocxPartXml(file.asText()));
    } catch (_) {}
  }
}

function sanitizeMergeData(data) {
  const out = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      out[key] = value.replace(/\r?\n+/g, " ").replace(/\t/g, " ").trim();
    } else {
      out[key] = value;
    }
  }
  return out;
}

// מנקה token מתווים לא חוקיים ב-header (שורה חדשה, רווח מיותר) — מונע "Invalid character in header content [Authorization]"
const safeAuthHeader = (token) => {
  if (!token || typeof token !== "string") return "";
  const t = token.replace(/\s+/g, " ").trim();
  return t ? `Bearer ${t}` : "";
};

// מחזיר מפה של { productId: driveFolderLink } לשימוש בשליחת מייל
// options.singleDocumentPerProduct — true: קובץ Word אחד לכל תיק (לתבנית זו); false: קובץ נפרד לכל לווה.
// תגים ממוספרים {borrowerName1}, {borrowerName2}, … מתמלאים תמיד לפי סדר הלווים בתיק; {borrowerName} = שם מלא של הלווה «של הקובץ» (במצב קובץ אחד — הלווה הראשון).
// {mortgagorIdNumber} / {nonMortgagorIdNumber} — ת.ז. של ממשכן ראשון / לא-ממשכן ראשון; {mortgagorIdNumber1}… — לפי סדר נפרד בתוך כל קבוצה (דורש צ׳קבוקס «ממשכן» בפרטי הלווה).
// {borrowerFirstName} / {borrowerLastName} — שם פרטי ושם משפחה בנפרד; {borrowerName} — פרטי + משפחה יחד (כמו mortgagorName*/nonMortgagorName* לפי המפתח Name).
const ExportWord = async (products, isCheck = [], template = null, options = {}) => {
  const { singleDocumentPerProduct = false, fileNameSuffix = "" } = options;
  const uploadedFiles = [];
  const driveLinks = {}; // productId → folder webViewLink

  const dataToExport =
    isCheck.length > 0
      ? products.filter((p) => isCheck.includes(p._id))
      : products;

  try {
    if (!template?._id) {
      throw new Error("יש לבחור תבנית שהועלתה למערכת (אין תבנית ברירת מחדל).");
    }

    // תבנית מהשרת — קובץ מהדרייב דרך הבקאנד
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
    const content = new Uint8Array(buffer);
    const isZip = content.length >= 2 && content[0] === 0x50 && content[1] === 0x4b;
    const ct = response.headers.get("content-type") || "";
    const tooSmall = content.length < 1000;
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

    for (let product of dataToExport) {
      const borrowers = product.borrowers?.length ? product.borrowers : [{}];
      const driveFolderName =
        borrowers
          .map((br) => {
            const d = formatBorrowerDisplayName(br);
            return d !== "-" ? d : "";
          })
          .filter(Boolean)
          .join(" ו ") || "Unknown";

      const templateFileName = (template.name || "תבנית") + (fileNameSuffix ? ` ${fileNameSuffix}` : "");
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
                id: template._id,
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
        await doc.renderAsync(sanitizeMergeData(safeData));
        fixDocxLayoutAfterMerge(zip);
        applyDocumentFont(zip);
        return doc.getZip().generate({ type: "blob" });
      };

      if (singleDocumentPerProduct) {
        const anchorBorrower = borrowers[0] || {};
        const safeData = buildWordTemplateData(product, anchorBorrower);
        const blob = await renderZip(safeData);
        const label =
          driveFolderName !== "Unknown"
            ? driveFolderName
            : formatBorrowerDisplayName(anchorBorrower);
        await uploadOneDoc(blob, templateFileName, label);
      } else {
        for (let bi = 0; bi < borrowers.length; bi++) {
          const borrower = borrowers[bi];
          const safeData = buildWordTemplateData(product, borrower);
          const blob = await renderZip(safeData);
          const fileBaseName =
            borrowers.length > 1 ? `${templateFileName} (${bi + 1})` : templateFileName;
          const uploadedBorrowerLabel = formatBorrowerDisplayName(borrower);
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
