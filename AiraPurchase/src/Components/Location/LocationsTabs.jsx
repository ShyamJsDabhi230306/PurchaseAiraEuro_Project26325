import { Routes, Route } from 'react-router-dom';
import LocationRecord from './LocationRecord';
import LocationForm from './LocationForm';

function LocationsTabs() {
  return (
    <Routes>
      <Route index element={<LocationRecord />} />
      <Route path="record" element={<LocationRecord />} />
      <Route path="create" element={<LocationForm />} />
      <Route path="edit/:id" element={<LocationForm />} />
    </Routes>
  );
}

export default LocationsTabs;
