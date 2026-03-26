import { Routes, Route } from 'react-router-dom';
import DepartmentRecord from './DepartmentRecord';
import DepartmentForm from './DepartmentForm';

function DepartmentTabs() {
  return (
    <Routes>
      <Route index element={<DepartmentRecord />} />
      <Route path="record" element={<DepartmentRecord />} />
      <Route path="create" element={<DepartmentForm />} />
      <Route path="edit/:id" element={<DepartmentForm />} />
    </Routes>
  );
}

export default DepartmentTabs;
