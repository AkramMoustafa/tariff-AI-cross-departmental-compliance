import apiUserClient from "./apiUserAuth";

export const extractPO = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiUserClient.post("/api/po/extract-po", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/**
 * Save PO to backend database
 */
export const savePO = async (payload: any) => {
  const response = await apiUserClient.post("/api/po/save-po", payload);
  return response.data;
};
export const predictPO = async (poId: number) => {
  const response = await apiUserClient.post("/api/po/predict-po", {
    po_id: poId
  });

  return response.data;
};

export const analyzePOAgent = async (poId: number) => {
  const response = await apiUserClient.post("/api/po/agent/analyze-po", {
    po_id: poId,
  });

  return response.data;
};