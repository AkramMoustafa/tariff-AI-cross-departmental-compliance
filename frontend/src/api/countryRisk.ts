import apiUserClient from "./apiUserAuth";
export const getCountryNewsEvents = async (country: string) => {
  const response = await apiUserClient.get(`/news/events/${country}`);

  return response.data;
};