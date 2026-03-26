import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CompanyRecord from './CompanyRecord';
import CompanyForm from './CompanyForm';

function CompanyMasterTabs() {
  return (
    <Routes>
      <Route index element={<CompanyRecord />} />
      <Route path="record" element={<CompanyRecord />} />
      <Route path="create" element={<CompanyForm />} />
      <Route path="edit/:id" element={<CompanyForm />} />
    </Routes>
  );
}

export default CompanyMasterTabs;
