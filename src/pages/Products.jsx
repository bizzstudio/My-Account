// src/pages/Products.jsx
import {
    Card,
    CardBody,
    TableContainer,
    TableFooter,
  } from "@windmill/react-ui";
  import { useContext, useEffect, useState, useCallback } from "react";
  import { FiPlus, FiTrash2, FiDownload, FiUpload } from "react-icons/fi";
  import { t } from "i18next";
  
  import useExport from "@/hooks/useExport";
  import useImport from "@/hooks/useImport";
  import useProductFilter from "@/hooks/Product/useProductFilter";
  import TableLoading from "@/components/preloader/TableLoading";
  import ProductsTable from "@/components/product/ProductsTable";
  import ExportWord from "@/components/product/ExportWord";
  import TemplateSelectModal from "@/components/settings/TemplateSelectModal";
  import requests from "@/services/httpService";


  import ProductFilters from "@/components/product/ProductFilters";
  import NotFound from "@/components/table/NotFound";
  import PageTitle from "@/components/Typography/PageTitle";
  import ProductServices from "@/services/ProductServices";
  import useToggleDrawer from "@/hooks/useToggleDrawer";
  import DeleteModal from "@/components/modal/DeleteModal";
  import ImportResultsModal from "@/components/modal/ImportResultsModal";
  import ProductDrawer from "@/components/drawer/ProductDrawer";
  import MainDrawer from "@/components/drawer/MainDrawer";
  import { SidebarContext } from "@/context/SidebarContext";
  import { UserContext } from "@/context/UserContext";
  import DropdownMenu from "@/components/menu/DropdownMenu";
  import CustomPagination from "@/components/ui/CustomPagination";
  import UserServices from "@/services/UserServices";
  import StandardTable from "@/components/table/StandardTable";
  import StandardTableHeader from "@/components/table/StandardTableHeader";
  
  
  
  const Products = () => {
    const { state: userState } = useContext(UserContext);
    const { userInfo } = userState;
    const { toggleDrawer, setBreadcrumbs } = useContext(SidebarContext);
    const { exportToExcel } = useExport();
    const {
      handleSelectFile,
      handleUploadMultiple,
      fileInputRef,
      importResults,
      isImportModalOpen,
      importStage,
      handleCloseImportModal,
    } = useImport();
    const { serviceId, allId } = useToggleDrawer();
  
    const [isCheck, setIsCheck] = useState([]);
    const [allAdmins, setAllAdmins] = useState([]);
    const [productsData, setProductsData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [resultsPerPage] = useState(20);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [driveLinks, setDriveLinks] = useState({});
  
    const filters = useProductFilter();
  
    const productFields = [
  // ===== קבוצה 2: פרטי חתימה =====
  { key: "signingDetails.signingDate", label: t("SigningDate") },
  { key: "signingDetails.lawyerName", label: t("LawyerName") },
  { key: "signingDetails.lawyerRegistrationNumber", label: t("LawyerRegistrationNumber") },
  { key: "signingDetails.lawyerIdNumber", label: t("LawyerIdNumber") },
  { key: "signingDetails.consultant", label: t("Consultant") },
  { key: "signingDetails.primaryBacker", label: t("PrimaryBacker") },
  { key: "signingDetails.primaryBackerId", label: t("PrimaryBackerId") },
  { key: "signingDetails.secondaryBacker", label: t("SecondaryBacker") },
  { key: "signingDetails.secondaryBackerId", label: t("SecondaryBackerId") },
  { key: "signingDetails.thirdBacker", label: t("ThirdBacker") },
  { key: "signingDetails.thirdBackerId", label: t("ThirdBackerId") },

  // ===== קבוצה 3: לווים =====
  { key: "borrowers.borrowerName", label: t("BorrowerName") },
  { key: "borrowers.borrowerFamily", label: t("BorrowerFamily") },
  { key: "borrowers.borrowerIdType", label: t("BorrowerIdType") },
  { key: "borrowers.borrowerIdNumber", label: t("BorrowerIdNumber") },
  { key: "borrowers.borrowerAddress", label: t("BorrowerAddress") },
  { key: "borrowers.borrowerDateOfBirth", label: t("BorrowerDateOfBirth") },
  { key: "borrowers.borrowerGender", label: t("BorrowerGender") },
  { key: "borrowers.borrowerEmail", label: t("BorrowerEmail") },

  // ===== קבוצה 4: פרטי רישום =====
  { key: "registrationDetails.block", label: t("Block") },
  { key: "registrationDetails.plot", label: t("Plot") },
  { key: "registrationDetails.subPlot", label: t("SubPlot") },
  { key: "registrationDetails.land", label: t("Land") },
  { key: "registrationDetails.plan", label: t("Plan") },
  { key: "registrationDetails.contract", label: t("Contract") },
  { key: "registrationDetails.mortgageName", label: t("MortgageName") },
  { key: "registrationDetails.mortgageCompanyId", label: t("MortgageCompanyId") },
  { key: "registrationDetails.office", label: t("Office") },
  { key: "registrationDetails.plotArea", label: t("PlotArea") },
  { key: "registrationDetails.right", label: t("Right") },
  { key: "registrationDetails.parts", label: t("Parts") },
  { key: "registrationDetails.propertyType", label: t("PropertyType") },
  { key: "registrationDetails.street", label: t("Street") },
  { key: "registrationDetails.houseNumber", label: t("HouseNumber") },
  { key: "registrationDetails.apartmentNumber", label: t("ApartmentNumber") },
  { key: "registrationDetails.floor", label: t("Floor") },
  { key: "registrationDetails.direction", label: t("Direction") },
  { key: "registrationDetails.entrance", label: t("Entrance") },
  { key: "registrationDetails.unit", label: t("Unit") },
  { key: "registrationDetails.settlement", label: t("Settlement") },

  // ===== קבוצה 5: מוכרים =====
  { key: "sellers.sellerName", label: t("SellerName") },
  { key: "sellers.sellerIdType", label: t("SellerIdType") },
  { key: "sellers.sellerIdNumber", label: t("SellerIdNumber") },
  { key: "sellers.sellerAddress", label: t("SellerAddress") },

  // ===== קבוצה 6: הלוואות =====
  { key: "loans.loanAmount", label: t("LoanAmount") },
  { key: "loans.loanChange", label: t("LoanChange") },
  { key: "loans.clause", label: t("Clause") },
  { key: "loans.loanPlan", label: t("LoanPlan") },
  { key: "loans.loanMonths", label: t("LoanMonths") },
  { key: "loans.loanInterestRate", label: t("LoanInterestRate") },
  { key: "loans.adjustedLoan", label: t("AdjustedLoan") },
  { key: "loans.realLoan", label: t("RealLoan") },
  { key: "loans.primeMargin", label: t("PrimeMargin") },
  { key: "loans.loanCreation", label: t("LoanCreation") },
  { key: "loans.loanNumber", label: t("LoanNumber") },
  { key: "loans.mortgageNumber", label: t("MortgageNumber") },

  // ===== קבוצה 7: נושה בכיר =====
  { key: "seniorCreditor.seniorCreditorName", label: t("SeniorCreditorName") },
  { key: "seniorCreditor.seniorCreditorIdType", label: t("SeniorCreditorIdType") },
  { key: "seniorCreditor.seniorCreditorIdNumber", label: t("SeniorCreditorIdNumber") },

  // ===== קבוצה 8: חשבון בנק =====
  { key: "borrowerBankAccount.borrowerAccountNumber", label: t("AccountNumber") },
  { key: "borrowerBankAccount.borrowerBranchCode", label: t("BranchCode") },
  { key: "borrowerBankAccount.borrowerBankName", label: t("BankName") },

  // ===== קבוצה 9: מורשים =====
  { key: "authorizedPerson.authorizedName", label: t("AuthorizedName") },
  { key: "authorizedPerson.authorizedIdNumber", label: t("AuthorizedIdNumber") },

  { key: "mortgagors.mortgagorDetails", label: t("MortgagorDetails") },
  { key: "mortgagors.mortgagorFamily", label: t("MortgagorFamily") },
  { key: "mortgagors.mortgagorIdType", label: t("MortgagorIdType") },
  { key: "mortgagors.mortgagorIdNumber", label: t("MortgagorIdNumber") },

  // ===== קבוצה 10: פרטי פרויקט =====
  { key: "projectDetails.tamAgreementDate", label: t("TamAgreementDate") },
  { key: "projectDetails.appraiser", label: t("Appraiser") },
  { key: "projectDetails.supervisor", label: t("Supervisor") },
  { key: "projectDetails.additionalFloors", label: t("AdditionalFloors") },
  { key: "projectDetails.projectUnits", label: t("ProjectUnits") },
  { key: "projectDetails.transferFees", label: t("TransferFees") },
  { key: "projectDetails.ltv", label: t("LTV") },
  { key: "projectDetails.projectValue", label: t("ProjectValue") },
  { key: "projectDetails.minimumWithdrawal", label: t("MinimumWithdrawal") },
  { key: "projectDetails.contractorName", label: t("ContractorName") },
  { key: "projectDetails.architect", label: t("Architect") },

    ];
  
    // Fetch admins if super-admin
    const fetchAllAdmins = useCallback(async () => {
      if (userInfo?.role === "super-admin") {
        try {
          const res = await UserServices.getAllUser();
          setAllAdmins(res || []);
        } catch (err) {
          console.error("Error fetching admins:", err);
        }
      }
    }, [userInfo]);
  
    useEffect(() => { fetchAllAdmins(); }, [fetchAllAdmins]);
    useEffect(() => { setBreadcrumbs([{ href: "/products", label: t("Products") }]); }, []);
  
    // Fetch products
    const fetchProducts = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);
        const body = filters.buildParams(currentPage, resultsPerPage, userInfo);
        const res = await ProductServices.getAllProducts(body);
        setProductsData(res);
      } catch (err) {
        console.error("fetchProducts error:", err);
        setError(err?.message || "Error");
      } finally {
        setLoading(false);
      }
    }, [filters.buildParams, currentPage, resultsPerPage, userInfo]);
  
    useEffect(() => { fetchProducts(); }, [
      currentPage,
      filters.searchTerm,
      filters.selectedStatus,
      filters.selectedOwner,
      filters.filterCargoType,
      filters.filterAutoShipment,
      filters.filterIsWarehouse,
      filters.stockMin,
      filters.stockMax,
      filters.priceMin,
      filters.priceMax,
      filters.sortBy,
      filters.sortOrder,
    ]);
  
    const products = productsData?.products || [];
    const totalResults = productsData?.totalDoc || 0;

    // טעינת קישורי דרייב לכל המוצרים בדף הנוכחי
    useEffect(() => {
      if (!products.length) return;
      const items = products
        .filter((p) => p.borrowers?.[0]?.borrowerName)
        .map((p) => ({ productId: p._id, borrowerName: p.borrowers[0].borrowerName }));
      if (!items.length) return;
      requests.post("/products/drive-folders-batch", { items })
        .then((data) => setDriveLinks(data))
        .catch(() => {});
    }, [productsData]);
  
    const handleChangePage = (page) => setCurrentPage(page);
  
    const handleExportToExcel = () => {
      let dataToExport = products;
      if (isCheck.length > 0) dataToExport = products.filter(p => isCheck.includes(p._id));
      exportToExcel(dataToExport, productFields, t("ProductsMortgageFiles"));
    };
  
    // ✅ מחיקה מיידית – פריט בודד או מרובים – כולל עדכון מיידי של הטבלה
    const handleDeleteSelected = async (ids = null) => {
  try {
    const idsToDelete = ids || isCheck;

    console.log("🟡 Delete clicked");
    console.log("IDs to delete:", idsToDelete);
    console.log("Before delete - productsData:", productsData);

    if (!idsToDelete || idsToDelete.length === 0) {
      console.log("❌ No IDs selected");
      return;
    }

    // מחיקה מהשרת
    let res;
    if (idsToDelete.length === 1) {
      // אם רק מוצר אחד
      res = await ProductServices.deleteProduct(idsToDelete[0]);
    } else {
      // אם יותר ממוצר אחד
      res = await ProductServices.deleteManyProducts({ ids: idsToDelete });
      

    }
    
    console.log("🟢 Server delete response:", res);
    
        console.log("🟢 Server delete response:", res);

    // עדכון לוקאלי של ה-state
    setProductsData(prev => {
      if (!prev || !prev.products) {
        console.log("❌ prev or prev.products is null");
        return prev;
      }

      const updatedProducts = prev.products.filter(
        p => !idsToDelete.includes(p._id)
      );

      console.log("🟢 Updated products after filter:", updatedProducts);

      return {
        ...prev,
        products: updatedProducts,
        totalDoc: prev.totalDoc - idsToDelete.length,
      };
    });

    // ניקוי בחירה
    setIsCheck([]);

    console.log("🟢 Delete finished");
  } catch (err) {
    console.error("🔴 Error deleting products:", err);
  }
};

  
    return (
      <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
        <PageTitle>{t("ProductsPageTitle")}</PageTitle>
  
        <MainDrawer width="100vw">
          <ProductDrawer id={serviceId} onSuccess={fetchProducts} />
        </MainDrawer>

        {showTemplateModal && (
          <TemplateSelectModal
            products={products}
            isCheck={isCheck}
            onClose={() => setShowTemplateModal(false)}
            onExportDone={(links) => setDriveLinks((prev) => ({ ...prev, ...links }))}
          />
        )}
  
        {isCheck?.length >= 1 && (
          <DeleteModal
            ids={allId}
            setIsCheck={setIsCheck}
            title={t("theSelectedProducts")}
            table="products"
            onSuccess={fetchProducts}
          />
        )}
  
        <ImportResultsModal
          isOpen={isImportModalOpen}
          onClose={handleCloseImportModal}
          results={importResults}
          isLoading={loading}
          stage={importStage}
          onUpload={handleUploadMultiple}
        />
  
        <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
          <CardBody className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-2 items-stretch">
            <DropdownMenu
    options={[
      { label: <div className="flex items-center gap-1"><FiPlus size={20} /> {t("AddProduct")}</div>, onClick: toggleDrawer },
      { label: <div className="flex items-center gap-1.5"><FiDownload size={17} /> {isCheck.length > 0 ? t("ExportSelected") : t("ExportToExcel")}</div>, onClick: handleExportToExcel, disabled: !products || products.length === 0 },
      { label: <div className="flex items-center gap-1.5"><FiUpload size={17} /> {t("ImportFromExcel")}</div>, onClick: () => fileInputRef.current?.click(), disabled: false },
      { label: <div className="flex items-center gap-1.5"><FiTrash2 size={17} /> {t("Delete")}</div>, onClick: () => handleDeleteSelected(),  disabled: isCheck.length < 1 },
      { label: <div className="flex items-center gap-1.5"><FiDownload size={17} /> {t("ExportToWord")}</div>, 
        onClick: () => setShowTemplateModal(true),
        disabled: !products || products.length === 0
      }
    ]}
              />
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleSelectFile} style={{ display: 'none' }} />
            </div>
  
            <ProductFilters filters={filters} allAdmins={allAdmins} userInfo={userInfo} onFilterChange={() => setCurrentPage(1)} />
          </CardBody>
        </Card>
  
        {loading ? (
          <TableLoading row={12} col={userInfo?.role === "super-admin" ? 12 : 11} width={163} height={20} />
        ) : error ? (
          <span className="text-center mx-auto text-red-500">{error}</span>
        ) : products?.length !== 0 ? (
          <>
            <TableContainer className="mb-8 rounded-b-lg hidden md:block">
              <StandardTable>
                <StandardTableHeader columns={[
                  { key: "checkbox" },
                  { key: "actions", label: t("Actions") },
                  { key: "borrowerName", label: t("Image") },
                  { key: "borrowerIdNumber", label: t("BorrowerIdNumber") },
                  { key: "lawyerName", label: t("LawyerName") },
                  { key: "consultant", label: t("Consultant") },
                  { key: "primaryBacker", label: t("PrimaryBacker") },
                  { key: "driveFolder", label: t("DriveFolder") },
                ]} />
                <ProductsTable
                  products={products}
                  isCheck={isCheck}
                  setIsCheck={setIsCheck}
                  isMobile={false}
                  handleDeleteSelected={handleDeleteSelected}
                  driveLinks={driveLinks}
                />
              </StandardTable>
              <TableFooter>
                <CustomPagination totalResults={totalResults} resultsPerPage={resultsPerPage} onChange={handleChangePage} label={t("Table navigation")} currentPage={currentPage} />
              </TableFooter>
            </TableContainer>
  
            <div className="block md:hidden mb-1">
              <ProductsTable products={products} isCheck={isCheck} setIsCheck={setIsCheck} isMobile={true} handleDeleteSelected={handleDeleteSelected} />
              <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <CustomPagination totalResults={totalResults} resultsPerPage={resultsPerPage} onChange={handleChangePage} label={t("Table navigation")} currentPage={currentPage} />
              </div>
            </div>
          </>
        ) : (
          <NotFound title={t("noProductFound")} />
        )}
      </div>
    );
  };
  
  export default Products;
  