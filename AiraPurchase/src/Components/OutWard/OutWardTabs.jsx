import React from 'react';
import { Routes, Route } from 'react-router-dom';
import OutWardRecord from './OutWardRecord';
import OutWardForm from './OutWardForm';

function OutWardTabs() {
  return (
    <Routes>
      <Route index element={<OutWardRecord />} />
      <Route path="record" element={<OutWardRecord />} />
      <Route path="create" element={<OutWardForm />} />
      <Route path="edit/:id" element={<OutWardForm />} />
    </Routes>
  );
}

export default OutWardTabs;
