// loan-tabs/TransactionsTab.jsx — טבלת תנועות והחזרים בפועל (4.3, חובה)
import React from "react";
import { Card, CardHeader } from "../ui/Card";
import DataTable from "../ui/DataTable";
import { SkeletonRows, ErrorState } from "../ui/States";
import useApi from "../../hooks/useApi";
import MeService from "../../services/meService";
import { formatMoney, formatDate } from "../../lib/format";
import { TRANSACTION_TYPE_LABELS } from "../../lib/labels";

export default function TransactionsTab({ loanId }) {
  const { data, loading, error, refetch } = useApi(
    () => MeService.getTransactions(loanId),
    [loanId]
  );

  const columns = [
    { key: "transactionDate", header: "תאריך", render: (r) => formatDate(r.transactionDate) },
    {
      key: "type",
      header: "סוג תנועה",
      render: (r) => TRANSACTION_TYPE_LABELS[r.type] || r.type,
    },
    { key: "principalComponent", header: "קרן", align: "end", render: (r) => formatMoney(r.principalComponent) },
    { key: "interestComponent", header: "ריבית", align: "end", render: (r) => formatMoney(r.interestComponent) },
    { key: "linkageComponent", header: "הצמדה", align: "end", render: (r) => formatMoney(r.linkageComponent) },
    { key: "feeComponent", header: "עמלה", align: "end", render: (r) => formatMoney(r.feeComponent) },
    {
      key: "totalAmount",
      header: "סה״כ",
      align: "end",
      className: "font-semibold",
      render: (r) => formatMoney(r.totalAmount),
    },
    { key: "balanceAfter", header: "יתרה לאחר פעולה", align: "end", render: (r) => formatMoney(r.balanceAfter) },
  ];

  return (
    <Card>
      <CardHeader title="תנועות והחזרים בפועל" />
      {loading ? (
        <SkeletonRows rows={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <DataTable
          columns={columns}
          rows={data}
          caption="תנועות והחזרים בפועל"
          emptyText="לא נרשמו תנועות עבור הלוואה זו"
        />
      )}
    </Card>
  );
}
