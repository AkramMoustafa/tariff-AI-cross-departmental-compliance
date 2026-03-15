import { useEffect, useState } from "react";
import { getSupplierIntelligence } from "@/api/SupplierIntelligence";

const SupplierIntelligence = ({ supplierId }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const result = await getSupplierIntelligence(supplierId);
      setData(result);
    };

    loadData();
  }, [supplierId]);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h2>{data.supplier}</h2>

      <h3>Country</h3>
      <p>{data.country}</p>

      <h3>Port Status</h3>
      <p>{data.port?.status}</p>

      <h3>Metals</h3>
      <pre>{JSON.stringify(data.commodities.metals, null, 2)}</pre>

      <h3>Forex</h3>
      <pre>{JSON.stringify(data.commodities.forex, null, 2)}</pre>

      <h3>Energy</h3>
      <pre>{JSON.stringify(data.commodities.energy, null, 2)}</pre>

      <h3>Country Risk</h3>
      <pre>{JSON.stringify(data.country_risk, null, 2)}</pre>

      <h3>News Risk</h3>
      <pre>{JSON.stringify(data.news_risk, null, 2)}</pre>
    </div>
  );
};

export default SupplierIntelligence;