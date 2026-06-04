// portal/components/InquiryList.jsx — רשימת פניות + מענה (4.8)
import React from "react";
import { Card, CardBody } from "./ui/Card";
import Badge from "./ui/Badge";
import { EmptyState } from "./ui/States";
import { formatDate } from "../lib/format";
import { INQUIRY_STATUS_LABELS, INQUIRY_STATUS_TONE } from "../lib/labels";

export default function InquiryList({ inquiries, emptyText }) {
  if (!inquiries || inquiries.length === 0) {
    return <EmptyState title={emptyText || "לא נמצאו פניות"} />;
  }
  return (
    <div className="space-y-3">
      {inquiries.map((inq) => (
        <Card key={inq._id}>
          <CardBody>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {inq.inquiryNumber && (
                    <span className="text-xs text-gray-400">
                      #{inq.inquiryNumber}
                    </span>
                  )}
                  <h4 className="truncate font-semibold text-gray-900">
                    {inq.subject}
                  </h4>
                </div>
                <div className="mt-0.5 text-xs text-gray-500">
                  נפתחה: {formatDate(inq.createdAt)}
                </div>
              </div>
              <Badge tone={INQUIRY_STATUS_TONE[inq.status] || "gray"}>
                {INQUIRY_STATUS_LABELS[inq.status] || inq.status}
              </Badge>
            </div>

            <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">
              {inq.message}
            </p>

            {inq.adminResponse && (
              <div className="mt-3 rounded-xl bg-gray-50 p-3">
                <div className="mb-1 text-xs font-medium text-brand-600">
                  מענה החברה · {formatDate(inq.respondedAt)}
                </div>
                <p className="whitespace-pre-wrap text-sm text-gray-700">
                  {inq.adminResponse}
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
