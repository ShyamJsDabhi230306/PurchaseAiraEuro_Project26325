// src/App.jsx
import { Routes, Route } from 'react-router-dom';;
import Login from './Components/Login';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Dashboard from './Components/Dashboard'; // This should render layout + nested routes like ItemMaster

function App() {
  return (
    <Routes>
      
      <Route path="/" element={<Login />} />

      {/* Dashboard route with nested routes inside */}
      <Route path="/dashboard/*" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
