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
import { DEFAULT_CARGO_TYPE } from "@/constants/cargoTypes";

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

    // Helper function to map Hebrew column names to field names
    const mapProductColumnNames = (row) => {
        const columnMap = {
            [t('ProductName')]: 'name',
            [t('SKU')]: 'sku',
            [t('Slug')]: 'slug',
            [t('Barcode')]: 'barcode',
            [t('Owner') + ' - ' + t('Email')]: 'owner',
            [t('Description')]: 'description',
            [t('ShortDescription')]: 'shortDescription',
            [t('LongDescription')]: 'longDescription',
            [t('ProductImages')]: 'images',
            [t('Stock')]: 'stock',
            [t('Sales')]: 'sales',
            [t('Cartons')]: 'packagesCount',
            [t('Packages')]: 'packagesCount',
            [t('Category')]: 'category',
            [t('AdditionalCategories')]: 'additionalCategories',
            [t('Tags')]: 'tags',
            [t('Brand')]: 'brand',
            [t('Model')]: 'model',
            [t('Classification')]: 'classification',
            [t('InternalCost')]: 'internalCost',
            [t('Price')]: 'price',
            [t('SalePrice')]: 'salePrice',
            [t('ShippingPrice')]: 'shippingPrice',
            [t('LikeDiscountPrice')]: 'likeDiscountPrice',
            [t('ShareDiscountPrice')]: 'shareDiscountPrice',
            [t('CargoType')]: 'cargoType',
            [t('AutoShipment')]: 'autoShipment',
            [t('IsWarehouse')]: 'isWarehouse',
            [t('SupportsShipping')]: 'supportsShipping',
            [t('SEOTitle')]: 'seoTitle',
            [t('SEODescription')]: 'seoDescription',
            [t('SEOKeywords')]: 'seoKeywords',
            [t('Weight')]: 'weight',
            [t('YouTubeVideoUrl')]: 'youtubeVideoUrl',
            [t('IsVisibleInStore')]: 'isVisibleInStore',
            [t('Language')]: 'language',
            [t('QuantityType')]: 'quantityType',
            [t('Status')]: 'status',
        };

        const mappedRow = {};
        for (const [key, value] of Object.entries(row)) {
            const fieldName = columnMap[key] || key;
            mappedRow[fieldName] = value;
        }
        return mappedRow;
    };

    // Build packages for import: count → array of { cargoType }; or use existing packages array if valid
    const buildPackagesFromImport = (packagesCount, packagesArray) => {
        if (Array.isArray(packagesArray) && packagesArray.length > 0 && packagesArray.every((p) => p && p.cargoType)) {
            return packagesArray.map((p) => ({ cargoType: p.cargoType || DEFAULT_CARGO_TYPE }));
        }
        const n = packagesCount != null ? Math.max(1, Number(packagesCount) || 1) : 1;
        return Array(n).fill(null).map(() => ({ cargoType: DEFAULT_CARGO_TYPE }));
    };

    // Helper to parse arrays from string
    const parseArrayField = (value) => {
        if (!value || value === '') return [];
        if (Array.isArray(value)) return value;
        return value.split(',').map(item => item.trim()).filter(Boolean);
    };

    // Helper to parse boolean from string
    const parseBoolean = (value) => {
        if (typeof value === 'boolean') return value;
        if (!value || value === '') return undefined;
        const str = String(value).toLowerCase().trim();
        if (str === t('Yes').toLowerCase() || str === 'true' || str === '1' || str === 'כן') return true;
        if (str === t('No').toLowerCase() || str === 'false' || str === '0' || str === 'לא') return false;
        return undefined;
    };

    // Helper to parse enum fields
    const parseEnumField = (value, enumMap) => {
        if (!value || value === '') return undefined;
        const str = String(value).trim();
        return enumMap[str] || str;
    };

    const processFileData = (data, pathname) => {
        if (!data || data.length === 0) {
            notifyError(t("emptyFile"));
            return;
        };

        try {
            let processedData = [];

            if (pathname === "/products") {
                // Enum mappings
                const statusMap = {
                    [t('Active')]: 'active',
                    [t('Inactive')]: 'inactive',
                };

                const cargoTypeMap = {
                    [t('CargoType_199')]: 199,
                    [t('CargoType_150')]: 150,
                    [t('CargoType_155')]: 155,
                    [t('CargoType_0')]: 0,
                };

                const quantityTypeMap = {
                    [t('Unit')]: 'unit',
                    [t('Kilogram')]: 'kg',
                    [t('Liter')]: 'liter',
                    [t('Box')]: 'box',
                    [t('Carton')]: 'carton',
                    [t('Other')]: 'other',
                };

                const languageMap = {
                    [t('Hebrew')]: 'hebrew',
                };

                processedData = data.map((row, index) => {
                    const mappedRow = mapProductColumnNames(row);

                    const product = {
                        name: mappedRow.name || '',
                        sku: mappedRow.sku || '',
                        barcode: mappedRow.barcode || '',
                        description: mappedRow.description || '',
                        images: parseArrayField(mappedRow.images),
                        stock: mappedRow.stock ? Number(mappedRow.stock) : 0,
                        sales: mappedRow.sales ? Number(mappedRow.sales) : 0,
                        packages: buildPackagesFromImport(mappedRow.packagesCount, mappedRow.packages),
                        category: mappedRow.category || '',
                        tags: parseArrayField(mappedRow.tags),
                        brand: mappedRow.brand || '',
                        model: mappedRow.model || '',
                        classification: mappedRow.classification || '',
                        price: mappedRow.price ? Number(mappedRow.price) : undefined,
                        salePrice: mappedRow.salePrice ? Number(mappedRow.salePrice) : undefined,
                        cargoType: parseEnumField(mappedRow.cargoType, cargoTypeMap) ?? 199,
                        autoShipment: parseBoolean(mappedRow.autoShipment) || false,
                        isWarehouse: parseBoolean(mappedRow.isWarehouse) || false,
                        status: parseEnumField(mappedRow.status, statusMap) || 'active',
                    };

                    // Add owner field only for super-admin
                    if (userInfo?.role === 'super-admin' && mappedRow.owner) {
                        product.owner = mappedRow.owner;
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