// loan-tabs/TracksTab.jsx — מסלולים וריבית (4.4) + הצמדה (4.5)
import React from "react";
import { Card, CardBody, CardHeader } from "../ui/Card";
import { FieldList, Field } from "../ui/Field";
import { EmptyState } from "../ui/States";
import { formatMoney, formatDate, formatPercent } from "../../lib/format";

export default function TracksTab({ tracks, linkage }) {
  const hasTracks = tracks && tracks.length > 0;
  return (
    <div className="space-y-4">
      {hasTracks ? (
        tracks.map((track) => (
          <Card key={track._id}>
            <CardHeader title={track.name} />
            <CardBody>
              <FieldList>
                <Field label="סכום במסלול" value={formatMoney(track.amount)} />
                <Field label="יתרת קרן במסלול" value={formatMoney(track.principalBalance)} />
                <Field label="ריבית נומינלית" value={formatPercent(track.interestRate)} />
                <Field label="תדירות שינוי ריבית" value={track.interestChangeFrequency} />
                <Field
                  label="מועד שינוי ריבית קרוב"
                  value={formatDate(track.nextInterestChangeDate)}
                />
                <Field
                  label="אירועים לשינוי ריבית"
                  value={track.interestChangeEvents}
                />
                <Field
                  label="ריבית פיגורים"
                  value={
                    track.defaultInterestRate != null
                      ? formatPercent(track.defaultInterestRate)
                      : "—"
                  }
                />
              </FieldList>
            </CardBody>
          </Card>
        ))
      ) : (
        <EmptyState title="לא הוגדרו מסלולים עבור הלוואה זו" />
      )}

      {/* הצמדה (4.5) */}
      {linkage && (
        <Card>
          <CardHeader title="הצמדה" />
          <CardBody>
            <FieldList>
              <Field label="סוג הצמדה" value={linkage.type} />
              <Field label="בסיס הצמדה" value={linkage.base} />
              <Field label="מועד שינוי" value={formatDate(linkage.changeDate)} />
              <Field
                label="שיעור הריבית במועד מתן ההלוואה"
                value={formatPercent(linkage.rateAtOrigination)}
              />
              <Field label="רכיבים שעליהם חלה ההצמדה" value={linkage.appliesTo} />
            </FieldList>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
