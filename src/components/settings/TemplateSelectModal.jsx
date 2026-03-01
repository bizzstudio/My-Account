import { useEffect, useState } from "react";
import { FiX, FiFileText } from "react-icons/fi";
import { t } from "i18next";
import TemplateServices from "@/services/TemplateServices";
import ExportWord from "@/components/product/ExportWord";

const DEFAULT_TEMPLATE = { _id: "default", name: t("DefaultTemplate") };

const TemplateSelectModal = ({ products, isCheck, onClose, onExportDone }) => {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState({ default: true });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    TemplateServices.getAllTemplates()
      .then((data) => setTemplates(data))
      .catch((err) => console.error("Error loading templates:", err))
      .finally(() => setLoading(false));
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAll = () => {
    const allKeys = ["default", ...templates.map((t) => t._id)];
    const allSelected = allKeys.every((k) => selected[k]);
    const next = {};
    allKeys.forEach((k) => (next[k] = !allSelected));
    setSelected(next);
  };

  const anySelected = Object.values(selected).some(Boolean);

  const handleExport = async () => {
    try {
      setExporting(true);

      const allLinks = {};
      const allFiles = [];

      if (selected["default"]) {
        const { driveLinks, uploadedFiles } = await ExportWord(products, isCheck, null);
        Object.assign(allLinks, driveLinks);
        allFiles.push(...uploadedFiles);
      }

      for (const tpl of templates) {
        if (selected[tpl._id]) {
          const { driveLinks, uploadedFiles } = await ExportWord(products, isCheck, tpl);
          Object.assign(allLinks, driveLinks);
          allFiles.push(...uploadedFiles);
        }
      }

      if (allFiles.length === 1) {
        const { borrower, template: tplName } = allFiles[0];
        alert(`✅ המסמך הועלה בהצלחה!\n\nלקוח: ${borrower}\nמסמך: ${tplName}`);
      } else if (allFiles.length > 1) {
        const lines = allFiles.map(({ borrower, template: tplName }) => `• ${borrower} — ${tplName}`).join("\n");
        alert(`✅ ${allFiles.length} מסמכים הועלו בהצלחה:\n\n${lines}`);
      }

      if (onExportDone) onExportDone(allLinks);
      onClose();
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setExporting(false);
    }
  };

  const allTemplates = [DEFAULT_TEMPLATE, ...templates];
  const allSelected = allTemplates.every((tpl) => selected[tpl._id]);

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
                onClick={handleSelectAll}
                className="text-sm text-[#a57d45] hover:underline"
              >
                {allSelected ? t("DeselectAll") : t("SelectAll")}
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto mb-5">
              {allTemplates.map((tpl) => (
                <label
                  key={tpl._id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={!!selected[tpl._id]}
                    onChange={() => toggleSelect(tpl._id)}
                    className="w-4 h-4 accent-[#a57d45]"
                  />
                  <FiFileText size={16} className="text-[#a57d45] shrink-0" />
                  <span className="text-sm text-gray-800 dark:text-gray-100">
                    {tpl.name}
                  </span>
                </label>
              ))}
            </div>

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
