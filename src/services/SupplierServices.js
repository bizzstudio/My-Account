import requests from "./httpService"; // או axios, תלוי איך הפרויקט שלך בנוי

const SupplierServices = {
  getAllSuppliers: async () => {
    return requests.get("/supplier"); // הנתיב בשרת לקבלת כל הספקים
  },

  
};

export default SupplierServices;