// src/Components/DivisionTabs.jsx
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import DivisionRecord from './DivisionRecord';
import DivisionForm from './DivisionForm';


function DivisionTabs() {
  const location = useLocation();

  return (
    <div className="container mt-4">
      <Routes>
        <Route path="record" element={<DivisionRecord />} />
        <Route path="create" element={<DivisionForm />} />
        
      </Routes>
    </div>
  );
}

export default DivisionTabs;
