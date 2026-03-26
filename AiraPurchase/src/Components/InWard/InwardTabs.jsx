import React from 'react';
import { Routes, Route } from 'react-router-dom';
import InwardRecord from './InwardRecord';
import InwardForm from './InwardForm';

function InwardTabs() {
  return (
    <Routes>
      <Route index element={<InwardRecord />} />
      <Route path="record" element={<InwardRecord />} />
      <Route path="create" element={<InwardForm />} />
      <Route path="edit/:id" element={<InwardForm />} />
    </Routes>
  );
}

export default InwardTabs;
