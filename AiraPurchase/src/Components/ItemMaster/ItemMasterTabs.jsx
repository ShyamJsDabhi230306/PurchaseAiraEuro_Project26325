import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ItemRecord from './ItemRecord';
import ItemForm from './ItemForm';

function ItemMasterTabs() {
  return (
   <Routes>
      {/* 👇 This renders ItemRecord at /dashboard/itemmaster */}
      <Route index element={<ItemRecord />} />
      <Route path="record" element={<ItemRecord />} />
      <Route path="create" element={<ItemForm />} />
      <Route path="edit/:id" element={<ItemForm />} />
    </Routes>
  );
}

export default ItemMasterTabs;
