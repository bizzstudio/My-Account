# תבניות מסמך + Google Drive — מצב בבקאנד

## מה כבר קיים בבקאנד (bgr-backend)

- **תיקיית Drive:** העלאה לתיקייה `"קבצי המשרד"` תחת התיקייה הראשית (`driveFolderId` מהגדרות או .env).
- **POST /api/templates** — מעלה קובץ ל-Drive ויוצר רשומת Template ב-DB עם `name`, `driveFileId`.  
  ⚠️ **חסר:** שם הקובץ ב-Drive כרגע הוא `req.file.originalname` (שם הקובץ שהועלה), לא שם התבנית שהמשתמש הזין. חסר שמירת `webViewLink`.
- **GET /api/templates** — מחזיר רשימת תבניות (name, driveFileId, createdAt).  
  ⚠️ **חסר:** לא מחזיר `webViewLink`.
- **DELETE /api/templates/:id** — מוחק מ-DB **ומדרייב** (מלא).
- **GET /api/templates/:id/file** — מוריד את קובץ התבנית מ-Drive (לשימוש ב-ExportWord ובהורדה מההגדרות).

## מה חסר בבקאנד (והושלם בהמשך)

1. **שם קובץ ב-Drive = שם התבנית** — ב-POST להשתמש ב-`name` מהבקשה כשם הקובץ ב-Drive (למשל `שלום.docx`), לא `req.file.originalname`.
2. **webViewLink** — ב-POST אחרי יצירת הקובץ ב-Drive לקבל `webViewLink` (Drive API: `files.get` עם `fields: 'webViewLink'`), לשמור ב-DB, ולהחזיר ב-GET /api/templates.
3. **POST /api/templates/sync** — לעבור על כל התבניות, לבדוק ב-Drive API אם הקובץ עדיין קיים; אם לא (נמחק בדרייב) — למחוק את הרשומה מה-DB. הפרונט קורא ל-endpoint הזה ואז מרענן את הרשימה.

---

**מודל Template נוכחי:** `name`, `driveFileId`, timestamps. יש להוסיף שדה אופציונלי `webViewLink`.

---

## ייצוא Word (מילוי תבנית) — מה נדרש בבקאנד

המיזוג ל־DOCX רץ בפרונט (`ExportWord` + `buildWordTemplateData`). השרת **לא** ממלא תגים; הוא רק מחזיר את קובץ התבנית ומקבל את ה־DOCX אחרי מילוי.

כדי שהמסמך יכיל נתונים:

1. **GET /products/:id** (ורשימת מוצרים אם משם מייצאים) חייב להחזיר את כל האובייקטים השמורים:  
   `registrationDetails`, `signingDetails`, `projectDetails`, `borrowerBankAccount`, `seniorCreditor`,  
   `borrowers` (מערך מלא), `financingCompanies`, `sellers`, `loans`, `authorizedPerson`, `mortgagors`.  
   אם השרת מחזיר רק חלק מהשדות או מערך `borrowers` עם איבר אחד בלבד למרות שיש כמה — חלק מהתגים במקרא יישארו `-` או לא מדויקים.  
   בכל איבר ב־`borrowers`: לשמור ולהחזיר גם **`borrowerLastName`** (שם משפחה, מחרוזת אופציונלית) לצד **`borrowerName`** (שם פרטי). בלי השדה ב-DB, ייצוא Word יציג `-` ב־`{borrowerLastName}` / `{mortgagorLastName1}` וכו'.
2. **POST/PUT מוצר** — לוודא שהסכימה ב-Mongo (או ORM) כוללת את כל השדות הנ"ל (כולל `borrowers[].borrowerLastName`) ושאין `select`/`lean` שמסננים nested objects לפני השמירה או לפני הקריאה.
3. **תאימות שמות שדות** — חברות מימון במוצר: `financingCompanies[].name` ו־`financingCompanies[].idNumber` (לא חייבים להיות זהים לשמות במקרא Word; הפרונט ממפה ל־`financingCompanyName` / `financingCompanyIdNumber`).
