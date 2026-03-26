import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ContractorForm from './ContractorForm';
import ContractorRecord from './ContractorRecord';

function ContractorTabs() {
  return (
    <Routes>
      <Route index element={<ContractorRecord />} />
      <Route path="record" element={<ContractorRecord />} />
      <Route path="create" element={<ContractorForm />} />
      <Route path="edit/:id" element={<ContractorForm />} />
    </Routes>
  );
}

export default ContractorTabs;
