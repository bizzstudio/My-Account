// useImport.js
import csvToJson from "csvtojson";
import { useContext, useRef, useState } from "react";
import * as XLSX from "xlsx";

// Internal import
import { SidebarContext } from "@/context/SidebarContext";
import { UserContext } from "@/context/UserContext";
import ProductServices from "@/services/ProductServices";
import notifyApiResponse from "@/utils/notifyApiResponse";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useTranslation } from "react-i18next";
import { isValidIsraeliIdOrPassport } from "@/utils/israeliId";
import { getHeaderToFieldMap, CANONICAL_EXCEL_HEADERS } from "@/constants/excelCanonicalHeaders";

const useImport = () => {
    const { t } = useTranslation();

    const [isDisabled, setIsDisable] = useState(false);
    const [filename, setFileName] = useState("");
    const [selectedFile, setSelectedFile] = useState([]);
    const [importResults, setImportResults] = useState(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importStage, setImportStage] = useState(null); // 'uploading', 'processing', 'completed'
    const fileInputRef = useRef(null); // Ref עבור אינפוט הקובץ

    const { setIsUpdate, setLoading } = useContext(SidebarContext);
    const { state: userState } = useContext(UserContext);
    const { userInfo } = userState;

    // Handle file upload - for XL/CSV/JSON
    const handleSelectFile = (e) => {
        e.preventDefault();

        const fileReader = new FileReader();
        const file = e.target?.files[0];

        if (file) {
            setFileName(file?.name);
            setIsDisable(true);
            setIsImportModalOpen(true);
            setImportStage('uploading');
            setImportResults({ total: 0, success: 0, failure: 0, errors: [] });

            try {
                if (file.type === "application/json") {
                    fileReader.readAsText(file, "UTF-8");
                    fileReader.onload = (e) => {
                        let text = JSON.parse(e.target.result);
                        setImportStage('processing');
                        processFileData(text, "/products");
                    };
                } else if (file.type === "text/csv") {
                    fileReader.onload = async (event) => {
                        const text = event.target.result;
                        const json = await csvToJson().fromString(text);
                        setImportStage('processing');
                        processFileData(json, "/products");
                    };
                    fileReader.readAsText(file);
                } else if (
                    file.type.includes("spreadsheetml") ||
                    file.name.endsWith(".xls") ||
                    file.name.endsWith(".xlsx")
                ) {
                    fileReader.onload = (event) => {
                        const data = new Uint8Array(event.target.result);
                        const workbook = XLSX.read(data, { type: "array" });
                        const sheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[sheetName];
                        // header: 2 = array of arrays, כדי לתמוך בכותרות כפולות (שם פרטי לווה פעמיים = לווה 1 ולווה 2)
                        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 2, defval: "" });
                        if (Array.isArray(rawRows) && rawRows.length > 0 && Array.isArray(rawRows[0])) {
                            const { rows, totalDataRows } = buildRowsFromDuplicateHeaders(rawRows);
                            setImportStage('processing');
                            processFileData(rows, "/products", { totalDataRows });
                        } else {
                            const json = XLSX.utils.sheet_to_json(worksheet);
                            setImportStage('processing');
                            processFileData(json, "/products");
                        }
                    };
                    fileReader.readAsArrayBuffer(file);
                } else {
                    setIsImportModalOpen(false);
                    notifyError(t("invalidFileType"));
                }
            } catch (error) {
                setIsImportModalOpen(false);
                notifyError(t("fileProcessingError", { error: error.message }));
                console.log('error :>> ', error);
            }
        }
    };

    // Normalize header key: trim, remove BOM/RTL/LTR, first line only, collapse spaces (Excel/CSV sometimes add these)
    const normalizeHeaderKey = (key) => {
        if (key == null) return '';
        let s = String(key)
            .replace(/^\uFEFF/, '')
            .replace(/\u200E|\u200F|\u202A|\u202B|\u202C|\u202D|\u202E/g, '')
            .trim()
            .replace(/\s+/g, ' ');
        const firstLine = s.split(/\r?\n/)[0]?.trim() ?? s;
        return firstLine.replace(/\s+/g, ' ');
    };

    // מחזיר ערך מהשורה המקורית אם אחד מהכותרות האפשריות מתאים (גיבוי כש־map לא תפס)
    const getFromRow = (row, possibleNormalizedHeaders) => {
        if (!row || typeof row !== 'object') return undefined;
        for (const key of Object.keys(row)) {
            if (possibleNormalizedHeaders.includes(normalizeHeaderKey(key))) return row[key];
        }
        return undefined;
    };

    // כותרות אקסל — מקור אמת אחד: src/constants/excelCanonicalHeaders.js (כותרת אחת לכל שדה)

    // Helper function to map Hebrew column names to model field paths
    const mapProductColumnNames = (row) => {
        const columnMap = {
            // לווה
            [t('BorrowerName')]: 'borrowerName',
            [t('BorrowerFamily')]: 'borrowerFamily',
            [t('BorrowerIdNumber')]: 'borrowerIdNumber',
            [t('BorrowerIdType')]: 'borrowerIdType',
            [t('BorrowerAddress')]: 'borrowerAddress',
            [t('BorrowerDateOfBirth')]: 'borrowerDateOfBirth',
            [t('BorrowerGender')]: 'borrowerGender',
            [t('BorrowerEmail')]: 'borrowerEmail',
            // פרטי חתימה — מזהה עורך דין = מספר רישום (שאר הפרטים יימשכו אוטומטית מהשרת)
            [t('SigningDate')]: 'signingDate',
            [t('LawyerRegistrationNumber')]: 'lawyerRegistrationNumber',
            [t('LawyerIdNumber')]: 'lawyerIdNumber',
            [t('Consultant')]: 'consultant',
            [t('ConsultantEmail')]: 'consultantEmail',
            [t('PrimaryBacker')]: 'primaryBacker',
            [t('PrimaryBackerId')]: 'primaryBackerId',
            [t('SecondaryBacker')]: 'secondaryBacker',
            [t('SecondaryBackerId')]: 'secondaryBackerId',
            [t('ThirdBacker')]: 'thirdBacker',
            [t('ThirdBackerId')]: 'thirdBackerId',
            // חברות מימון (חברה ראשונה)
            [t('FinancingCompanyName')]: 'financingCompanyName',
            [t('FinancingCompanyId')]: 'financingCompanyId',
            // פרטי רישום
            [t('Block')]: 'block',
            [t('Plot')]: 'plot',
            [t('SubPlot')]: 'subPlot',
            [t('Land')]: 'land',
            [t('Plan')]: 'plan',
            [t('Contract')]: 'contract',
            [t('MortgageName')]: 'mortgageName',
            [t('MortgageCompanyId')]: 'mortgageCompanyId',
            [t('Office')]: 'office',
            [t('PlotArea')]: 'plotArea',
            [t('Right')]: 'right',
            [t('Parts')]: 'parts',
            [t('PropertyType')]: 'propertyType',
            [t('Street')]: 'street',
            [t('HouseNumber')]: 'houseNumber',
            [t('ApartmentNumber')]: 'apartmentNumber',
            [t('Floor')]: 'floor',
            [t('Direction')]: 'direction',
            [t('Entrance')]: 'entrance',
            [t('Unit')]: 'unit',
            [t('Settlement')]: 'settlement',
            // הלוואות
            [t('LoanAmount')]: 'loanAmount',
            [t('LoanChange')]: 'loanChange',
            [t('Clause')]: 'clause',
            [t('LoanPlan')]: 'loanPlan',
            [t('LoanMonths')]: 'loanMonths',
            [t('LoanInterestRate')]: 'loanInterestRate',
            [t('AdjustedLoan')]: 'adjustedLoan',
            [t('RealLoan')]: 'realLoan',
            [t('PrimeMargin')]: 'primeMargin',
            [t('LoanNumber')]: 'loanNumber',
            [t('MortgageNumber')]: 'mortgageNumber',
            // נושה בכיר
            [t('SeniorCreditorName')]: 'seniorCreditorName',
            [t('SeniorCreditorIdType')]: 'seniorCreditorIdType',
            [t('SeniorCreditorIdNumber')]: 'seniorCreditorIdNumber',
            // חשבון בנק
            [t('BorrowerAccountNumber')]: 'borrowerAccountNumber',
            [t('BorrowerBranchCode')]: 'borrowerBranchCode',
            [t('BorrowerBankName')]: 'borrowerBankName',
            // מוכרים
            [t('SellerName')]: 'sellerName',
            [t('SellerIdType')]: 'sellerIdType',
            [t('SellerIdNumber')]: 'sellerIdNumber',
            [t('SellerAddress')]: 'sellerAddress',
            // הלוואה — תאריך יצירה
            [t('LoanCreation')]: 'loanCreation',
            // מורשים
            [t('AuthorizedName')]: 'authorizedName',
            [t('AuthorizedIdNumber')]: 'authorizedIdNumber',
            // משכנים
            [t('MortgagorDetails')]: 'mortgagorDetails',
            [t('MortgagorFamily')]: 'mortgagorFamily',
            [t('MortgagorIdType')]: 'mortgagorIdType',
            [t('MortgagorIdNumber')]: 'mortgagorIdNumber',
            // פרטי פרויקט
            [t('TamAgreementDate')]: 'tamAgreementDate',
            [t('Appraiser')]: 'appraiser',
            [t('Supervisor')]: 'supervisor',
            [t('AdditionalFloors')]: 'additionalFloors',
            [t('ProjectUnits')]: 'projectUnits',
            [t('TransferFees')]: 'transferFees',
            [t('LTV')]: 'ltv',
            [t('ProjectValue')]: 'projectValue',
            [t('MinimumWithdrawal')]: 'minimumWithdrawal',
            [t('ContractorName')]: 'contractorName',
            [t('Architect')]: 'architect',
            ...getHeaderToFieldMap(),
        };

        const mappedRow = {};
        for (const [key, value] of Object.entries(row)) {
            const normalizedKey = normalizeHeaderKey(key);
            const fieldName = columnMap[normalizedKey] || columnMap[key] || key;
            mappedRow[fieldName] = value;
        }
        return mappedRow;
    };

    // כותרות שמופיעות פעמיים באותו קובץ (בלי 1/2) — מיפוי לפי סדר: הופעה ראשונה = לווה 1, שנייה = לווה 2
    const DUPLICATE_HEADER_FIELDS = {
        'שם פרטי לווה': ['borrowerName', 'borrowerFirstName_2'],
        'שם משפחה לווה': ['borrowerFamily', 'borrowerFamily_2'],
        'מספר תעודת זהות לווה': ['borrowerIdNumber', 'borrowerIdNumber_2'],
        'תעודת זהות לווה': ['borrowerIdNumber', 'borrowerIdNumber_2'],
        'כתובת לווה': ['borrowerAddress', 'borrowerAddress_2'],
        'סוג זיהוי לווה': ['borrowerIdType', 'borrowerIdType_2'],
        'סוג לווה': ['borrowerIdType', 'borrowerIdType_2'],
    };

    // בודק אם השורה נראית כמו שורת כותרות (מכילה מילות מפתח כמו שם, לווה, יועץ)
    const looksLikeHeaderRow = (row) => {
        if (!row || !Array.isArray(row)) return false;
        const str = (v) => String(v ?? '').trim();
        return row.some((cell) => {
            const n = normalizeHeaderKey(cell);
            return n && (n.includes('שם') || n.includes('לווה') || n.includes('יועץ') || n.includes('תעודת') || n.includes('כתובת') || n.includes('חתימה') || n.includes('עורך'));
        });
    };

    // המרת שורות אקסל (מערך מערכים) לאובייקטים — כותרות כפולות ממופות לפי סדר. אם שורה 1 לא נראית כותרת (למשל כותרת כללית), משתמשים בשורה 2
    // מחזיר { rows, totalDataRows } — totalDataRows = מספר השורות אחרי שורת הכותרת (להצגת סה"כ נכון)
    const buildRowsFromDuplicateHeaders = (rawRows) => {
        if (!rawRows?.length || !Array.isArray(rawRows[0])) return { rows: [], totalDataRows: 0 };
        let headerRowIndex = 0;
        if (!looksLikeHeaderRow(rawRows[0]) && rawRows.length > 1 && looksLikeHeaderRow(rawRows[1])) {
            headerRowIndex = 1;
        }
        const headerRow = rawRows[headerRowIndex];
        const columnMap = buildColumnMap();
        const occurrence = {};
        const indexToField = {};
        for (let j = 0; j < headerRow.length; j++) {
            const normalized = normalizeHeaderKey(headerRow[j]);
            let fieldName;
            if (DUPLICATE_HEADER_FIELDS[normalized]) {
                const idx = occurrence[normalized] ?? 0;
                const fields = DUPLICATE_HEADER_FIELDS[normalized];
                fieldName = fields[Math.min(idx, fields.length - 1)];
                occurrence[normalized] = idx + 1;
            } else {
                fieldName = columnMap[normalized] || columnMap[headerRow[j]] || (normalized || String(j));
            }
            indexToField[j] = fieldName;
        }
        const result = [];
        for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
            const rowArr = rawRows[i];
            const obj = {};
            for (let j = 0; j < (rowArr?.length ?? 0); j++) {
                if (indexToField[j] != null) obj[indexToField[j]] = rowArr[j];
            }
            result.push(obj);
        }
        const totalDataRows = rawRows.length - (headerRowIndex + 1);
        return { rows: result, totalDataRows };
    };

    // בניית מפת כל השמות הידועים (עברית → שם שדה) — כולל כותרות חלופיות לולידציה
    const buildColumnMap = () => ({
        [t('BorrowerName')]: 'borrowerName',
        [t('BorrowerFamily')]: 'borrowerFamily',
        [t('BorrowerIdNumber')]: 'borrowerIdNumber',
        [t('BorrowerIdType')]: 'borrowerIdType',
        [t('BorrowerAddress')]: 'borrowerAddress',
        [t('BorrowerDateOfBirth')]: 'borrowerDateOfBirth',
        [t('BorrowerGender')]: 'borrowerGender',
        [t('BorrowerEmail')]: 'borrowerEmail',
        [t('SigningDate')]: 'signingDate',
        [t('LawyerRegistrationNumber')]: 'lawyerRegistrationNumber',
        [t('LawyerIdNumber')]: 'lawyerIdNumber',
        [t('Consultant')]: 'consultant',
        [t('ConsultantEmail')]: 'consultantEmail',
        [t('PrimaryBacker')]: 'primaryBacker',
        [t('PrimaryBackerId')]: 'primaryBackerId',
        [t('SecondaryBacker')]: 'secondaryBacker',
        [t('SecondaryBackerId')]: 'secondaryBackerId',
        [t('ThirdBacker')]: 'thirdBacker',
        [t('ThirdBackerId')]: 'thirdBackerId',
        [t('FinancingCompanyName')]: 'financingCompanyName',
        [t('FinancingCompanyId')]: 'financingCompanyId',
        [t('Block')]: 'block',
        [t('Plot')]: 'plot',
        [t('SubPlot')]: 'subPlot',
        [t('Land')]: 'land',
        [t('Plan')]: 'plan',
        [t('Contract')]: 'contract',
        [t('MortgageName')]: 'mortgageName',
        [t('MortgageCompanyId')]: 'mortgageCompanyId',
        [t('Office')]: 'office',
        [t('PlotArea')]: 'plotArea',
        [t('Right')]: 'right',
        [t('Parts')]: 'parts',
        [t('PropertyType')]: 'propertyType',
        [t('Street')]: 'street',
        [t('HouseNumber')]: 'houseNumber',
        [t('ApartmentNumber')]: 'apartmentNumber',
        [t('Floor')]: 'floor',
        [t('Direction')]: 'direction',
        [t('Entrance')]: 'entrance',
        [t('Unit')]: 'unit',
        [t('Settlement')]: 'settlement',
        [t('LoanAmount')]: 'loanAmount',
        [t('LoanChange')]: 'loanChange',
        [t('Clause')]: 'clause',
        [t('LoanPlan')]: 'loanPlan',
        [t('LoanMonths')]: 'loanMonths',
        [t('LoanInterestRate')]: 'loanInterestRate',
        [t('AdjustedLoan')]: 'adjustedLoan',
        [t('RealLoan')]: 'realLoan',
        [t('PrimeMargin')]: 'primeMargin',
        [t('LoanCreation')]: 'loanCreation',
        [t('LoanNumber')]: 'loanNumber',
        [t('MortgageNumber')]: 'mortgageNumber',
        [t('SeniorCreditorName')]: 'seniorCreditorName',
        [t('SeniorCreditorIdType')]: 'seniorCreditorIdType',
        [t('SeniorCreditorIdNumber')]: 'seniorCreditorIdNumber',
        [t('BorrowerAccountNumber')]: 'borrowerAccountNumber',
        [t('BorrowerBranchCode')]: 'borrowerBranchCode',
        [t('BorrowerBankName')]: 'borrowerBankName',
        [t('SellerName')]: 'sellerName',
        [t('SellerIdType')]: 'sellerIdType',
        [t('SellerIdNumber')]: 'sellerIdNumber',
        [t('SellerAddress')]: 'sellerAddress',
        [t('AuthorizedName')]: 'authorizedName',
        [t('AuthorizedIdNumber')]: 'authorizedIdNumber',
        [t('MortgagorDetails')]: 'mortgagorDetails',
        [t('MortgagorFamily')]: 'mortgagorFamily',
        [t('MortgagorIdType')]: 'mortgagorIdType',
        [t('MortgagorIdNumber')]: 'mortgagorIdNumber',
        [t('TamAgreementDate')]: 'tamAgreementDate',
        [t('Appraiser')]: 'appraiser',
        [t('Supervisor')]: 'supervisor',
        [t('AdditionalFloors')]: 'additionalFloors',
        [t('ProjectUnits')]: 'projectUnits',
        [t('TransferFees')]: 'transferFees',
        [t('LTV')]: 'ltv',
        [t('ProjectValue')]: 'projectValue',
        [t('MinimumWithdrawal')]: 'minimumWithdrawal',
        [t('ContractorName')]: 'contractorName',
        [t('Architect')]: 'architect',
        ...getHeaderToFieldMap(),
    });

    // מיפוי מפורש: כותרת לא תקינה → כותרת תקנית (בלי "עיין ברשימה למטה")
    const EXPLICIT_HEADER_REPLACEMENTS = {
        'מסד': CANONICAL_EXCEL_HEADERS.block,
        'מרשם': CANONICAL_EXCEL_HEADERS.office,
        'תמורה': CANONICAL_EXCEL_HEADERS.transferFees,
        'ת.ח. הסכם מכר': CANONICAL_EXCEL_HEADERS.contract,
        'פריים': CANONICAL_EXCEL_HEADERS.primeMargin,
        'פיגורים': CANONICAL_EXCEL_HEADERS.adjustedLoan,
        'פיגורים מתואמת': CANONICAL_EXCEL_HEADERS.adjustedLoan,
        'שם משפחה לווה1': CANONICAL_EXCEL_HEADERS.borrowerName,
        'שם משפחה לווה 1': CANONICAL_EXCEL_HEADERS.borrowerName,
        'לווה סוג זיהוי 1': CANONICAL_EXCEL_HEADERS.borrowerIdType,
        'לווה סוג זיהוי 2': CANONICAL_EXCEL_HEADERS.borrowerIdType_2,
        'לווה סוג זיהוי1': CANONICAL_EXCEL_HEADERS.borrowerIdType,
        'לווה סוג זיהוי2': CANONICAL_EXCEL_HEADERS.borrowerIdType_2,
    };

    // מציע כותרת תקנית לכותרת לא מוכרת (לפי מילות מפתח) — כדי להציג ללקוח "השם צריך להיות X"
    const suggestCanonicalForWrongHeader = (wrongHeader) => {
        const n = normalizeHeaderKey(wrongHeader);
        if (!n) return null;
        if (EXPLICIT_HEADER_REPLACEMENTS[n]) return EXPLICIT_HEADER_REPLACEMENTS[n];
        if (n.includes('יועץ') && !n.includes('אימייל')) return CANONICAL_EXCEL_HEADERS.consultant;
        if (n.includes('אימייל') && n.includes('יועץ')) return CANONICAL_EXCEL_HEADERS.consultantEmail;
        if (n.includes('חברת מימון')) {
            const has2 = /2|שני/.test(n), has3 = /3|שלישי/.test(n);
            const isId = n.includes('מזהה') || n.includes('מספר');
            if (has3) return isId ? CANONICAL_EXCEL_HEADERS.financingCompanyId_3 : CANONICAL_EXCEL_HEADERS.financingCompanyName_3;
            if (has2) return isId ? CANONICAL_EXCEL_HEADERS.financingCompanyId_2 : CANONICAL_EXCEL_HEADERS.financingCompanyName_2;
            return isId ? CANONICAL_EXCEL_HEADERS.financingCompanyId : CANONICAL_EXCEL_HEADERS.financingCompanyName;
        }
        if ((n.includes('שם') && n.includes('לווה')) || n.includes('שם הלווה')) return n.includes('2') ? CANONICAL_EXCEL_HEADERS.borrowerFirstName_2 : CANONICAL_EXCEL_HEADERS.borrowerName;
        if (n.includes('משפחה') && n.includes('לווה')) return n.includes('2') ? CANONICAL_EXCEL_HEADERS.borrowerFamily_2 : CANONICAL_EXCEL_HEADERS.borrowerFamily;
        if ((n.includes('תעודת') || n.includes('ת.ז') || n.includes('זהות')) && n.includes('לווה')) return n.includes('2') ? CANONICAL_EXCEL_HEADERS.borrowerIdNumber_2 : CANONICAL_EXCEL_HEADERS.borrowerIdNumber;
        if (n.includes('כתובת') && n.includes('לווה')) return n.includes('2') ? CANONICAL_EXCEL_HEADERS.borrowerAddress_2 : CANONICAL_EXCEL_HEADERS.borrowerAddress;
        if ((n.includes('סוג זיהוי') || n.includes('סוג לווה')) && n.includes('לווה')) return n.includes('2') ? CANONICAL_EXCEL_HEADERS.borrowerIdType_2 : CANONICAL_EXCEL_HEADERS.borrowerIdType;
        if (n.includes('עורך דין') || n.includes('עורך הדין')) {
            if (n.includes('רישיון') || n.includes('רישום')) return CANONICAL_EXCEL_HEADERS.lawyerRegistrationNumber;
            if (n.includes('תעודת') || n.includes('זהות')) return CANONICAL_EXCEL_HEADERS.lawyerIdNumber;
            return CANONICAL_EXCEL_HEADERS.lawyerName;
        }
        if (n.includes('תאריך') && n.includes('חתימה')) return CANONICAL_EXCEL_HEADERS.signingDate;
        if (n.includes('גוש')) return CANONICAL_EXCEL_HEADERS.block;
        if (n.includes('חלקה') && !n.includes('תת')) return CANONICAL_EXCEL_HEADERS.plot;
        if (n.includes('תת חלקה')) return CANONICAL_EXCEL_HEADERS.subPlot;
        if (n.includes('מגרש')) return CANONICAL_EXCEL_HEADERS.land;
        if (n.includes('תוכנית')) return CANONICAL_EXCEL_HEADERS.plan;
        if (n.includes('רמ"י') || n.includes('חוזה')) return CANONICAL_EXCEL_HEADERS.contract;
        if (n.includes('משכנת') && !n.includes('ח.פ')) return CANONICAL_EXCEL_HEADERS.mortgageName;
        if (n.includes('ח.פ') && n.includes('משכנת')) return CANONICAL_EXCEL_HEADERS.mortgageCompanyId;
        if (n.includes('לשכה')) return CANONICAL_EXCEL_HEADERS.office;
        if (n.includes('סכום') && n.includes('הלוואה')) return /2|שני/.test(n) ? CANONICAL_EXCEL_HEADERS.loanAmount_2 : /3|שלישי/.test(n) ? CANONICAL_EXCEL_HEADERS.loanAmount_3 : CANONICAL_EXCEL_HEADERS.loanAmount;
        if (n.includes('נושה בכיר')) return n.includes('מ.ז') || n.includes('מזהה') ? CANONICAL_EXCEL_HEADERS.seniorCreditorIdNumber : n.includes('סוג') ? CANONICAL_EXCEL_HEADERS.seniorCreditorIdType : CANONICAL_EXCEL_HEADERS.seniorCreditorName;
        if (n.includes('חשבון') && n.includes('לווה')) return CANONICAL_EXCEL_HEADERS.borrowerAccountNumber;
        if (n.includes('סניף') && n.includes('לווה')) return CANONICAL_EXCEL_HEADERS.borrowerBranchCode;
        if (n.includes('בנק') && n.includes('לווה')) return CANONICAL_EXCEL_HEADERS.borrowerBankName;
        if (n.includes('מוכר')) return /2|שני/.test(n) ? (n.includes('כתובת') ? CANONICAL_EXCEL_HEADERS.sellerAddress_2 : n.includes('מס זיהוי') ? CANONICAL_EXCEL_HEADERS.sellerIdNumber_2 : n.includes('סוג') ? CANONICAL_EXCEL_HEADERS.sellerIdType_2 : CANONICAL_EXCEL_HEADERS.sellerName_2) : /3|שלישי/.test(n) ? (n.includes('כתובת') ? CANONICAL_EXCEL_HEADERS.sellerAddress_3 : n.includes('מס זיהוי') ? CANONICAL_EXCEL_HEADERS.sellerIdNumber_3 : n.includes('סוג') ? CANONICAL_EXCEL_HEADERS.sellerIdType_3 : CANONICAL_EXCEL_HEADERS.sellerName_3) : (n.includes('כתובת') ? CANONICAL_EXCEL_HEADERS.sellerAddress : n.includes('מס זיהוי') ? CANONICAL_EXCEL_HEADERS.sellerIdNumber : n.includes('סוג') ? CANONICAL_EXCEL_HEADERS.sellerIdType : CANONICAL_EXCEL_HEADERS.sellerName);
        if (n.includes('מורשה')) return /2|שני/.test(n) ? (n.includes('ת.ז') ? CANONICAL_EXCEL_HEADERS.authorizedIdNumber_2 : CANONICAL_EXCEL_HEADERS.authorizedName_2) : /3|שלישי/.test(n) ? (n.includes('ת.ז') ? CANONICAL_EXCEL_HEADERS.authorizedIdNumber_3 : CANONICAL_EXCEL_HEADERS.authorizedName_3) : (n.includes('ת.ז') ? CANONICAL_EXCEL_HEADERS.authorizedIdNumber : CANONICAL_EXCEL_HEADERS.authorizedName);
        if (n.includes('ממשכן')) return /2|שני/.test(n) ? (n.includes('משפחה') ? CANONICAL_EXCEL_HEADERS.mortgagorFamily_2 : n.includes('זיהוי') && !n.includes('מ.') ? CANONICAL_EXCEL_HEADERS.mortgagorIdType_2 : n.includes('מ.') ? CANONICAL_EXCEL_HEADERS.mortgagorIdNumber_2 : CANONICAL_EXCEL_HEADERS.mortgagorDetails_2) : /3|שלישי/.test(n) ? (n.includes('משפחה') ? CANONICAL_EXCEL_HEADERS.mortgagorFamily_3 : n.includes('זיהוי') && !n.includes('מ.') ? CANONICAL_EXCEL_HEADERS.mortgagorIdType_3 : n.includes('מ.') ? CANONICAL_EXCEL_HEADERS.mortgagorIdNumber_3 : CANONICAL_EXCEL_HEADERS.mortgagorDetails_3) : (n.includes('משפחה') ? CANONICAL_EXCEL_HEADERS.mortgagorFamily : n.includes('זיהוי') && !n.includes('מ.') ? CANONICAL_EXCEL_HEADERS.mortgagorIdType : n.includes('מ.') ? CANONICAL_EXCEL_HEADERS.mortgagorIdNumber : CANONICAL_EXCEL_HEADERS.mortgagorDetails);
        if (n.includes('סעיף')) return CANONICAL_EXCEL_HEADERS.clause;
        return null;
    };

    // ולידציה של כותרות הקובץ לפני עיבוד (מכיר גם כותרות עבריות וגם שמות שדות אחרי המרה — buildRowsFromDuplicateHeaders)
    const validateColumns = (data) => {
        if (!data || data.length === 0) return { valid: false, missingRequired: [], unrecognized: [], recognized: [], unrecognizedDetails: [] };

        const columnMap = buildColumnMap();
        const knownColumns = Object.keys(columnMap);
        const knownFields = new Set([...knownColumns, ...Object.values(columnMap)]);

        const fileColumns = Object.keys(data[0]);
        const recognized = fileColumns.filter(col => knownFields.has(normalizeHeaderKey(col)));
        const unrecognized = fileColumns.filter(col => !knownFields.has(normalizeHeaderKey(col)));
        const unrecognizedDetails = unrecognized.map(col => ({
            wrong: col,
            suggested: suggestCanonicalForWrongHeader(col),
        }));

        const valid = recognized.length > 0;
        return { valid, missingRequired: [], unrecognized, recognized, allExpected: knownColumns, unrecognizedDetails };
    };

    // Helper to parse arrays from string
    const parseArrayField = (value) => {
        if (!value || value === '') return [];
        if (Array.isArray(value)) return value;
        return value.split(',').map(item => item.trim()).filter(Boolean);
    };

    // Validate Israeli ID in product rows; return { invalidRows: [{ rowIndex, fieldKey }] }
    const validateProductIds = (products) => {
        const invalidRows = [];
        products.forEach((product, rowIndex) => {
            const check = (value, fieldKey) => {
                if (value === undefined || value === null || value === '') return;
                const str = String(value).trim().replace(/\D/g, '');
                if (str.length === 0) return;
                if (!isValidIsraeliIdOrPassport(value)) invalidRows.push({ rowIndex: rowIndex + 1, fieldKey });
            };
            product.borrowers?.forEach((b, i) => b.borrowerIdNumber != null && check(b.borrowerIdNumber, `BorrowerIdNumber (${i + 1})`));
            product.signingDetails?.lawyerIdNumber != null && check(product.signingDetails.lawyerIdNumber, 'LawyerIdNumber');
            product.seniorCreditor?.seniorCreditorIdNumber != null && check(product.seniorCreditor.seniorCreditorIdNumber, 'SeniorCreditorIdNumber');
            product.sellers?.forEach((s, i) => s.sellerIdNumber != null && check(s.sellerIdNumber, `SellerIdNumber (${i + 1})`));
            product.authorizedPerson?.forEach((a, i) => a.authorizedIdNumber != null && check(a.authorizedIdNumber, `AuthorizedIdNumber (${i + 1})`));
            product.mortgagors?.forEach((m, i) => m.mortgagorIdNumber != null && check(m.mortgagorIdNumber, `MortgagorIdNumber (${i + 1})`));
            product.financingCompanies?.forEach((f, i) => f.idNumber != null && check(f.idNumber, `FinancingCompanyId (${i + 1})`));
        });
        return { invalidRows };
    };

    // שורות ללא מספר רישום עורך דין — דילוג, נספרות כנכשלו. בודק גם 0, NaN, מחרוזת ריקה/רווחים
    const getRowsMissingLawyerRegistration = (products) => {
        const missing = [];
        products.forEach((product, rowIndex) => {
            const v = product.signingDetails?.lawyerRegistrationNumber;
            const isEmpty = v === undefined || v === null || v === '' || v === 0 ||
                (typeof v === 'number' && (isNaN(v) || !Number.isFinite(v))) ||
                (typeof v === 'string' && String(v).trim() === '');
            if (isEmpty) missing.push(rowIndex + 1);
        });
        return missing;
    };


    const processFileData = (data, pathname, options = {}) => {
        if (!data || data.length === 0) {
            notifyError(t("emptyFile"));
            return;
        };

        try {
            let processedData = [];
            let invalidRowIndices = [];
            let skippedMissingLawyerRegRows = [];
            let unrecognizedHeadersDetails = [];
            const { totalDataRows: optionTotalDataRows } = options;

            if (pathname === "/products") {
                // ולידציה של כותרות — חוסמים רק אם אין אף עמודה מוכרת
                const validation = validateColumns(data);
                if (!validation.valid) {
                    setImportStage('validation_error');
                    setImportResults({
                        total: 0,
                        success: 0,
                        failure: 0,
                        errors: [],
                        validationError: {
                            missingRequired: validation.missingRequired,
                            unrecognized: validation.unrecognized,
                            recognized: validation.recognized,
                            allExpected: validation.allExpected,
                            unrecognizedDetails: validation.unrecognizedDetails,
                        }
                    });
                    return;
                }
                if (validation.unrecognizedDetails?.length > 0) {
                    unrecognizedHeadersDetails = validation.unrecognizedDetails;
                }
                const num = (v) => (v !== undefined && v !== '' ? Number(v) : undefined);
                const str = (v) => (v !== undefined && v !== '' ? String(v).trim() : undefined);

                // שם מאוחד: לווה 1 = שם הלווה / שם פרטי+משפחה 1; לווה 2 = שם_2 או שם פרטי+משפחה (בלי 1)
                const borrowerFullName = (r, i) => {
                    if (i === 1) {
                        const one = str(r.borrowerName);
                        const fam = str(r.borrowerFamily);
                        if (one || fam) return [one, fam].filter(Boolean).join(' ').trim();
                        return [str(r.borrowerFirstName_2), str(r.borrowerFamily_2)].filter(Boolean).join(' ').trim() || '';
                    }
                    if (i === 2) {
                        const n2 = str(r.borrowerName_2);
                        if (n2) return n2;
                        return [str(r.borrowerFirstName_2), str(r.borrowerFamily_2)].filter(Boolean).join(' ').trim() || '';
                    }
                    return str(r[`borrowerName_${i}`]) || '';
                };

                // כותרות חלופיות ללווה 2–5 לקריאה ישירה מהשורה (גיבוי כש־map לא תפס)
                const BORROWER_ALT_HEADERS = (i) => ({
                    name: [`שם לווה ${i}`, `שם לווה${i}`, `שם הלווה ${i}`, `שם הלווה${i}`],
                    idNumber: [`תעודת זהות לווה ${i}`, `תעודת זהות לווה${i}`, `מספר תעודת זהות לווה ${i}`, `מספר תעודת זהות לווה${i}`, `ת.ז. לווה ${i}`, `ת.ז. לווה${i}`],
                    address: [`כתובת לווה ${i}`, `כתובת לווה${i}`],
                });

                processedData = data.map((row) => {
                    let r = mapProductColumnNames(row);

                    // קובץ עם לווה אחד בלבד (רק עמודות בלי "1"): מעבירים _2 ל־_1
                    const hasFirstBorrowerColumns = str(r.borrowerName) || str(r.borrowerFamily) || r.borrowerIdNumber != null;
                    if (!hasFirstBorrowerColumns && (str(r.borrowerFirstName_2) || str(r.borrowerFamily_2) || r.borrowerIdNumber_2 != null)) {
                        r = {
                            ...r,
                            borrowerName: r.borrowerFirstName_2,
                            borrowerFamily: r.borrowerFamily_2,
                            borrowerIdNumber: r.borrowerIdNumber_2,
                            borrowerAddress: r.borrowerAddress_2,
                            borrowerIdType: r.borrowerIdType_2,
                            borrowerFirstName_2: undefined,
                            borrowerFamily_2: undefined,
                            borrowerIdNumber_2: undefined,
                            borrowerAddress_2: undefined,
                            borrowerIdType_2: undefined,
                        };
                    }

                    // לווים — עד 5. לווה 1 ו־2: תמיכה בשם פרטי+משפחה (עם או בלי סיומת 1)
                    const borrowers = [];
                    for (let i = 1; i <= 5; i++) {
                        let name = i <= 2 ? borrowerFullName(r, i) : str(r[`borrowerName_${i}`]);
                        let idNum = i === 1 ? num(r.borrowerIdNumber) : num(r[`borrowerIdNumber_${i}`]);
                        let address = i === 1 ? str(r.borrowerAddress) : str(r[`borrowerAddress_${i}`]);
                        let dob = i === 1 ? r.borrowerDateOfBirth : r[`borrowerDateOfBirth_${i}`];
                        let gender = i === 1 ? str(r.borrowerGender) : str(r[`borrowerGender_${i}`]);
                        let email = i === 1 ? str(r.borrowerEmail) : str(r[`borrowerEmail_${i}`]);
                        if (i >= 2) {
                            if (name === undefined) name = str(getFromRow(row, BORROWER_ALT_HEADERS(i).name));
                            if (idNum == null) idNum = num(getFromRow(row, BORROWER_ALT_HEADERS(i).idNumber));
                            if (address === undefined) address = str(getFromRow(row, BORROWER_ALT_HEADERS(i).address));
                        }
                        const hasAnyValue = !!(name || idNum != null || address || (dob != null && dob !== '') || gender || email);
                        const shouldAdd = i === 1 ? (name || idNum != null) : hasAnyValue;
                        if (shouldAdd) {
                            borrowers.push({
                                borrowerName: name || '',
                                borrowerIdNumber: idNum,
                                borrowerAddress: address,
                                borrowerDateOfBirth: dob ? new Date(dob) : undefined,
                                borrowerGender: gender,
                                borrowerEmail: email,
                            });
                        }
                    }
                    if (borrowers.length === 0) borrowers.push({ borrowerName: '', borrowerIdNumber: undefined, borrowerAddress: undefined, borrowerDateOfBirth: undefined, borrowerGender: undefined, borrowerEmail: undefined });

                    // הלוואות — 1–3
                    const loans = [];
                    for (let i = 1; i <= 3; i++) {
                        const amount = i === 1 ? num(r.loanAmount) : num(r[`loanAmount_${i}`]);
                        const loanNum = i === 1 ? num(r.loanNumber) : num(r[`loanNumber_${i}`]);
                        if (amount != null || loanNum != null) {
                            loans.push({
                                loanAmount: amount,
                                loanChange: i === 1 ? str(r.loanChange) : str(r[`loanChange_${i}`]),
                                clause: str(r.clause),
                                loanPlan: i === 1 ? str(r.loanPlan) : str(r[`loanPlan_${i}`]),
                                loanMonths: i === 1 ? num(r.loanMonths) : num(r[`loanMonths_${i}`]),
                                loanInterestRate: i === 1 ? num(r.loanInterestRate) : num(r[`loanInterestRate_${i}`]),
                                adjustedLoan: i === 1 ? num(r.adjustedLoan) : num(r[`adjustedLoan_${i}`]),
                                realLoan: i === 1 ? num(r.realLoan) : num(r[`realLoan_${i}`]),
                                primeMargin: i === 1 ? num(r.primeMargin) : num(r[`primeMargin_${i}`]),
                                loanCreation: (i === 1 ? r.loanCreation : r[`loanCreation_${i}`]) ? new Date(i === 1 ? r.loanCreation : r[`loanCreation_${i}`]) : undefined,
                                loanNumber: loanNum,
                                mortgageNumber: i === 1 ? num(r.mortgageNumber) : num(r[`mortgageNumber_${i}`]),
                            });
                        }
                    }

                    // חברות מימון — 1–3 (מהעמודות שם + מזהה)
                    const financingCompanies = [];
                    for (let i = 1; i <= 3; i++) {
                        const fName = i === 1 ? str(r.financingCompanyName) : str(r[`financingCompanyName_${i}`]);
                        const fId = i === 1 ? str(r.financingCompanyId) : str(r[`financingCompanyId_${i}`]);
                        if (fName || fId) financingCompanies.push({ name: fName, idNumber: fId });
                    }

                    // מוכרים — 1–3
                    const sellers = [];
                    for (let i = 1; i <= 3; i++) {
                        const sName = i === 1 ? str(r.sellerName) : str(r[`sellerName_${i}`]);
                        if (sName != null) {
                            sellers.push({
                                sellerName: sName,
                                sellerIdType: i === 1 ? str(r.sellerIdType) : str(r[`sellerIdType_${i}`]),
                                sellerIdNumber: i === 1 ? num(r.sellerIdNumber) : num(r[`sellerIdNumber_${i}`]),
                                sellerAddress: i === 1 ? str(r.sellerAddress) : str(r[`sellerAddress_${i}`]),
                            });
                        }
                    }

                    // מורשים — 1–3
                    const authorizedPerson = [];
                    for (let i = 1; i <= 3; i++) {
                        const aName = i === 1 ? str(r.authorizedName) : str(r[`authorizedName_${i}`]);
                        const aId = i === 1 ? num(r.authorizedIdNumber) : num(r[`authorizedIdNumber_${i}`]);
                        if (aName != null || aId != null) authorizedPerson.push({ authorizedName: aName, authorizedIdNumber: aId });
                    }

                    // משכנים — 1–3
                    const mortgagors = [];
                    for (let i = 1; i <= 3; i++) {
                        const mDet = i === 1 ? str(r.mortgagorDetails) : str(r[`mortgagorDetails_${i}`]);
                        const mFam = i === 1 ? str(r.mortgagorFamily) : str(r[`mortgagorFamily_${i}`]);
                        const mId = i === 1 ? num(r.mortgagorIdNumber) : num(r[`mortgagorIdNumber_${i}`]);
                        if (mDet != null || mFam != null || mId != null) {
                            mortgagors.push({
                                mortgagorDetails: mDet,
                                mortgagorFamily: mFam,
                                mortgagorIdType: i === 1 ? str(r.mortgagorIdType) : str(r[`mortgagorIdType_${i}`]),
                                mortgagorIdNumber: mId,
                            });
                        }
                    }

                    const product = {
                        borrowers,

                        signingDetails: {
                            signingDate: r.signingDate ? new Date(r.signingDate) : undefined,
                            lawyerRegistrationNumber: (() => {
                                const raw = r.lawyerRegistrationNumber;
                                if (raw === undefined || raw === null || String(raw).trim() === '') return undefined;
                                const n = num(raw);
                                return n != null && Number.isFinite(n) ? n : undefined;
                            })(),
                            lawyerIdNumber: num(r.lawyerIdNumber),
                            consultant: str(r.consultant),
                            consultantEmail: str(r.consultantEmail),
                            primaryBacker: str(r.primaryBacker || r.financingCompanyName),
                            primaryBackerId: num(r.primaryBackerId ?? r.financingCompanyId),
                            secondaryBacker: str(r.secondaryBacker || r.financingCompanyName_2),
                            secondaryBackerId: num(r.secondaryBackerId ?? r.financingCompanyId_2),
                            thirdBacker: str(r.thirdBacker || r.financingCompanyName_3),
                            thirdBackerId: num(r.thirdBackerId ?? r.financingCompanyId_3),
                        },

                        financingCompanies,

                        registrationDetails: {
                            block: str(r.block),
                            plot: str(r.plot),
                            subPlot: str(r.subPlot),
                            land: str(r.land),
                            plan: str(r.plan),
                            contract: str(r.contract),
                            mortgageName: str(r.mortgageName),
                            mortgageCompanyId: str(r.mortgageCompanyId),
                            office: str(r.office),
                            registry: str(r.registry),
                            plotArea: str(r.plotArea),
                            right: str(r.right),
                            parts: str(r.parts),
                            propertyType: str(r.propertyType),
                            street: str(r.street),
                            houseNumber: num(r.houseNumber),
                            apartmentNumber: num(r.apartmentNumber),
                            floor: str(r.floor),
                            direction: str(r.direction),
                            entrance: str(r.entrance),
                            unit: str(r.unit),
                            settlement: str(r.settlement),
                        },

                        loans,

                        seniorCreditor: {
                            seniorCreditorName: str(r.seniorCreditorName),
                            seniorCreditorIdType: str(r.seniorCreditorIdType),
                            seniorCreditorIdNumber: num(r.seniorCreditorIdNumber),
                        },

                        borrowerBankAccount: {
                            borrowerAccountNumber: num(r.borrowerAccountNumber),
                            borrowerBranchCode: num(r.borrowerBranchCode),
                            borrowerBankName: str(r.borrowerBankName),
                        },

                        sellers,
                        authorizedPerson,
                        mortgagors,

                        projectDetails: {
                            tamAgreementDate: r.tamAgreementDate ? new Date(r.tamAgreementDate) : undefined,
                            appraiser: str(r.appraiser),
                            supervisor: str(r.supervisor),
                            additionalFloors: str(r.additionalFloors),
                            projectUnits: str(r.projectUnits),
                            transferFees: str(r.transferFees),
                            ltv: str(r.ltv),
                            projectValue: str(r.projectValue),
                            minimumWithdrawal: str(r.minimumWithdrawal),
                            contractorName: str(r.contractorName),
                            architect: str(r.architect),
                        },
                    };

                    if (userInfo?.role === 'super-admin' && r.owner) {
                        product.owner = r.owner;
                    }

                    return product;
                });

                const idValidation = validateProductIds(processedData);
                const invalidIdRowIndices = [...new Set((idValidation.invalidRows || []).map((r) => r.rowIndex))];
                const missingLawyerRegRowIndices = getRowsMissingLawyerRegistration(processedData);
                // שורות בלי ת.ז. תקינה או בלי מספר רישום עורך דין — לא מייבאים, נספרות כנכשלו
                const allSkippedRowIndices = [...new Set([...invalidIdRowIndices, ...missingLawyerRegRowIndices])];
                const dataToImport = processedData.filter((_, index) => !allSkippedRowIndices.includes(index + 1));

                if (dataToImport.length === 0) {
                    setImportStage('validation_error');
                    setImportResults({
                        total: processedData.length,
                        success: 0,
                        failure: 0,
                        errors: [],
                        validationError: {
                            invalidIdRows: idValidation.invalidRows,
                            missingLawyerRegRows: missingLawyerRegRowIndices,
                        }
                    });
                    notifyError(t("InvalidIsraeliId"));
                    return;
                }

                processedData = dataToImport;
                invalidRowIndices = invalidIdRowIndices;
                skippedMissingLawyerRegRows = missingLawyerRegRowIndices;
            }

            setSelectedFile(processedData);
            setImportStage(null);
            const totalRowsInFile = pathname === "/products"
                ? (optionTotalDataRows != null ? optionTotalDataRows : data.length)
                : processedData.length;
            setImportResults({
                total: processedData.length,
                totalRowsInFile,
                success: 0,
                failure: 0,
                errors: [],
                skippedIdRows: invalidRowIndices || [],
                skippedMissingLawyerRegRows: skippedMissingLawyerRegRows || [],
                unrecognizedHeadersDetails: unrecognizedHeadersDetails || []
            });
            notifySuccess(t("fileProcessed"));
        } catch (error) {
            console.log('error :>> ', error);
            setImportStage('completed');
            setImportResults({
                total: 0,
                success: 0,
                failure: 0,
                errors: [{ row: 1, message: error.message }]
            });
            notifyError(error.message);
        }
    };

    const handleUploadMultiple = async (e, pathname = location.pathname) => {
        if (selectedFile.length > 1) {
            setLoading(true);
            setImportStage('processing');
            setIsImportModalOpen(true);
            try {
                if (pathname === "/products") {
                    let res;
                    try {
                        res = await ProductServices.addAllProducts({ products: selectedFile });
                        console.log('res :>> ', res);
                    } catch (requestError) {
                        console.error('requestError :>> ', requestError);
                        // Handle cases where request throws but might have response data (207, 400)
                        if (requestError?.response?.data) {
                            res = requestError.response;
                        } else {
                            throw requestError;
                        }
                    }

                    const responseData = res?.data || res;
                    const statusCode = res?.status || res?.statusCode || 200;

                    // Extract summary from response
                    const summary = responseData?.summary || {};
                    const successCount = summary.succeeded || 0;
                    const failureCount = summary.failed || 0;
                    const totalCount = summary.total || selectedFile.length;

                    // Process errors from response
                    const errors = (responseData?.errors || []).map((error) => {
                        // Error can be an object with {en, he} or a string
                        const errorMessage = typeof error.error === 'object'
                            ? error.error.he || error.error.en || JSON.stringify(error.error)
                            : error.error || error.message || 'Unknown error';

                        return {
                            row: error.index || 0,
                            product: error.product || 'Unknown',
                            sku: error.sku || 'N/A',
                            message: errorMessage
                        };
                    });

                    // Set import results for modal
                    setImportResults(prev => ({
                        ...prev,
                        success: successCount,
                        failure: failureCount,
                        total: totalCount,
                        errors: errors
                    }));
                    setImportStage('completed');

                    setIsUpdate(true);

                    // Show notification based on status code
                    if (statusCode === 200) {
                        notifyApiResponse(res, true);
                    } else if (statusCode === 207) {
                        // Multi-Status - partial success
                        notifyApiResponse(res, true);
                    } else {
                        // 400 or other errors - but might have partial success
                        if (successCount > 0) {
                            notifyApiResponse(res, true);
                        } else {
                            notifyApiResponse(res, false);
                        }
                    }

                    // Don't remove file here - let modal close handle it
                    return res;
                }
            } catch (err) {
                // Handle errors and set import results
                if (pathname === "/products") {
                    const errorData = err?.response?.data || {};
                    const summary = errorData?.summary || {};
                    const successCount = summary.succeeded || 0;
                    const failureCount = summary.failed || selectedFile.length;
                    const totalCount = summary.total || selectedFile.length;

                    // Process errors from error response
                    const errors = (errorData?.errors || []).map((error) => {
                        const errorMessage = typeof error.error === 'object'
                            ? error.error.he || error.error.en || JSON.stringify(error.error)
                            : error.error || error.message || err.message || 'Unknown error';

                        return {
                            row: error.index || 0,
                            product: error.product || 'Unknown',
                            sku: error.sku || 'N/A',
                            message: errorMessage
                        };
                    });

                    // If no structured errors, create a generic one
                    if (errors.length === 0 && err.message) {
                        errors.push({
                            row: 1,
                            product: 'General Error',
                            sku: 'N/A',
                            message: err.message
                        });
                    }

                    setImportResults(prev => ({
                        ...prev,
                        success: successCount,
                        failure: failureCount,
                        total: totalCount,
                        errors: errors
                    }));
                    setImportStage('completed');
                }
                notifyApiResponse(err, false);
            } finally {
                setLoading(false);
            }
        } else {
            setIsImportModalOpen(false);
            notifyError(t("noValidFiles"));
        }
    };

    const handleRemoveSelectFile = (e) => {
        // console.log('remove');
        e?.preventDefault();
        setFileName("");
        setSelectedFile([]);
        setIsDisable(false);
        setImportStage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // איפוס הקלט של הקובץ
        }
    };

    const handleCloseImportModal = () => {
        // Always reset file and results when closing
        handleRemoveSelectFile();
        setImportResults(null);
        setIsImportModalOpen(false);
        setImportStage(null);
    };

    return {
        handleSelectFile,
        handleUploadMultiple,
        handleRemoveSelectFile,
        fileInputRef,
        filename,
        setFileName,
        isDisabled,
        importResults,
        setImportResults,
        isImportModalOpen,
        setIsImportModalOpen,
        importStage,
        handleCloseImportModal,
    };
};

export default useImport;