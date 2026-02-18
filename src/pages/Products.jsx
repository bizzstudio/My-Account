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
  
    const filters = useProductFilter();
  
    const productFields = [
      { key: "_id", label: "ID" },
      { key: "name", label: t("ProductName") },
      { key: "sku", label: t("SKU") },
      { key: "barcode", label: t("Barcode") },
      { key: "owner.name", label: t("Owner") + " - " + t("Name") },
      { key: "owner.email", label: t("Owner") + " - " + t("Email") },
      { key: "description", label: t("Description") },
      { key: "images", label: t("ProductImages") },
      { key: "stock", label: t("Stock") },
      { key: "sales", label: t("Sales") },
      { key: "packages", label: t("Packages") },
      { key: "category", label: t("Category") },
      { key: "tags", label: t("Tags") },
      { key: "brand", label: t("Brand") },
      { key: "model", label: t("Model") },
      { key: "classification", label: t("Classification") },
      { key: "price", label: t("Price") },
      { key: "salePrice", label: t("SalePrice") },
      { key: "cargoType", label: t("CargoType") },
      { key: "autoShipment", label: t("AutoShipment") },
      { key: "isWarehouse", label: t("IsWarehouse") },
      { key: "status", label: t("Status") },
      { key: "createdAt", label: t("CreationDate") },
      { key: "updatedAt", label: t("UpdateDate") },
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
  
    const handleChangePage = (page) => setCurrentPage(page);
  
    const handleExportToExcel = () => {
      let dataToExport = products;
      if (isCheck.length > 0) dataToExport = products.filter(p => isCheck.includes(p._id));
      exportToExcel(dataToExport, productFields, t("Products"));
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
        onClick: () => ExportWord(products, isCheck),
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
                  { key: "borrowerIdType", label: t("BorrowerIdType") },
                  { key: "lawyerName", label: t("LawyerName") },
                  { key: "consultant", label: t("Consultant") },
                  { key: "primaryBacker", label: t("PrimaryBacker") },
                ]} />
                <ProductsTable
                  products={products}
                  isCheck={isCheck}
                  setIsCheck={setIsCheck}
                  isMobile={false}
                  handleDeleteSelected={handleDeleteSelected}
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
  