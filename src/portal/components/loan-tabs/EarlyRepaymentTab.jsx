// loan-tabs/EarlyRepaymentTab.jsx — פירעון מוקדם (4.7)
import React from "react";
import { FiMessageSquare } from "react-icons/fi";
import { Card, CardBody, CardHeader } from "../ui/Card";
import { FieldList, Field } from "../ui/Field";
import { Loading, ErrorState, EmptyState } from "../ui/States";
import useApi from "../../hooks/useApi";
import MeService from "../../services/meService";
import { formatMoney, formatDate } from "../../lib/format";

export default function EarlyRepaymentTab({ loanId, onOpenInquiry }) {
  const { data, loading, error, refetch } = useApi(
    () => MeService.getEarlyRepayment(loanId),
    [loanId]
  );

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const er = data?.earlyRepayment;
  const contact = data?.contact;

  return (
    <div className="space-y-4">
      {er ? (
        <>
          <Card className="bg-emerald-600 text-white ring-emerald-600">
            <CardBody>
              <div className="text-sm text-emerald-100">יתרה לפירעון מוקדם</div>
              <div className="mt-1 text-3xl font-bold">
                {formatMoney(er.payoffAmount)}
              </div>
              <div className="mt-1 text-xs text-emerald-100">
                תאריך חישוב: {formatDate(er.calculationDate)}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="פירוט פירעון מוקדם" />
            <CardBody>
              <FieldList>
                <Field label="קרן" value={formatMoney(er.principal)} />
                <Field label="ריבית" value={formatMoney(er.interest)} />
                <Field label="הצמדה" value={formatMoney(er.linkage)} />
                <Field label="עמלות" value={formatMoney(er.fees)} />
                <Field label="הוראות לביצוע פירעון" value={er.instructions} />
                <Field label="פרטי קשר לבירור" value={er.contactInfo} />
              </FieldList>
            </CardBody>
          </Card>
        </>
      ) : (
        <EmptyState
          title="אין כרגע מידע לפירעון מוקדם"
          hint="ניתן לפנות אלינו לקבלת חישוב מעודכן"
        />
      )}

      {(contact?.phone || contact?.email) && (
        <Card>
          <CardHeader title="פרטי קשר" />
          <CardBody>
            <FieldList>
              <Field label="טלפון" value={contact.phone} />
              <Field label="דוא״ל" value={contact.email} />
            </FieldList>
          </CardBody>
        </Card>
      )}

      <button
        onClick={onOpenInquiry}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        <FiMessageSquare />
        פתיחת פנייה בנושא פירעון מוקדם
      </button>
    </div>
  );
}
