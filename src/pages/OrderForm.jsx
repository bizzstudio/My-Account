/**
 * File: src/pages/OrderForm.jsx
 * Route: /addOrder, /Order/:id/edit
 * Purpose: Create or edit order with all details
 */
import React, { useEffect, useContext, useState } from "react";
import { Card, CardBody } from "@windmill/react-ui";
import { t } from "i18next";

import PageTitle from "@/components/Typography/PageTitle";
import CollapsibleSection from "@/components/common/CollapsibleSection";

import useOrderSubmit from "@/hooks/Order/useOrderSubmit";
import { SidebarContext } from "@/context/SidebarContext";
import { Button } from "@windmill/react-ui";

// icons
import { BiSolidPackage } from "react-icons/bi";
import { MdPerson, MdInventory, MdEditNote } from "react-icons/md";
import { BiSolidDollarCircle } from "react-icons/bi";
import { RiAdminLine } from "react-icons/ri";
import { MdLocalShipping } from "react-icons/md";

// sections
import OrderMetaSection from "@/components/order/addOrder/sections/OrderMetaSection";
import CustomerDetailsSection from "@/components/order/addOrder/sections/CustomerDetailsSection";
import PricingSection from "@/components/order/addOrder/sections/PricingSection";
import CartSection from "@/components/order/addOrder/sections/cart/CartSection";
import NotesSection from "@/components/order/addOrder/sections/NotesSection";
import { UserContext } from "@/context/UserContext";
import OrderOwnerSection from "@/components/order/addOrder/sections/OrderOwnerSection";
import { useNavigate, useParams } from "react-router-dom";
import FormSubmitActions from "@/components/form/FormSubmitActions";
import ConfirmModal from "@/components/modal/ConfirmModal";

const OrderForm = ({ onSuccess }) => {
  const { id } = useParams();
  const {
    register,
    handleSubmit,
    onSubmit,
    setValue,
    watch,
    reset,
    errors,
    clearErrors,
    isSubmitting,
    allAdmins,
    orderStatusDetails,
    addProductToCart,
    updateCartItem,
    removeCartItem,
  } = useOrderSubmit(id, onSuccess);

  const { setBreadcrumbs, statuses, suppliers } = useContext(SidebarContext);
  const { state: userState } = useContext(UserContext);
  const { userInfo } = userState || {};
  const navigate = useNavigate();
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);

  useEffect(() => {
    setBreadcrumbs([
        { href: "/Order", label: t("Orders") },
        { label: id ? t("UpdateOrder") : t("AddOrder") },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full lg:px-20 sm:px-4 px-5 mx-auto">
      {showLeaveWarning && (
        <ConfirmModal
          isOpen={showLeaveWarning}
          message={t("UnsavedChangesWarning")}
          confirm={() => navigate("/Order")}
          cancel={() => setShowLeaveWarning(false)}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <PageTitle>
          {id ? t("UpdateOrder") : t("AddOrder")}
        </PageTitle>

        <Button
          onClick={() => setShowLeaveWarning(true)}
        >
          ← {t("BackToOrders")}
        </Button>
      </div>

      <Card className="shadow-xs bg-white dark:bg-gray-800">
        <CardBody className="flex flex-col gap-5">
          <form onSubmit={handleSubmit(onSubmit)}>

            <CollapsibleSection
              title={t("OrderDetails")}
              icon={<BiSolidPackage size={20} />}
              defaultOpen
            >
              <OrderMetaSection
                id={id}
                errors={errors}
                setValue={setValue}
                watch={watch}
                clearErrors={clearErrors}
                statuses={statuses}
                suppliers={suppliers}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title={t("CustomerDetails")}
              icon={<MdPerson size={22} />}
              defaultOpen
            >
              <CustomerDetailsSection
                register={register}
                errors={errors}
                setValue={setValue}
                watch={watch}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title={t("Cart")}
              icon={<MdInventory size={22} />}
              defaultOpen
            >
              <CartSection
                id={id}
                watch={watch}
                errors={errors}
                addProductToCart={addProductToCart}
                updateCartItem={updateCartItem}
                removeCartItem={removeCartItem}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title={t("Pricing")}
              icon={<BiSolidDollarCircle size={20} />}
              defaultOpen
            >
              <PricingSection
                id={id}
                watch={watch}
                setValue={setValue}
                register={register}
                errors={errors}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title={t("Notes")}
              icon={<MdEditNote size={22} />}
              defaultOpen
            >
              <NotesSection
                register={register}
                errors={errors}
                watch={watch}
                statusDetails={orderStatusDetails}
              />
            </CollapsibleSection>

            {/* שדות סופר אדמין */}
            {userInfo?.role === "super-admin" && (
              <CollapsibleSection
                title={t("superAdminFields")}
                icon={<RiAdminLine size={20} className="mt-1" />}
                defaultOpen
              >
                <OrderOwnerSection
                  allAdmins={allAdmins}
                  setValue={setValue}
                  watch={watch}
                />
              </CollapsibleSection>
            )}

            <FormSubmitActions
              id={id}
              onCancel={() => navigate("/Order")}
              isSubmitting={isSubmitting}
              createLabel="CreateOrder"
              updateLabel="UpdateOrder"
            />

          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default OrderForm;
