import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiTrash2, FiFileText, FiSave, FiSettings, FiEye, FiEyeOff } from "react-icons/fi";
import { t } from "i18next";
import { Card, CardBody } from "@windmill/react-ui";

import PageTitle from "@/components/Typography/PageTitle";
import { SidebarContext } from "@/context/SidebarContext";
import TemplateServices from "@/services/TemplateServices";
import TemplateUploadModal from "@/components/settings/TemplateUploadModal";
import SystemSettingsServices from "@/services/SystemSettingsServices";
import CollapsibleSection from "@/components/common/CollapsibleSection";
import Cookies from "js-cookie";

const Settings = () => {
  const { setBreadcrumbs } = useContext(SidebarContext);
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  // הגדרות מערכת
  const [sysLoading, setSysLoading] = useState(true);
  const [sysSaving, setSysSaving] = useState(false);
  const [sysSaved, setSysSaved] = useState(false);
  const [sysSettings, setSysSettings] = useState({ driveFolderId: "", companyName: "", adminEmail: "", emailUser: "", emailPass: "" });
  const [showEmailPass, setShowEmailPass] = useState(false);

  // האם המשתמש הוא admin (כולל super-admin)
  const userInfo = (() => { try { return JSON.parse(Cookies.get("userInfo") || "{}"); } catch { return {}; } })();
  const isAdmin = userInfo?.role === "super-admin" || userInfo?.role === "admin";

  // הגנה: עורך דין לא יכול להיכנס לדף זה
  useEffect(() => {
    if (userInfo?.role && !isAdmin) {
      navigate("/products", { replace: true });
    }
  }, [isAdmin, navigate, userInfo?.role]);

  useEffect(() => {
    setBreadcrumbs([{ href: "/settings", label: t("Settings") }]);
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      try {
        await TemplateServices.syncWithDrive();
      } catch {
        // סנכרון אוטומטי עם Drive — אם נכשל, ממשיכים עם הרשימה הקיימת
      }
      const data = await TemplateServices.getAllTemplates();
      setTemplates(data);
    } catch (err) {
      console.error("Error fetching templates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, []);

  // טעינת הגדרות מערכת
  useEffect(() => {
    if (!isAdmin) return;
    SystemSettingsServices.getSettings()
      .then((data) => setSysSettings({ driveFolderId: data.driveFolderId || "", companyName: data.companyName || "", adminEmail: data.adminEmail || "", emailUser: data.emailUser || "", emailPass: data.emailPass || "" }))
      .catch(console.error)
      .finally(() => setSysLoading(false));
  }, [isAdmin]);

  const handleSysSettingsSave = async () => {
    try {
      setSysSaving(true);
      await SystemSettingsServices.updateSettings(sysSettings);
      setSysSaved(true);
      setTimeout(() => setSysSaved(false), 3000);
    } catch (err) {
      console.error("Error saving system settings:", err);
    } finally {
      setSysSaving(false);
    }
  };

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

  const handleOpenTemplate = async (tpl) => {
    if (downloadingId) return;
    if (tpl.webViewLink) {
      window.open(tpl.webViewLink, "_blank", "noopener,noreferrer");
      return;
    }
    try {
      setDownloadingId(tpl._id);
      const blob = await TemplateServices.downloadTemplateFile(tpl._id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tpl.name || "template"}.docx`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading template:", err);
    } finally {
      setDownloadingId(null);
    }
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

      {/* הגדרות מערכת — גלוי רק לאדמינים */}
      {isAdmin && (
        <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
          <CardBody>
            <CollapsibleSection
              title="הגדרות מערכת"
              icon={<FiSettings size={18} className="text-[#a57d45]" />}
              defaultOpen={false}
            >
              {sysLoading ? (
                <div className="py-6 text-center text-gray-400">{t("Loading")}</div>
              ) : (
                <div className="grid grid-cols-1 gap-5 max-w-lg pt-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      מזהה תיקיית Google Drive (Folder ID)
                    </label>
                    <input
                      type="text"
                      value={sysSettings.driveFolderId}
                      onChange={(e) => setSysSettings((p) => ({ ...p, driveFolderId: e.target.value }))}
                      dir="ltr"
                      placeholder="1Qp4AlSux..."
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#a57d45]"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      המזהה מופיע ב-URL של תיקיית Drive לאחר "folders/"
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      שם החברה
                    </label>
                    <input
                      type="text"
                      value={sysSettings.companyName}
                      onChange={(e) => setSysSettings((p) => ({ ...p, companyName: e.target.value }))}
                      dir="rtl"
                      placeholder="BGR יעוץ משכנתאות"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#a57d45]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      כתובת מייל מנהל
                    </label>
                    <input
                      type="email"
                      value={sysSettings.adminEmail}
                      onChange={(e) => setSysSettings((p) => ({ ...p, adminEmail: e.target.value }))}
                      dir="ltr"
                      placeholder="admin@example.com"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#a57d45]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      מייל שולח (Gmail)
                    </label>
                    <input
                      type="email"
                      value={sysSettings.emailUser}
                      onChange={(e) => setSysSettings((p) => ({ ...p, emailUser: e.target.value }))}
                      dir="ltr"
                      placeholder="sender@gmail.com"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#a57d45]"
                    />
                    <p className="text-xs text-gray-400 mt-1">חשבון הג'ימייל שממנו יוצאים כל המיילים</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      סיסמת אפליקציה (App Password)
                    </label>
                    <div className="relative">
                      <input
                        type={showEmailPass ? "text" : "password"}
                        value={sysSettings.emailPass}
                        onChange={(e) => setSysSettings((p) => ({ ...p, emailPass: e.target.value }))}
                        dir="ltr"
                        placeholder="xxxx xxxx xxxx xxxx"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#a57d45] pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEmailPass((p) => !p)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showEmailPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      סיסמת אפליקציה של Gmail — לא הסיסמה הרגילה.{" "}
                      <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-[#a57d45] underline">
                        ליצירת סיסמת אפליקציה
                      </a>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSysSettingsSave}
                      disabled={sysSaving}
                      className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-[#a57d45] text-white hover:bg-[#8a6535] transition disabled:opacity-50"
                    >
                      <FiSave size={15} />
                      {sysSaving ? "שומר..." : "שמור הגדרות"}
                    </button>
                    {sysSaved && (
                      <span className="text-green-600 text-sm font-medium">✓ ההגדרות נשמרו בהצלחה</span>
                    )}
                  </div>
                </div>
              )}
            </CollapsibleSection>
          </CardBody>
        </Card>
      )}

      {/* תבניות מסמך — גלוי לכולם */}
      <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
        <CardBody>
          <CollapsibleSection
            title={t("DocumentTemplates")}
            icon={<FiFileText size={18} className="text-[#a57d45]" />}
            defaultOpen={false}
          >
            <div className="flex justify-end mb-4 mt-2">
              {isAdmin && (
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[#a57d45] text-white hover:bg-[#8a6535] transition"
                >
                  <FiPlus size={16} />
                  {t("AddTemplate")}
                </button>
              )}
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
                      {isAdmin && <th className="py-3 px-4 font-medium text-right">{t("Actions")}</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map((tpl) => (
                      <tr
                        key={tpl._id}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
                      >
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-100 align-middle" dir="rtl">
                          <button
                            type="button"
                            onClick={() => handleOpenTemplate(tpl)}
                            disabled={downloadingId === tpl._id}
                            className="inline-flex items-center gap-2 justify-start w-full min-w-0 text-[#a57d45] hover:underline focus:outline-none focus:ring-0 disabled:opacity-50 transition text-right"
                            title={tpl.webViewLink ? t("OpenInDrive") : t("OpenOrDownloadTemplate")}
                          >
                            <span className="truncate">{downloadingId === tpl._id ? t("Loading") + "..." : (tpl.name || "—")}</span>
                            <FiFileText size={16} className="shrink-0" />
                          </button>
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-right">
                          {formatDate(tpl.createdAt)}
                        </td>
                        {isAdmin && (
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
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CollapsibleSection>
        </CardBody>
      </Card>
    </div>
  );
};

export default Settings;
