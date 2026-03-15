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
import PrePOReview from "./PO/PrePOReview"
import TornadoChart from "./PO/TornadoChart"
import MonteCarloDashboard from "./PO/MonteCarlo"
import MarginRiskDashboard from "./Supplier/MarginRiskDashboard"
import SupplierRiskProfile from "./Supplier/SupplierRisk"
import SupplierRiskDirectory from "./Supplier/SupplierRiskDirectory"
import SupplierComparison from "./Supplier/SupplierComparison"
import SourcingMixOptimizer from "./Supplier/SourcingMixOptimizer"
import SupplierIntake from "./Supplier/InputSupplier"
import SupplierMarginImpact from "./Supplier/SupplierMarginImpact"
import SupplierRiskInsights from "./Supplier/AdvancedSupplier"
import SupplierPortfolioAnalysis from "./Supplier/SupplierPortfolioAnalysis"
import TradeReviewResult from "./PO/TradeReviewResult"
import TradeAuthorization from "./PO/TradeAuthorization"
import SupplierProfile from "./Supplier/supplier"
import Suppliers from "./Supplier/suppliers"
import SupplierRiskDashboard from "./Supplier/Trial"
import SupplierIntelligence from "./Supplier/s"
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
  path="/TradeAuthorization"
  element={
    <ClientSessionProvider>
      <DashboardAppLayout>
        <TradeAuthorization />
      </DashboardAppLayout>
    </ClientSessionProvider>
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
SupplierIntelligence
<Route
  path="/po"
  element={
    <ClientSessionProvider>
      <DashboardAppLayout>
          <PrePOReview />
      </DashboardAppLayout>
    </ClientSessionProvider>


  }
/>

<Route
  path="/suppliers/:supplierId"
  element={
    <ClientSessionProvider>
      <DashboardAppLayout>
        <SupplierProfile />
      </DashboardAppLayout>
    </ClientSessionProvider>
  }
/>
<Route
  path="/s"
  element={
    <ClientSessionProvider>
      <DashboardAppLayout>
        <SupplierIntelligence supplierId={1} />
      </DashboardAppLayout>
    </ClientSessionProvider>
  }
/>
<Route
  path="/TradeReviewResult"
  element={
    <ClientSessionProvider>
      <DashboardAppLayout>
          <TradeReviewResult />
      </DashboardAppLayout>
    </ClientSessionProvider>


  }
/>

<Route
  path="/SupplierIntake"
  element={
    <ClientSessionProvider>
      <DashboardAppLayout>
          <SupplierIntake />
      </DashboardAppLayout>
    </ClientSessionProvider>


  }
/>
<Route
  path="/suppliers"
  element={
    <ClientSessionProvider>
      <DashboardAppLayout>
          <Suppliers />
      </DashboardAppLayout>
    </ClientSessionProvider>


  }
/>
<Route
  path="/SupplierRiskInsights"
  element={
    <ClientSessionProvider>
      <DashboardAppLayout>
          <SupplierRiskInsights />
      </DashboardAppLayout>
    </ClientSessionProvider>


  }
/>
<Route
  path="/SupplierPortfolioAnalysis"
  element={
    <ClientSessionProvider>
      <DashboardAppLayout>
          <SupplierPortfolioAnalysis />
      </DashboardAppLayout>
    </ClientSessionProvider>


  }
/>



<Route
  path="/SupplierComparison"
  element={
    <ClientSessionProvider>
      <DashboardAppLayout>
          <SupplierComparison />
      </DashboardAppLayout>
    </ClientSessionProvider>


  }
/>
<Route
  path="/SourcingMixOptimizer"
  element={
    <ClientSessionProvider>
      <DashboardAppLayout>
          <SourcingMixOptimizer />
      </DashboardAppLayout>
    </ClientSessionProvider>


  }
/><Route
  path="/SupplierMarginImpact"
  element={
    <ClientSessionProvider>
      <DashboardAppLayout>
          <SupplierMarginImpact />
      </DashboardAppLayout>
    </ClientSessionProvider>


  }
/>

<Route
  path="/SupplierRiskDirectory"
  element={
    <ClientSessionProvider>
      <DashboardAppLayout>
          <SupplierRiskDirectory />
      </DashboardAppLayout>
    </ClientSessionProvider>


  }
/>


<Route path="/SupplierRiskProfile/:supplierId/" element={<SupplierRiskProfile />} />

<Route
  path="/MarginRiskDashboard"
  element={
    <ClientSessionProvider>
      <DashboardAppLayout>
          <MarginRiskDashboard />
      </DashboardAppLayout>
    </ClientSessionProvider>


  }
/>


<Route
  path="/SupplierRiskDashboard"
  element={
    <ClientSessionProvider>
      <DashboardAppLayout>
          <SupplierRiskDashboard />
      </DashboardAppLayout>
    </ClientSessionProvider>


  }
/>
<Route
  path="/monte"
  element={
    <ClientSessionProvider>
      <DashboardAppLayout>
          <MonteCarloDashboard />
      </DashboardAppLayout>
    </ClientSessionProvider>


  }
/>

<Route
  path="/TornadoChart"
  element={
    <ClientSessionProvider>
      <DashboardAppLayout>
          <TornadoChart />
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
