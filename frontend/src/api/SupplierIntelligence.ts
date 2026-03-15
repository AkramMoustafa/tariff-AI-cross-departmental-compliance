import apiUserClient from "./apiUserAuth";

export const previewSupplierJobs = async (supplier_id: number) => {
  const response = await apiUserClient.post("/suppliers/preview-jobs", {
    supplier_id
  });

  return response.data;
};
export const createSupplier = async (supplierData: any) => {
  const response = await apiUserClient.post("/suppliers", supplierData);

  return response.data;
};
// Fetch one supplier
export const getSupplier = async (supplier_id: number) => {
  const response = await apiUserClient.get(`/suppliers/${supplier_id}`);

  return response.data;
};
export const updateLinkedinCompanyName = async (
  supplierId: number,
  linkedin_company_name: string
) => {
  const response = await apiUserClient.patch(
    `/suppliers/${supplierId}/linkedin-name`,
    { linkedin_company_name }
  );

  return response.data;
};
// Fetch supplier dashboard (orders, quality, hiring, financial)
export const getSupplierDashboard = async (supplier_id: number) => {
  const response = await apiUserClient.get(`/suppliers/${supplier_id}/dashboard`);

  return response.data;
};

// Fetch ALL suppliers (for suppliers list page)
export const getSuppliers = async () => {
  const response = await apiUserClient.get("/suppliers");

  return response.data;
};
export const saveMetalPrices = async (
  symbol: string = "XAU",
  weeks: number = 20,
  supplier_id: number = 1
) => {
  const response = await apiUserClient.post(
    `/commodities/metals?symbol=${symbol}&weeks=${weeks}&supplier_id=${supplier_id}`
  );

  return response.data;
};
export const getHiringInsight = async (supplier_id: number) => {
  const response = await apiUserClient.get(
    `/suppliers/${supplier_id}/hiring-insight`
  );

  return response.data;
};
export const getSupplierIntelligence = async (supplier_id: number) => {
  const response = await apiUserClient.get(
    `/suppliers/${supplier_id}/intelligence`
  );

  return response.data;
};
export const saveForexRates = async (
  symbol: string = "EUR",
  weeks: number = 20,
  supplier_id: number = 1
) => {
  const response = await apiUserClient.post(
    `/commodities/forex?symbol=${symbol}&weeks=${weeks}&supplier_id=${supplier_id}`
  );

  return response.data;
};

export const saveEnergyPrices = async () => {
  const response = await apiUserClient.post(`/commodities/energy`, {});

  return response.data;
};
export const getPortActivity = async (
  supplierId: number,
  port: string
) => {
  const response = await apiUserClient.post(
    `/api/v1/suppliers/${supplierId}/port-analysis`,
    { port }
  );

  return response.data;
};

export const getPorts = async () => {
  const response = await apiUserClient.get("/api/v1/ports/list");
  return response.data;
};
export const verifyCorporateRegistry = async (
  supplierId: number,
  companyUrl: string
) => {
  const encodedUrl = encodeURIComponent(companyUrl);

  const response = await apiUserClient.post(
    `/suppliers/${supplierId}/registry-scan?url=${encodedUrl}`
  );

  return response.data;
};
export const getCountryRisk = async (country: string) => {
  const encodedCountry = encodeURIComponent(country);

  const response = await apiUserClient.get(`/country-risk/${encodedCountry}`);

  return response.data;
};
export const getCountries = async () => {
  const res = await apiUserClient.get("/country-risk/list");

  return res.data;
};
export const getMacroRisks = async () => {
  const response = await apiUserClient.get("/ai/macro-risks");

  return response.data;
};