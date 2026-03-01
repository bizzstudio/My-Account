import { useEffect, useState, useContext } from "react";
import { FiPlus, FiTrash2, FiFileText } from "react-icons/fi";
import { t } from "i18next";
import { Card, CardBody } from "@windmill/react-ui";

import PageTitle from "@/components/Typography/PageTitle";
import { SidebarContext } from "@/context/SidebarContext";
import TemplateServices from "@/services/TemplateServices";
import TemplateUploadModal from "@/components/settings/TemplateUploadModal";

const Settings = () => {
  const { setBreadcrumbs } = useContext(SidebarContext);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    setBreadcrumbs([{ href: "/settings", label: t("Settings") }]);
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await TemplateServices.getAllTemplates();
      setTemplates(data);
    } catch (err) {
      console.error("Error fetching templates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(t("ConfirmDeleteTemplate"))) return;
    try {
      setDeletingId(id);
      await TemplateServices.deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Error deleting template:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("he-IL");
  };

  return (
    <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
      <PageTitle>{t("Settings")}</PageTitle>

      {showModal && (
        <TemplateUploadModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchTemplates}
        />
      )}

      <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
              {t("DocumentTemplates")}
            </h2>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[#a57d45] text-white hover:bg-[#8a6535] transition"
            >
              <FiPlus size={16} />
              {t("AddTemplate")}
            </button>
          </div>

          {loading ? (
            <div className="py-10 text-center text-gray-400">{t("Loading")}</div>
          ) : templates.length === 0 ? (
            <div className="py-10 text-center text-gray-400">{t("NoTemplatesFound")}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right table-fixed">
                <colgroup>
                  <col className="w-1/2" />
                  <col className="w-1/4" />
                  <col className="w-1/4" />
                </colgroup>
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                    <th className="py-3 px-4 font-medium text-right">{t("TemplateName")}</th>
                    <th className="py-3 px-4 font-medium text-right">{t("UploadDate")}</th>
                    <th className="py-3 px-4 font-medium text-right">{t("Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((tpl) => (
                    <tr
                      key={tpl._id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
                    >
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-100 text-right">
                        <span className="inline-flex items-center gap-2 flex-row-reverse">
                          <FiFileText size={16} className="text-[#a57d45] shrink-0" />
                          {tpl.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-right">
                        {formatDate(tpl.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(tpl._id)}
                          disabled={deletingId === tpl._id}
                          className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 disabled:opacity-40 transition text-sm"
                        >
                          <FiTrash2 size={15} />
                          {deletingId === tpl._id ? t("Deleting") : t("Delete")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Settings;
