// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { DocumentViewPage } from "./pages/DocumentViewPage";
import AdminDocumentsPage from "./pages/AdminDocumentsPage";
import AdminDocumentViewPage from "./pages/AdminDocumentViewPage/AdminDocumentViewPage";
import AdminEmployeesPage from "./pages/AdminEmployeesPage";
import AdminEmployeeStatsPage from "./pages/AdminEmployeeStatsPage";
import CreateEmployeePage from "./pages/CreateEmployeePage";
import CreateDocumentPage from "./pages/CreateDocumentPage";
import EditDocumentPage from "./pages/EditDocumentPage";
import EmployeeDetailPage from "./pages/EmployeeDetailPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./styles/global.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/documents"
          element={
            <ProtectedRoute requiredRole="employee">
              <DocumentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/:id"
          element={
            <ProtectedRoute requiredRole="employee">
              <DocumentViewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/documents"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDocumentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/documents/create"
          element={
            <ProtectedRoute requiredRole="admin">
              <CreateDocumentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/documents/:id/edit"
          element={
            <ProtectedRoute requiredRole="admin">
              <EditDocumentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/documents/:id"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDocumentViewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employees"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminEmployeesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employees/create"
          element={
            <ProtectedRoute requiredRole="admin">
              <CreateEmployeePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employees/:id"
          element={
            <ProtectedRoute requiredRole="admin">
              <EmployeeDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/statistics"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminEmployeeStatsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
