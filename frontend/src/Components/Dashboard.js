import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../config";
import AddTransaction from "./AddTransaction";
import EMICalculatorModal from "./EMICalculatorModal";
import "./Dashboard.css";

function Dashboard({ token }) {
  const [user, setUser] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [transactionType, setTransactionType] = useState('income');
  const [showEMIModal, setShowEMIModal] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const userRes = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(userRes.data);

      const trxRes = await axios.get(`${BASE_URL}/api/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(trxRes.data);

      const inc = trxRes.data.filter(t => t.type === "income").reduce((acc, cur) => acc + cur.amount, 0);
      const exp = trxRes.data.filter(t => t.type === "expense").reduce((acc, cur) => acc + cur.amount, 0);
      setIncome(inc);
      setExpense(exp);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useState(() => {
    fetchData();
  }, [token]);

  const handleProfilePicChange = async (e) => {
    const formData = new FormData();
    formData.append('profilePic', e.target.files[0]);

    try {
      const res = await axios.post(`${BASE_URL}/api/users/update-profile-pic`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert('Profile picture updated!');
      fetchData();
    } catch (err) {
      console.error('Error updating profile pic:', err.response?.data || err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleAddClick = (type) => {
    setTransactionType(type);
    setShowModal(true);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="user-info">
          {user.profilePic && (
            <img className="profile-pic" src={user.profilePic} alt="Profile" />
          )}
          <h1>Welcome, {user.name}</h1>
          <input type="file" onChange={handleProfilePicChange} />
        </div>

        <div className="action-buttons">
          <button onClick={() => handleAddClick('income')}>➕ Add Income</button>
          <button onClick={() => handleAddClick('expense')}>➖ Add Expense</button>
          <button onClick={() => setShowEMIModal(true)}>📈 EMI Calculator</button>
        </div>
      </div>

      {/* Show Modals */}
      {showModal && (
        <AddTransaction
          token={token}
          type={transactionType}
          onClose={() => setShowModal(false)}
          onTransactionAdded={fetchData}
        />
      )}

      {showEMIModal && (
        <EMICalculatorModal onClose={() => setShowEMIModal(false)} />
      )}

      {/* Logout */}
      <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
    </div>
  );
}

export default Dashboard;
