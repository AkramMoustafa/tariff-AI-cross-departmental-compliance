import { Box } from "@mui/material";
import { Routes, Route } from "react-router-dom";

import LandingPage from "./landingpage/landingpage";
import SignIn from "./dashboard/SignIn";
import SignUp from "./dashboard/SignUp";
import SignIn1 from "./dashboard/SignIn1";
import SignUp1 from "./dashboard/SignUp1";
import NotFoundPage from "./landingpage/NotFoundPage";
import ExecutiveApp from "./compliance_team/C_suite/ExecutiveViewerApp"
import ProtectedRoute from "./components/ProtectedRoute";
import { RootRedirect } from "./compliance_team/routes";
import ComplianceApp from "./compliance_team/ComplianceApp";
import DepartmentOwnerApp from "./compliance_team/Department_Owner/DepartmentOwnerApp"
import ControlOwnerApp from "./compliance_team/Control_Owner/ControlOwnerApp";
import AuditorApp from "./compliance_team/Auditor/AuditorApp";
import TariffCalculatorPage from "./tariffs_engine/tariffs";
import DashboardAppLayout from "./tariffs_engine/AppLayout"
import Payment from "./Payments/CheckoutSection"
import PaymentSuccess from "./Payments/payment_success"
import { ClientSessionProvider } from "@/api/ClientSessionProvider";
import BillingPage from "./Payments/billing";
import PricingPage from "./Payments/PricingPage";
import TariffImpactMaterials from "./tariffs_engine/TariffHistory"
import HsLookup from "./tariffs_engine/HsLookup"
import TariffExposureSnapshot from "./tariffs_engine/TariffExposureSnapshot"
export default function App() {
  return (
    <Box>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin1" element={<SignIn />} />
        <Route path="/signup1" element={<SignUp />} />
        <Route path="/signin" element={<SignIn1 />} />
        <Route path="/signup" element={<SignUp1 />} />
        <Route path="/redirect" element={<RootRedirect />} />

        {/* NEW Compliance App */}
        <Route
          path="/compliance/*"
          element={
            <ProtectedRoute>
              <ComplianceApp />
            </ProtectedRoute>
          }

        /><Route
          path="/executive/*"
          element={
            <ProtectedRoute>
              <ExecutiveApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Auditor/*"
          element={
            <ProtectedRoute>
              <AuditorApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/department_owner/*"
          element={
            <ProtectedRoute>
              <DepartmentOwnerApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/control_owner/*"
          element={
            <ProtectedRoute>
              <ControlOwnerApp />
            </ProtectedRoute>
          }
        />
        
        <Route
  path="/tariffs"
  element={
    <ClientSessionProvider>
      <DashboardAppLayout>
        <TariffCalculatorPage />
      </DashboardAppLayout>
    </ClientSessionProvider>
  }
/>
<Route
  path="/tariffs_history"
  element={
    <ClientSessionProvider>
      <DashboardAppLayout>
        <TariffImpactMaterials />
      </DashboardAppLayout>
    </ClientSessionProvider>
  }
/>
<Route
  path="/duties"
  element={
    <ClientSessionProvider>
      <DashboardAppLayout>
        <TariffExposureSnapshot />
      </DashboardAppLayout>
    </ClientSessionProvider>
  }
/>


<Route
  path="/payment"
  element={
    <ClientSessionProvider>
      <Payment />
    </ClientSessionProvider>
  }
/>


<Route
  path="/payment/success"
  element={
    <ClientSessionProvider>
      <PaymentSuccess />
    </ClientSessionProvider>
  }
/>

<Route
  path="/billing"
  element={
    <ClientSessionProvider>
      <BillingPage />
    </ClientSessionProvider>
  }
/>
<Route
  path="/pricing"
  element={
       <ClientSessionProvider>
          <PricingPage />
    </ClientSessionProvider>


  }
/>
      {/* <Route path="/tariff" element={<TariffCalculator />} /> */}

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Box>
  );
}
