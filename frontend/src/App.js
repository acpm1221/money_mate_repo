import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Components/Login';
import Signup from './Components/Signup';
import Dashboard from './Components/Dashboard';
import Terms from './Components/Terms';
import AddTransaction from './Components/AddTransaction';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        closeOnClick 
        draggable 
        pauseOnHover 
        theme="colored"
      />
      <Routes>
        <Route path="/" element={<Login onLogin={() => window.location.href = '/dashboard'} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={token ? <Dashboard token={token} /> : <Navigate to="/" />} />
        <Route path="/add/:type" element={token ? <AddTransaction token={token} /> : <Navigate to="/" />} />
        <Route path="/terms" element={<Terms />} />
        {/* Redirect any unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
