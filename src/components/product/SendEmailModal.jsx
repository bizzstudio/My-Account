import { useState, useEffect } from "react";
import { FiX, FiMail, FiAlertCircle } from "react-icons/fi";
import { t } from "i18next";
import requests from "@/services/httpService";

const SendEmailModal = ({ product, onClose }) => {
  const borrowerName = product?.borrowers?.[0]?.borrowerName || "-";
  const borrowerEmail = product?.borrowers?.[0]?.borrowerEmail || null;
  const lawyerEmail = product?.signingDetails?.lawyerEmail || null;
  const consultantEmail = product?.signingDetails?.consultantEmail || null;

  const [driveFolderLink, setDriveFolderLink] = useState(null);
  const [loadingFolder, setLoadingFolder] = useState(true);
  const [selected, setSelected] = useState({
    borrower: !!borrowerEmail,
    lawyer: !!lawyerEmail,
    consultant: !!consultantEmail,
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    requests.get(`/products/${product._id}/drive-folder`)
      .then((data) => setDriveFolderLink(data.webViewLink || null))
      .catch(() => setDriveFolderLink(null))
      .finally(() => setLoadingFolder(false));
  }, [product._id]);

  const toggle = (key) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const anySelected = Object.values(selected).some(Boolean);

  const handleSend = async () => {
    setError("");
    if (!driveFolderLink) {
      setError(t("NoDriveFolderYet"));
      return;
    }
    const recipients = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k);

    if (recipients.length === 0) return;

    try {
      setSending(true);
      await requests.post(`/products/${product._id}/send-email`, {
        recipients,
        driveFolderLink,
      });
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || t("EmailSendError"));
    } finally {
      setSending(false);
    }
  };

  const rows = [
    {
      key: "borrower",
      label: t("Borrower"),
      email: borrowerEmail,
      name: borrowerName,
    },
    {
      key: "lawyer",
      label: t("Lawyer"),
      email: lawyerEmail,
      name: product?.signingDetails?.lawyerName || t("Lawyer"),
    },
    {
      key: "consultant",
      label: t("Consultant"),
      email: consultantEmail,
      name: product?.signingDetails?.consultant || t("Consultant"),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {t("SendEmailTitle")} — {borrowerName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            <FiX size={20} />
          </button>
        </div>

        {loadingFolder ? (
          <div className="py-8 text-center text-gray-400 text-sm">{t("Loading")}</div>
        ) : success ? (
          <div className="py-6 text-center">
            <div className="text-green-500 text-4xl mb-3">✓</div>
            <p className="text-gray-700 dark:text-gray-200 font-medium">{t("EmailSentSuccess")}</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 text-sm rounded-lg bg-[#a57d45] text-white hover:bg-[#8a6535] transition"
            >
              {t("Close")}
            </button>
          </div>
        ) : (
          <>
            {!driveFolderLink && (
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 mb-4 text-sm text-amber-700 dark:text-amber-400">
                <FiAlertCircle size={16} className="shrink-0" />
                {t("NoDriveFolderYet")}
              </div>
            )}

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              {t("SelectEmailRecipients")}
            </p>

            <div className="flex flex-col gap-2 mb-5">
              {rows.map(({ key, label, email, name }) => (
                <label
                  key={key}
                  className={`flex items-center justify-between gap-3 p-3 rounded-lg border transition cursor-pointer ${
                    email
                      ? "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40"
                      : "border-gray-100 dark:border-gray-800 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={!!selected[key]}
                      onChange={() => email && toggle(key)}
                      disabled={!email}
                      className="w-4 h-4 accent-[#a57d45]"
                    />
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{label}</p>
                      <p className="text-xs text-gray-400">{name}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                    {email || t("NoEmailDefined")}
                  </span>
                </label>
              ))}
            </div>

            {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                {t("Cancel")}
              </button>
              <button
                onClick={handleSend}
                disabled={!anySelected || sending || !driveFolderLink}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[#a57d45] text-white hover:bg-[#8a6535] disabled:opacity-50 transition"
              >
                <FiMail size={15} />
                {sending ? t("Sending") : t("SendEmail")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};


export default SendEmailModal;
