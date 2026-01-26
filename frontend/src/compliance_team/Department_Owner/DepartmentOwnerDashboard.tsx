import { useEffect, useState } from "react";
import {
  getDepartmentOverview,
  getDepartmentHealth,
} from "@/api/departmentOwner.api";

export default function DepartmentOwnerLayout() {
  const [overview, setOverview] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    getDepartmentOverview().then(setOverview);
    getDepartmentHealth().then(setHealth);
  }, []);

  if (!overview || !health) return <div>Loading...</div>;

  return (
    <>
      <h2>{overview.department} Overview</h2>
      <p>Health: {health.health}</p>
    </>
  );
}