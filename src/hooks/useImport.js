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
                        const json = XLSX.utils.sheet_to_json(worksheet);
                        setImportStage('processing');
                        processFileData(json, "/products");
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
            // פרטי חתימה
            [t('SigningDate')]: 'signingDate',
            [t('LawyerName')]: 'lawyerName',
            [t('LawyerRegistrationNumber')]: 'lawyerRegistrationNumber',
            [t('LawyerIdNumber')]: 'lawyerIdNumber',
            [t('LawyerEmail')]: 'lawyerEmail',
            [t('Consultant')]: 'consultant',
            [t('ConsultantEmail')]: 'consultantEmail',
            [t('PrimaryBacker')]: 'primaryBacker',
            [t('PrimaryBackerId')]: 'primaryBackerId',
            [t('SecondaryBacker')]: 'secondaryBacker',
            [t('SecondaryBackerId')]: 'secondaryBackerId',
            [t('ThirdBacker')]: 'thirdBacker',
            [t('ThirdBackerId')]: 'thirdBackerId',
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
        };

        const mappedRow = {};
        for (const [key, value] of Object.entries(row)) {
            const fieldName = columnMap[key] || key;
            mappedRow[fieldName] = value;
        }
        return mappedRow;
    };

    // בניית מפת כל השמות הידועים (עברית → שם שדה)
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
        [t('LawyerName')]: 'lawyerName',
        [t('LawyerRegistrationNumber')]: 'lawyerRegistrationNumber',
        [t('LawyerIdNumber')]: 'lawyerIdNumber',
        [t('LawyerEmail')]: 'lawyerEmail',
        [t('Consultant')]: 'consultant',
        [t('ConsultantEmail')]: 'consultantEmail',
        [t('PrimaryBacker')]: 'primaryBacker',
        [t('PrimaryBackerId')]: 'primaryBackerId',
        [t('SecondaryBacker')]: 'secondaryBacker',
        [t('SecondaryBackerId')]: 'secondaryBackerId',
        [t('ThirdBacker')]: 'thirdBacker',
        [t('ThirdBackerId')]: 'thirdBackerId',
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
    });

    // ולידציה של כותרות הקובץ לפני עיבוד
    const validateColumns = (data) => {
        if (!data || data.length === 0) return { valid: false, missingRequired: [], unrecognized: [], recognized: [] };

        const columnMap = buildColumnMap();
        const knownColumns = Object.keys(columnMap);

        const fileColumns = Object.keys(data[0]);
        const recognized = fileColumns.filter(col => knownColumns.includes(col));
        const unrecognized = fileColumns.filter(col => !knownColumns.includes(col));

        // הקובץ תקין אם לפחות עמודה אחת מוכרת
        const valid = recognized.length > 0;

        return { valid, missingRequired: [], unrecognized, recognized, allExpected: knownColumns };
    };

    // Helper to parse arrays from string
    const parseArrayField = (value) => {
        if (!value || value === '') return [];
        if (Array.isArray(value)) return value;
        return value.split(',').map(item => item.trim()).filter(Boolean);
    };


    const processFileData = (data, pathname) => {
        if (!data || data.length === 0) {
            notifyError(t("emptyFile"));
            return;
        };

        try {
            let processedData = [];

            if (pathname === "/products") {
                // ולידציה של כותרות
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
                        }
                    });
                    return;
                }
                const num = (v) => (v !== undefined && v !== '' ? Number(v) : undefined);
                const str = (v) => (v !== undefined && v !== '' ? String(v).trim() : undefined);

                processedData = data.map((row) => {
                    const r = mapProductColumnNames(row);

                    const product = {
                        // לווה ראשון
                        borrowers: [{
                            borrowerName: str(r.borrowerName) || '',
                            borrowerFamily: str(r.borrowerFamily),
                            borrowerIdType: str(r.borrowerIdType),
                            borrowerIdNumber: num(r.borrowerIdNumber),
                            borrowerAddress: str(r.borrowerAddress),
                            borrowerDateOfBirth: r.borrowerDateOfBirth ? new Date(r.borrowerDateOfBirth) : undefined,
                            borrowerGender: str(r.borrowerGender),
                            borrowerEmail: str(r.borrowerEmail),
                        }],

                        // פרטי חתימה
                        signingDetails: {
                            signingDate: r.signingDate ? new Date(r.signingDate) : undefined,
                            lawyerName: str(r.lawyerName),
                            lawyerRegistrationNumber: num(r.lawyerRegistrationNumber),
                            lawyerIdNumber: num(r.lawyerIdNumber),
                            lawyerEmail: str(r.lawyerEmail),
                            consultant: str(r.consultant),
                            consultantEmail: str(r.consultantEmail),
                            primaryBacker: str(r.primaryBacker),
                            primaryBackerId: num(r.primaryBackerId),
                            secondaryBacker: str(r.secondaryBacker),
                            secondaryBackerId: num(r.secondaryBackerId),
                            thirdBacker: str(r.thirdBacker),
                            thirdBackerId: num(r.thirdBackerId),
                        },

                        // פרטי רישום
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

                        // הלוואה ראשונה
                        loans: (r.loanAmount || r.loanNumber) ? [{
                            loanAmount: num(r.loanAmount),
                            loanChange: str(r.loanChange),
                            clause: str(r.clause),
                            loanPlan: str(r.loanPlan),
                            loanMonths: num(r.loanMonths),
                            loanInterestRate: num(r.loanInterestRate),
                            adjustedLoan: num(r.adjustedLoan),
                            realLoan: num(r.realLoan),
                            primeMargin: num(r.primeMargin),
                            loanCreation: r.loanCreation ? new Date(r.loanCreation) : undefined,
                            loanNumber: num(r.loanNumber),
                            mortgageNumber: num(r.mortgageNumber),
                        }] : [],

                        // נושה בכיר
                        seniorCreditor: {
                            seniorCreditorName: str(r.seniorCreditorName),
                            seniorCreditorIdType: str(r.seniorCreditorIdType),
                            seniorCreditorIdNumber: num(r.seniorCreditorIdNumber),
                        },

                        // חשבון בנק
                        borrowerBankAccount: {
                            borrowerAccountNumber: num(r.borrowerAccountNumber),
                            borrowerBranchCode: num(r.borrowerBranchCode),
                            borrowerBankName: str(r.borrowerBankName),
                        },

                        // מוכרים
                        sellers: (r.sellerName) ? [{
                            sellerName: str(r.sellerName),
                            sellerIdType: str(r.sellerIdType),
                            sellerIdNumber: num(r.sellerIdNumber),
                            sellerAddress: str(r.sellerAddress),
                        }] : [],

                        // מורשים
                        authorizedPerson: (r.authorizedName) ? [{
                            authorizedName: str(r.authorizedName),
                            authorizedIdNumber: num(r.authorizedIdNumber),
                        }] : [],

                        // משכנים
                        mortgagors: (r.mortgagorDetails || r.mortgagorFamily) ? [{
                            mortgagorDetails: str(r.mortgagorDetails),
                            mortgagorFamily: str(r.mortgagorFamily),
                            mortgagorIdType: str(r.mortgagorIdType),
                            mortgagorIdNumber: num(r.mortgagorIdNumber),
                        }] : [],

                        // פרטי פרויקט
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
            }

            setSelectedFile(processedData);
            // Update modal to show file is ready for upload
            setImportStage(null);
            setImportResults({
                total: processedData.length,
                success: 0,
                failure: 0,
                errors: []
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
                    setImportResults({
                        success: successCount,
                        failure: failureCount,
                        total: totalCount,
                        errors: errors
                    });
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

                    setImportResults({
                        success: successCount,
                        failure: failureCount,
                        total: totalCount,
                        errors: errors
                    });
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