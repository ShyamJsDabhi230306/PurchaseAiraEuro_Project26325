import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserRightsRecord from './UserRightsRecord';
import UserRightsForm from './UserRightsForm';
import PagePermissionsUI from './PagePermissionsUI';

function UserRightsTabs() {
  return (
    <Routes>
      <Route index element={<Navigate to="record" replace />} />
      <Route path="record" element={<UserRightsRecord />} />
      <Route path="create" element={<UserRightsForm />} />
      <Route path="edit/:id" element={<UserRightsForm />} />
      <Route path="pagepermissions" element={<PagePermissionsUI />} />
    </Routes>
  );
}

export default UserRightsTabs;
