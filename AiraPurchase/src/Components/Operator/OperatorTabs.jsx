import React from 'react';
import { Routes, Route } from 'react-router-dom';
import OperatorRecord from './OperatorRecord';
import OperatorForm from './OperatorForm';

function OperatorTabs() {
  return (
    <Routes>
      <Route index element={<OperatorRecord />} />
      <Route path="record" element={<OperatorRecord />} />
      <Route path="create" element={<OperatorForm />} />
      <Route path="edit/:id" element={<OperatorForm />} />
    </Routes>
  );
}

export default OperatorTabs;
