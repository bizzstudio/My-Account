import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiTrash2, FiFileText, FiSave, FiSettings, FiEye, FiEyeOff, FiBook } from "react-icons/fi";
import { t } from "i18next";
import { Card, CardBody } from "@windmill/react-ui";

import PageTitle from "@/components/Typography/PageTitle";
import { SidebarContext } from "@/context/SidebarContext";
import TemplateServices from "@/services/TemplateServices";
import TemplateUploadModal from "@/components/settings/TemplateUploadModal";
import SystemSettingsServices from "@/services/SystemSettingsServices";
import CollapsibleSection from "@/components/common/CollapsibleSection";
import Cookies from "js-cookie";

// מקרא — משתנים לתבניות מסמך (לשימוש במסמכי Word)
const LEGEND_SECTIONS = [
  {
    title: "פרטי עורך דין",
    items: [
      { key: "{lawyerName}", label: "שם עורך הדין" },
      { key: "{lawyerRegistrationNumber}", label: "מספר רישום עורך דין" },
      { key: "{lawyerIdNumber}", label: "תעודת זהות עורך דין" },
      { key: "{lawyerEmail}", label: "אימייל עורך דין" },
      { key: "{signingDate}", label: "תאריך חתימה (מלא)" },
      { key: "{signingDateDay}", label: "יום חתימה" },
      { key: "{signingDateMonth}", label: "חודש חתימה" },
      { key: "{signingDateYear}", label: "שנת חתימה" },
    ],
  },
  {
    title: "פרטי יועץ",
    items: [
      { key: "{consultant}", label: "שם יועץ" },
      { key: "{consultantEmail}", label: "אימייל יועץ" },
    ],
  },
  {
    title: "חברות מימון",
    items: [
      { key: "{financingCompanyName}", label: "שם חברת מימון" },
      { key: "{financingCompanyIdNumber}", label: "מספר מזהה חברת מימון" },
    ],
  },
  {
    title: "לווים",
    items: [
      { key: "{borrowerName}", label: "שם לווה — שדה «שם פרטי» כפי שנשמר (תאימות לאחור)" },
      { key: "{borrowerFirstName}", label: "שם פרטי לווה (של הקובץ הנוכחי — זהה לערך {borrowerName})" },
      { key: "{borrowerLastName}", label: "שם משפחה לווה (של הקובץ הנוכחי)" },
      { key: "{borrowerIdNumber}", label: "מספר תעודת זהות לווה" },
      { key: "{borrowerAddress}", label: "כתובת לווה" },
      { key: "{borrowerDateOfBirth}", label: "תאריך לידה (מלא)" },
      { key: "{borrowerDateOfBirthDay}", label: "יום לידה" },
      { key: "{borrowerDateOfBirthMonth}", label: "חודש לידה" },
      { key: "{borrowerDateOfBirthYear}", label: "שנת לידה" },
      { key: "{borrowerDateOfBirthDay1} … {borrowerDateOfBirthDay5}", label: "יום לידה לפי סדר לווים" },
      { key: "{borrowerDateOfBirthMonth1} … {borrowerDateOfBirthMonth5}", label: "חודש לידה לפי סדר לווים" },
      { key: "{borrowerDateOfBirthYear1} … {borrowerDateOfBirthYear5}", label: "שנת לידה לפי סדר לווים" },
      { key: "{mortgagorDateOfBirthDay1} … {mortgagorDateOfBirthDay5}", label: "יום לידה ממשכנים" },
      { key: "{mortgagorDateOfBirthMonth1} … {mortgagorDateOfBirthMonth5}", label: "חודש לידה ממשכנים" },
      { key: "{mortgagorDateOfBirthYear1} … {mortgagorDateOfBirthYear5}", label: "שנת לידה ממשכנים" },
      { key: "{nonMortgagorDateOfBirthDay1} … {nonMortgagorDateOfBirthDay5}", label: "יום לידה לא-ממשכנים" },
      { key: "{nonMortgagorDateOfBirthMonth1} … {nonMortgagorDateOfBirthMonth5}", label: "חודש לידה לא-ממשכנים" },
      { key: "{nonMortgagorDateOfBirthYear1} … {nonMortgagorDateOfBirthYear5}", label: "שנת לידה לא-ממשכנים" },
      { key: "{borrowerGender}", label: "מין" },
      { key: "{borrowerEmail}", label: "אימייל לווה" },
      { key: "{borrowerIsMortgagor}", label: "ממשכן (כן / לא)" },
      { key: "{borrowerName1} … {borrowerName5}", label: "כל הלווים — שם פרטי לפי סדר (כפי בשדה borrowerName)" },
      { key: "{borrowerFirstName1} … {borrowerFirstName5}", label: "כל הלווים — שם פרטי בנפרד (מקביל ל־borrowerName1…)" },
      { key: "{borrowerLastName1} … {borrowerLastName5}", label: "כל הלווים — שם משפחה בנפרד" },
      { key: "{mortgagorName1} … {mortgagorName5}", label: "רק ממשכנים — שם פרטי/שדה שם כפי שנשמר (לפי סדר «ממשכן»)" },
      { key: "{mortgagorFirstName1} … {mortgagorFirstName5}", label: "רק ממשכנים — שם פרטי בנפרד" },
      { key: "{mortgagorLastName1} … {mortgagorLastName5}", label: "רק ממשכנים — שם משפחה בנפרד" },
      { key: "{nonMortgagorName1} … {nonMortgagorName5}", label: "רק לא ממשכנים — שם פרטי/שדה שם כפי שנשמר" },
      { key: "{nonMortgagorFirstName1} … {nonMortgagorFirstName5}", label: "רק לא ממשכנים — שם פרטי בנפרד" },
      { key: "{nonMortgagorLastName1} … {nonMortgagorLastName5}", label: "רק לא ממשכנים — שם משפחה בנפרד" },
      { key: "{allBorrowerNames}", label: "טקסט מאוחד של כולם (שמות מחוברים ב־ו)" },
    ],
  },
  {
    title: "פרטי רישום",
    items: [
      { key: "{lienRank}", label: "דרגת שעבוד (ערך גולמי: first / second)" },
      { key: "{lienRankHe}", label: "דרגת שעבוד (טקסט: דרגה ראשונה / דרגה שניה)" },
      { key: "{firstLienAmount}", label: "סכום שעבוד בדרגה ראשונה" },
      { key: "{secondLienAmount}", label: "סכום שעבוד בדרגה שניה" },
      { key: "{block}", label: "גוש" },
      { key: "{plot}", label: "חלקה" },
      { key: "{subPlot}", label: "תת חלקה" },
      { key: "{land}", label: "קרקע" },
      { key: "{plan}", label: "תוכנית" },
      { key: "{contract}", label: "חוזה" },
      { key: "{mortgageName}", label: "שם בעל המשכנתא" },
      { key: "{mortgageCompanyId}", label: "מספר מזהה חברה משכנת" },
      { key: "{office}", label: "לשכה" },
      { key: "{registry}", label: "מרשם" },
      { key: "{plotArea}", label: 'שטח במ"ר' },
      { key: "{ramiContractNumber}", label: 'מספר חוזה רמ"י' },
      { key: "{lotNumber}", label: "מס׳ מגרש" },
      { key: "{applicationNumber}", label: "מספר בקשה" },
      { key: "{right}", label: "סוג זכות" },
      { key: "{parts}", label: "חלקים" },
      { key: "{propertyType}", label: "סוג נכס" },
      { key: "{street}", label: "רחוב" },
      { key: "{houseNumber}", label: "מספר בית" },
      { key: "{apartmentNumber}", label: "מספר דירה" },
      { key: "{floor}", label: "קומה" },
      { key: "{direction}", label: "כיוון" },
      { key: "{entrance}", label: "כניסה" },
      { key: "{unit}", label: "יחידה" },
      { key: "{settlement}", label: "יישוב" },
    ],
  },
  {
    title: "מוכרים",
    items: [
      { key: "{sellerName}", label: "שם מוכר" },
      { key: "{sellerIdType}", label: "סוג תעודה מזהה מוכר" },
      { key: "{sellerIdNumber}", label: "מספר תעודת זהות מוכר" },
      { key: "{sellerAddress}", label: "כתובת מוכר" },
    ],
  },
  {
    title: "הלוואות",
    items: [
      { key: "{loanPlan}", label: "שם מסלול הריבית (מלל חופשי)" },
      { key: "{loanInterestRate}", label: "שיעור הריבית הנומינלית (מספרי / מלל חופשי)" },
      { key: "{adjustedInterestRate}", label: "הריבית המתואמת (מספרי / מלל חופשי)" },
      { key: "{realCreditCostRate}", label: "שיעור עלות ממשית של האשראי (מספרי / מלל חופשי)" },
      { key: "{primeMargin}", label: "מרכיב הריבית המשתנה במסלול פריים (מספרי / מלל חופשי)" },
      { key: "{indexLinked}", label: "הצמדה למדד (ערך גולמי: yes / no)" },
      { key: "{indexLinkedHe}", label: "הצמדה למדד (כן / לא)" },
      { key: "{establishmentFee}", label: "עמלת הקמה (מספרי / מלל חופשי)" },
      { key: "{borrowerReceivesAmount}", label: "הסכום שיקבל הלווה בפועל (מספרי / מלל חופשי)" },
      { key: "{excessPaymentBeyondCredit}", label: "סכום שישלם הלווה עד סוף תקופת ההלוואה מעל לסכום האשראי (מספרי / מלל חופשי)" },
      { key: "{totalPayableEndOfTerm}", label: 'סה״כ ישולם עד סוף התקופה (מספרי / מלל חופשי)' },
      { key: "{loanPurpose}", label: "מטרת ההלוואה (מלל חופשי)" },
      { key: "{loanAmount}", label: "סכום הלוואה" },
      { key: "{loanChange}", label: "סוג הצמדה / שינוי" },
      { key: "{clause}", label: "סעיף" },
      { key: "{loanMonths}", label: "מספר חודשי הלוואה" },
      { key: "{adjustedLoan}", label: "סכום הלוואה מתואם (שדה ישן / נלווה)" },
      { key: "{realLoan}", label: "סכום הלוואה בפועל (שדה ישן / נלווה)" },
      { key: "{loanCreation}", label: "תאריך פתיחת הלוואה (מלא)" },
      { key: "{loanCreationDay}", label: "יום פתיחת הלוואה" },
      { key: "{loanCreationMonth}", label: "חודש פתיחת הלוואה" },
      { key: "{loanCreationYear}", label: "שנת פתיחת הלוואה" },
      { key: "{loanNumber}", label: "מספר הלוואה" },
      { key: "{mortgageNumber}", label: "מספר משכנתא" },
    ],
  },
  {
    title: "נושה בכיר",
    items: [
      { key: "{seniorCreditorName}", label: "שם נושה בכיר" },
      { key: "{seniorCreditorIdType}", label: "סוג מזהה נושה בכיר" },
      { key: "{seniorCreditorIdNumber}", label: "מספר מזהה נושה בכיר" },
    ],
  },
  {
    title: "חשבון בנק לווה",
    items: [
      { key: "{borrowerAccountNumber}", label: "מספר חשבון" },
      { key: "{borrowerBranchCode}", label: "קוד סניף" },
      { key: "{borrowerBankName}", label: "שם בנק" },
    ],
  },
  {
    title: "מורשים",
    items: [
      { key: "{authorizedName}", label: "שם מורשה" },
      { key: "{authorizedIdNumber}", label: "מספר תעודת זהות מורשה" },
    ],
  },
  {
    title: "פרטי פרויקט",
    items: [
      { key: "{tamAgreementDate}", label: "תאריך הסכם (מלא)" },
      { key: "{tamAgreementDateDay}", label: "יום הסכם" },
      { key: "{tamAgreementDateMonth}", label: "חודש הסכם" },
      { key: "{tamAgreementDateYear}", label: "שנת הסכם" },
      { key: "{appraiser}", label: "שמאי" },
      { key: "{supervisor}", label: "מפקח" },
      { key: "{additionalFloors}", label: "קומות נוספות" },
      { key: "{projectUnits}", label: "מספר יחידות בפרויקט" },
      { key: "{transferFees}", label: "דמי העברה" },
      { key: "{ltv}", label: "אחוז מימון" },
      { key: "{projectValue}", label: "שווי פרויקט" },
      { key: "{minimumWithdrawal}", label: "משיכה מינימלית" },
      { key: "{contractorName}", label: "שם קבלן" },
      { key: "{architect}", label: "אדריכל" },
    ],
  },
];

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
                      המזהה מופיע ב-URL לאחר &quot;folders/&quot; — גם אם התיקייה נמצאת בתוך תיקיות אחסון שיתופיות (Shared drive).
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

      {/* מקרא — משתנים לתבניות */}
      <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
        <CardBody>
          <CollapsibleSection
            title={t("Legend")}
            icon={<FiBook size={18} className="text-[#a57d45]" />}
            defaultOpen={false}
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4" dir="rtl">
              משתנים לשימוש בתבניות מסמך (העתק ל־Word והחלף בערכים).
            </p>
            <div className="space-y-6" dir="rtl">
              {LEGEND_SECTIONS.map((section) => (
                <div key={section.title}>
                  <h3 className="text-sm font-semibold text-[#a57d45] mb-2 pb-1 border-b border-gray-200 dark:border-gray-600">
                    {section.title}
                  </h3>
                  <div className="pt-1 flex flex-col gap-1">
                    {section.items.map((item) => (
                      <div key={item.key} className="flex items-baseline gap-2 text-sm">
                        <span className="font-mono text-[#a57d45] whitespace-nowrap" dir="ltr">
                          {item.key}
                        </span>
                        <span className="text-gray-600 dark:text-gray-300">– {item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </CardBody>
      </Card>

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
