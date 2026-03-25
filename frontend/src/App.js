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