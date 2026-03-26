import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserRecord from './UserRecord';
import UserForm from './UserForm';

function UsersTabs() {
  return (
    <Routes>
      <Route index element={<UserRecord />} />
      <Route path="record" element={<UserRecord />} />
      <Route path="create" element={<UserForm />} />
      <Route path="edit/:id" element={<UserForm />} />
    </Routes>
  );
}

export default UsersTabs;
