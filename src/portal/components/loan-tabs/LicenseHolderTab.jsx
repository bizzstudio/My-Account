// loan-tabs/LicenseHolderTab.jsx — פרטי בעל הרישיון (4.9)
import React from "react";
import { Card, CardBody, CardHeader } from "../ui/Card";
import { FieldList, Field } from "../ui/Field";
import { EmptyState } from "../ui/States";

export default function LicenseHolderTab({ licenseHolder, thirdParty, merchant }) {
  return (
    <div className="space-y-4">
      {licenseHolder ? (
        <Card>
          <CardHeader title="פרטי בעל הרישיון" />
          <CardBody>
            <FieldList>
              <Field label="שם בעל הרישיון" value={licenseHolder.name} />
              <Field label="מספר מזהה" value={licenseHolder.identifier} />
              <Field label="מען" value={licenseHolder.address} />
              <Field label="דוא״ל" value={licenseHolder.email} />
              <Field label="טלפון" value={licenseHolder.phone} />
              <Field
                label="פנייה לממונה על פניות הציבור"
                value={licenseHolder.publicComplaintsOfficer}
              />
              <Field label="על פעילות החברה" value={licenseHolder.companyInfo} />
            </FieldList>
          </CardBody>
        </Card>
      ) : (
        <EmptyState title="פרטי בעל הרישיון אינם זמינים כעת" />
      )}

      {/* הלוואה שנמכרה לצד שלישי */}
      {thirdParty?.isSold && (
        <Card>
          <CardHeader title="ההלוואה נמכרה לצד שלישי" />
          <CardBody>
            <FieldList>
              <Field label="שם הצד השלישי" value={thirdParty.name} />
              <Field label="מזהה" value={thirdParty.identifier} />
              <Field label="טלפון" value={thirdParty.phone} />
              <Field label="אימייל" value={thirdParty.email} />
              <Field label="כתובת" value={thirdParty.address} />
            </FieldList>
          </CardBody>
        </Card>
      )}

      {/* מימון עסקה מול בית עסק */}
      {merchant?.name && (
        <Card>
          <CardHeader title="מימון עסקה מול בית עסק" />
          <CardBody>
            <FieldList>
              <Field label="שם בית העסק" value={merchant.name} />
              <Field label="טלפון" value={merchant.phone} />
              <Field label="אימייל" value={merchant.email} />
              <Field label="כתובת" value={merchant.address} />
              <Field label="פרטי התקשרות" value={merchant.contactDetails} />
            </FieldList>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
