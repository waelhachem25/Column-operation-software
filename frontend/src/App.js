import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthorPage from "./pages/AuthorPage";
import StudentPage from "./pages/StudentPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/author" replace />} />
        <Route path="/author" element={<AuthorPage />} />
        <Route path="/student/:templateId" element={<StudentPage />} />
        <Route path="/student" element={<Navigate to="/author" replace />} />
        <Route path="*" element={<Navigate to="/author" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
