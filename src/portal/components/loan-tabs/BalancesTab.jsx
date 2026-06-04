// loan-tabs/BalancesTab.jsx — יתרות (4.2)
import React from "react";
import { Card, CardBody, CardHeader } from "../ui/Card";
import { FieldList, Field } from "../ui/Field";
import { EmptyState } from "../ui/States";
import { formatMoney, formatDate, formatPercent } from "../../lib/format";

export default function BalancesTab({ balances }) {
  if (!balances) return <EmptyState title="אין נתוני יתרות זמינים" />;
  return (
    <div className="space-y-4">
      {/* כרטיס סיכום בולט לסה"כ יתרה */}
      <Card className="bg-brand-600 text-white ring-brand-600">
        <CardBody>
          <div className="text-sm text-brand-100">סה״כ יתרת הלוואה לפירעון</div>
          <div className="mt-1 text-3xl font-bold">
            {formatMoney(balances.totalBalance)}
          </div>
          <div className="mt-1 text-xs text-brand-200">
            עד סוף התקופה · מעודכן לתאריך {formatDate(balances.asOfDate)}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="פירוט יתרות" />
        <CardBody>
          <FieldList>
            <Field label="יתרת קרן לפירעון" value={formatMoney(balances.principalBalance)} />
            <Field label="יתרת ריבית לפירעון" value={formatMoney(balances.interestBalance)} />
            <Field label="יתרת הצמדה" value={formatMoney(balances.linkageBalance)} />
            <Field
              label="ריבית נומינלית עדכנית"
              value={formatPercent(balances.nominalInterestRate)}
            />
            <Field
              label="התשלום האחרון שנגבה"
              value={formatMoney(balances.lastPaymentAmount)}
            />
            <Field
              label="תאריך התשלום האחרון"
              value={formatDate(balances.lastPaymentDate)}
            />
            <Field label="תאריך עדכניות המידע" value={formatDate(balances.asOfDate)} />
          </FieldList>
        </CardBody>
      </Card>
    </div>
  );
}
