import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PartyAccountRecord from './PartyAccountRecord';
import PartyAccountForm from './PartyAccountForm';

function PartyAccountTabs() {
  return (
    <div className="container mt-4">
<Routes>
  <Route index element={<PartyAccountRecord />} />
  <Route path="record" element={<PartyAccountRecord />} />
  <Route path="create" element={<PartyAccountForm />} />
  <Route path="edit/:id" element={<PartyAccountForm />} />
</Routes>

    </div>
  );
}

export default PartyAccountTabs;
