import { useRef, useState } from "react";
import { FiUpload, FiX } from "react-icons/fi";
import { t } from "i18next";
import TemplateServices from "@/services/TemplateServices";

const TemplateUploadModal = ({ onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError(t("TemplateNameRequired"));
    if (!file) return setError(t("TemplateFileRequired"));
    if (!file.name.endsWith(".docx")) return setError(t("TemplateFileMustBeDocx"));

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("file", file);
      await TemplateServices.uploadTemplate(formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || t("UploadError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {t("AddTemplate")}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("TemplateName")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("TemplateNamePlaceholder")}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#a57d45]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("TemplateFile")}
            </label>
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-[#a57d45] transition"
              onClick={() => fileRef.current?.click()}
            >
              <FiUpload size={24} className="text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {file ? file.name : t("ClickToSelectDocx")}
              </span>
              <input
                ref={fileRef}
                type="file"
                accept=".docx"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0] || null)}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              {t("Cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm rounded-lg bg-[#a57d45] text-white hover:bg-[#8a6535] disabled:opacity-50 transition"
            >
              {loading ? t("Uploading") : t("Save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateUploadModal;
