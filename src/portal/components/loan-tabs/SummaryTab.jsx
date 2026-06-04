// loan-tabs/SummaryTab.jsx — תקציר הלוואה (4.1)
import React from "react";
import { Card, CardBody, CardHeader } from "../ui/Card";
import { FieldList, Field } from "../ui/Field";
import Badge from "../ui/Badge";
import { formatMoney, formatDate } from "../../lib/format";
import { LOAN_STATUS_LABELS, LOAN_STATUS_TONE } from "../../lib/labels";

export default function SummaryTab({ summary }) {
  if (!summary) return null;
  return (
    <Card>
      <CardHeader title="תקציר הלוואה" />
      <CardBody>
        <FieldList>
          <Field label="מספר הלוואה" value={summary.loanNumber} />
          <Field label="שם הלווה" value={summary.borrowerName} />
          <Field label="מספר זהות" value={summary.nationalId} />
          <Field label="סכום הלוואה מקורי" value={formatMoney(summary.originalAmount)} />
          <Field
            label="תקופת הלוואה מקורית"
            value={summary.originalTermMonths ? `${summary.originalTermMonths} חודשים` : "—"}
          />
          <Field
            label="תקופת הלוואה נוכחית"
            value={summary.currentTermMonths ? `${summary.currentTermMonths} חודשים` : "—"}
          />
          <Field
            label="מועד העמדת ההלוואה בפועל"
            value={formatDate(summary.disbursementDate)}
          />
          <Field label="סטטוס הלוואה">
            <Badge tone={LOAN_STATUS_TONE[summary.status] || "gray"}>
              {LOAN_STATUS_LABELS[summary.status] || summary.status}
            </Badge>
          </Field>
          <Field label="תאריך עדכניות המידע" value={formatDate(summary.asOfDate)} />
        </FieldList>
      </CardBody>
    </Card>
  );
}
