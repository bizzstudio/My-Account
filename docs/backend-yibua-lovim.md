# ייבוא לווים – דרישות לבק-אנד

כדי שכל הלווים יישמרו בייבוא, ה-API של הבק-אנד חייב לשמור את **מערך הלווים המלא** (`borrowers`) לכל תיק.

## נקודת קצה: `POST /products/all`

הפרונט שולח:
```json
{ "products": [ { "borrowers": [ {...}, {...} ], "signingDetails": {...}, ... }, ... ] }
```

## מה לבדוק בבק-אנד

1. **יצירת תיק (create product)**  
   וודא ש-`borrowers` נשמר כ-**מערך** (array), לא רק האיבר הראשון.  
   דוגמה ב-Mongoose:
   ```js
   product.borrowers = Array.isArray(req.body.borrowers) ? req.body.borrowers : [req.body.borrowers];
   ```

2. **קריאת תיק (get product by id)**  
   וודא שהתשובה מחזירה `borrowers` כ-**מערך**. אם במודל יש `borrowers: [borrowerSchema]`, אין להמיר ללווה בודד בתשובה.

3. **עדכון תיק (update product)**  
   וודא ש-`borrowers` מעודכן כ-**מערך מלא** שמתקבל ב-`req.body.borrowers`.

אם יש לך גישה ל-repo של הבק-אנד (למשל `bgr-backend`), חפש קבצים כמו `productController.js` או route של `POST /products/all` ו-`POST /products/add`, וודא שכל מקום שמטפל ב-`borrowers` שומר/מחזיר מערך.

---

## יועץ משכנתאות (`signingDetails.consultant`)

כדי שהעמודה **יועץ משכנתאות** תציג שמות אחרי ייבוא:

- **שמירה:** ב-create/update (כולל `POST /products/all`) יש לשמור את `signingDetails.consultant` (שם היועץ).
- **החזרה:** ב-list ו-get-by-id יש להחזיר `signingDetails` עם השדה `consultant`. אם `signingDetails` או `consultant` לא מוחזרים, הטבלה תציג "-" בעמודה יועץ משכנתאות.
