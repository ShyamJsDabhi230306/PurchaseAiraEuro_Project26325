import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SecondInWardForm from './SecondInWardForm';
import SecondInWardRecord from './SecondInWardRecord';

function SecondInWardTabs() {
  return (
    <Routes>
      <Route index element={<SecondInWardRecord />} />
      <Route path="record" element={<SecondInWardRecord />} />
      <Route path="create" element={<SecondInWardForm />} />
      <Route path="edit/:id" element={<SecondInWardForm />} />
    </Routes>
  );
}

export default SecondInWardTabs;
