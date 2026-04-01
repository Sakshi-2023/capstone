import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import BulkImport from "./pages/BulkImport";
import Forms from "./pages/Forms";
import FormFill from "./pages/FormFill";
import GenAdminForm from "./forms/genadmin/GenAdminForm";  // self declaration form 
import VehicleRequisitionForTransportForm from "./forms/genadmin/VehicleRequisitionForTransportForm";
import SecurityCampusLeavePermissionForFemaleStudents from "./forms/security/SecurityCampusLeavePermissionForFemaleStudents";
import SecurityRequisitionForVehicleSticker from "./forms/security/SecurityRequisitionForVehicleSticker";
import SecurityVehicleStickerRequitionForMarriedScholar from "./forms/security/SecurityVehicleStickerRequitionForMarriedScholar";
import SecurityUndertakingRegardingWorkerConductAndResponsibility from "./forms/security/SecurityUndertakingRegardingWorkerConductAndResponsibility";
import ComputerCenterLdapAccountRequestForm from "./forms/cc/ComputerCenterLdapAccountRequestForm";
import EstbDepartureRejoiningReportForm from "./forms/estb/EstbDepartureRejoiningReportForm";import Submissions from "./pages/Submissions";
import ComputerCenterFacultyPerformaForm from "./forms/cc/ComputerCenterFacultyPerformaForm";
import ComputerCenterFacultyDeclarationForm from "./forms/cc/ComputerCenterFacultyDeclarationForm";
import ComputerCenterEmailAccountRequestForm from "./forms/cc/ComputerCenterEmailAccountRequestForm";
import ComputerCenterProxyLdapAccountRequestForm from "./forms/cc/ComputerCenterProxyLdapAccountRequestForm";
import FinanceProcurementRecommendationSanctionForm from "./forms/fin/RecommendationCumSanctionSheetForPurchaseDoubleBidInrForm";
import Submissions from "./pages/Submissions";
import Approvals from "./pages/Approvals";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
import AuthLayout from "./components/AuthLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthLayout title="Sign In" subtitle="Enter your credentials to access the portal"><Login /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout title="Create Account" subtitle="Register for the Faculty & Staff Portal"><Register /></AuthLayout>} />
        <Route path="/forgot-password" element={<AuthLayout title="Forgot Password" subtitle="We'll send a reset link to your registered email"><ForgotPassword /></AuthLayout>} />
        <Route path="/reset/:token" element={<AuthLayout title="Reset Password" subtitle="Enter your new password"><ResetPassword /></AuthLayout>} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/bulk-import"
          element={
            <PrivateRoute>
              <Layout>
                <BulkImport />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/forms"
          element={
            <PrivateRoute>
              <Layout>
                <Forms />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/forms/general-administration-self-declaration"
          element={
            <PrivateRoute>
              <Layout>
                <GenAdminForm />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/forms/gen-admin"
          element={
            <PrivateRoute>
              <Layout>
                <GenAdminForm />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/forms/gen-admin-vehicle-requisition-transport"
          element={
            <PrivateRoute>
              <Layout>
                <VehicleRequisitionForTransportForm />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/forms/security-campus-leave-female"
          element={
            <PrivateRoute>
              <Layout>
                <SecurityCampusLeavePermissionForFemaleStudents />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/forms/security_requisition_for_vehicle_sticker"
          element={
            <PrivateRoute>
              <Layout>
                <SecurityRequisitionForVehicleSticker />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/forms/security-vehicle-sticker-requition-for-married-scholar"
          element={
            <PrivateRoute>
              <Layout>
                <SecurityVehicleStickerRequitionForMarriedScholar />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/forms/security_undertaking_regarding_worker_conduct_and_responsibility"
          element={
            <PrivateRoute>
              <Layout>
                <SecurityUndertakingRegardingWorkerConductAndResponsibility />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/forms/cc-ldap-account-request"
          element={
            <PrivateRoute>
              <Layout>
                <ComputerCenterLdapAccountRequestForm />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/forms/finance-procurement-recommendation-sanction-double-bid-inr"
          element={
            <PrivateRoute>
              <Layout>
                <FinanceProcurementRecommendationSanctionForm />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/forms/computer_center_for_requesting_ldap_account_creation_of_project_staff__temporary_staff_1733997767"
          element={
            <PrivateRoute>
              <Layout>
                <ComputerCenterLdapAccountRequestForm />
              </Layout>
            </PrivateRoute>
          }
        />
       <Route
  path="/forms/estb-departure-rejoining-report"
  element={
    <PrivateRoute>
      <Layout>
        <EstbDepartureRejoiningReportForm />
      </Layout>
    </PrivateRoute>
  }
/>
        <Route
          path="/forms/cc-faculty-performa"
          element={
            <PrivateRoute>
              <Layout>
                <ComputerCenterFacultyPerformaForm />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/forms/cc-faculty-declaration"
          element={
            <PrivateRoute>
              <Layout>
                <ComputerCenterFacultyDeclarationForm />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/forms/cc-email-account-request"
          element={
            <PrivateRoute>
              <Layout>
                <ComputerCenterEmailAccountRequestForm />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/forms/cc-proxy-ldap-request"
          element={
            <PrivateRoute>
              <Layout>
                <ComputerCenterProxyLdapAccountRequestForm />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/forms/:templateId/fill"
          element={
            <PrivateRoute>
              <Layout>
                <FormFill />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/submissions"
          element={
            <PrivateRoute>
              <Layout>
                <Submissions />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/approvals"
          element={
            <PrivateRoute>
              <Layout>
                <Approvals />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;