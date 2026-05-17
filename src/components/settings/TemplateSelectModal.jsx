import { useEffect, useState } from "react";
import { FiX, FiFileText } from "react-icons/fi";
import { t } from "i18next";
import TemplateServices from "@/services/TemplateServices";
import ExportWord from "@/components/product/ExportWord";

const TemplateSelectModal = ({ products, isCheck, onClose, onExportDone, fileNameSuffix = "" }) => {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState({});
  const [perBorrowerById, setPerBorrowerById] = useState({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  useEffect(() => {
    TemplateServices.getAllTemplates()
      .then((data) => setTemplates(data))
      .catch((err) => console.error("Error loading templates:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || templates.length === 0) return;
    setSelected((prev) => {
      if (Object.values(prev).some(Boolean)) return prev;
      return { [templates[0]._id]: true };
    });
  }, [loading, templates]);

  const toggleSelect = (id) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAll = () => {
    const allKeys = templates.map((t) => t._id);
    if (allKeys.length === 0) return;
    const allSelected = allKeys.every((k) => selected[k]);
    const next = {};
    allKeys.forEach((k) => (next[k] = !allSelected));
    setSelected(next);
  };

  const anySelected = Object.values(selected).some(Boolean);

  const handleExport = async () => {
    try {
      setExporting(true);
      setExportError(null);

      const allLinks = {};
      const allFiles = [];

      for (const tpl of templates) {
        if (selected[tpl._id]) {
          const { driveLinks, uploadedFiles } = await ExportWord(products, isCheck, tpl, {
            singleDocumentPerProduct: !perBorrowerById[tpl._id],
            fileNameSuffix,
          });
          Object.assign(allLinks, driveLinks);
          allFiles.push(...uploadedFiles);
        }
      }

      if (allFiles.length === 1) {
        const { borrower, template: tplName, singleDocument } = allFiles[0];
        if (singleDocument) {
          alert(`✅ מסמך אחד לכל התיק הועלה בהצלחה!\n\nשמות בתיק: ${borrower}\nמסמך: ${tplName}`);
        } else {
          alert(`✅ המסמך הועלה בהצלחה!\n\nלקוח: ${borrower}\nמסמך: ${tplName}`);
        }
      } else if (allFiles.length > 1) {
        const lines = allFiles
          .map(({ borrower, template: tplName, singleDocument }) =>
            singleDocument ? `• ${tplName} (מסמך אחד לתיק: ${borrower})` : `• ${borrower} — ${tplName}`
          )
          .join("\n");
        alert(`✅ ${allFiles.length} מסמכים הועלו בהצלחה:\n\n${lines}`);
      } else {
        setExportError("לא הועלו מסמכים. בדוק את חיבור ה-Drive בהגדרות (הגדרות → ניתוב ל-Drive).");
        return;
      }

      if (onExportDone) onExportDone(allLinks);
      onClose();
    } catch (err) {
      console.error("Export error:", err);
      setExportError(err?.message || "שגיאה בייצוא");
    } finally {
      setExporting(false);
    }
  };

  const allSelected = templates.length > 0 && templates.every((tpl) => selected[tpl._id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {t("SelectTemplatesForExport")}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            <FiX size={20} />
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-400 text-sm">{t("Loading")}</div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t("ChooseOneOrMore")}
              </span>
              <button
                type="button"
                onClick={handleSelectAll}
                disabled={templates.length === 0}
                className="text-sm text-[#a57d45] hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
              >
                {allSelected ? t("DeselectAll") : t("SelectAll")}
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto mb-5">
              {templates.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-600 rounded-lg">
                  אין תבניות מועלות. העלי תבנית Word בהגדרות לפני ייצוא.
                </div>
              ) : null}
              {templates.map((tpl) => (
                <div
                  key={tpl._id}
                  className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
                >
                  <label className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!selected[tpl._id]}
                      onChange={() => toggleSelect(tpl._id)}
                      className="w-4 h-4 accent-[#a57d45] shrink-0"
                    />
                    <FiFileText size={16} className="text-[#a57d45] shrink-0" />
                    <span className="text-sm text-gray-800 dark:text-gray-100 truncate">
                      {tpl.name}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 shrink-0 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!perBorrowerById[tpl._id]}
                      onChange={() =>
                        setPerBorrowerById((prev) => ({
                          ...prev,
                          [tpl._id]: !prev[tpl._id],
                        }))
                      }
                      className="w-4 h-4 accent-[#a57d45] shrink-0"
                    />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {t("PerBorrowerShort")}
                    </span>
                  </label>
                </div>
              ))}
            </div>

            {exportError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                {exportError}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                {t("Cancel")}
              </button>
              <button
                onClick={handleExport}
                disabled={!anySelected || exporting}
                className="px-4 py-2 text-sm rounded-lg bg-[#a57d45] text-white hover:bg-[#8a6535] disabled:opacity-50 transition"
              >
                {exporting ? t("Exporting") : t("Export")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TemplateSelectModal;
