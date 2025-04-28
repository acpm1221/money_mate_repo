import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../config";
import AddTransaction from "./AddTransaction";
import EMICalculatorModal from "./EMICalculatorModal";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import "./Dashboard.css";

function Dashboard({ token }) {
  const [user, setUser] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [transactionType, setTransactionType] = useState('income');
  const [showEMIModal, setShowEMIModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [token]);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleAddClick = (type) => {
    setTransactionType(type);
    setShowModal(true);
    setMenuOpen(false); // Close menu after action
  };

  const handleProfileUpdate = async () => {
    if (!profilePicFile) {
      alert("Please select a file first!");
      return;
    }
    const formData = new FormData();
    formData.append('profilePic', profilePicFile);

    try {
      await axios.post(`${BASE_URL}/api/users/update-profile-pic`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert('Profile picture updated!');
      setShowProfileModal(false);
      fetchData();
    } catch (err) {
      console.error('Error updating profile pic:', err.response?.data || err.message);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Transaction deleted!");
      fetchData();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const chartData = [{ name: "Total", income, expense }];
  const pieData = [
    { name: "Income", value: income },
    { name: "Expense", value: expense },
  ];
  const pieColors = ["#4caf50", "#f44336"];

  const dateWiseData = transactions.map((t) => ({
    date: t.date.split("T")[0],
    amount: t.amount,
    type: t.type,
  }));

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="user-info">
          {user.profilePic && (
            <img className="profile-pic" src={user.profilePic} alt="Profile" />
          )}
          <h1>Welcome, {user.name}</h1>
        </div>

        {/* Hamburger for mobile */}
        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>

        {/* Action Buttons (Desktop View) */}
        <div className="action-buttons desktop-buttons">
          <button className="income-btn btn" onClick={() => handleAddClick('income')}>➕ Add Income</button>
          <button className="expense-btn btn" onClick={() => handleAddClick('expense')}>➖ Add Expense</button>
          <button className="btn" onClick={() => setShowEMIModal(true)}>📈 EMI Calculator</button>
          <button className="btn" onClick={() => setShowProfileModal(true)}>🖼 Change Profile Pic</button>
          <button className="btn" onClick={() => setShowTransactionsModal(true)}>📜 Show All Transactions</button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <button className="income-btn btn" onClick={() => handleAddClick('income')}>➕ Add Income</button>
          <button className="expense-btn btn" onClick={() => handleAddClick('expense')}>➖ Add Expense</button>
          <button className="btn" onClick={() => { setShowEMIModal(true); setMenuOpen(false); }}>📈 EMI Calculator</button>
          <button className="btn" onClick={() => { setShowProfileModal(true); setMenuOpen(false); }}>🖼 Change Profile Pic</button>
          <button className="btn" onClick={() => { setShowTransactionsModal(true); setMenuOpen(false); }}>📜 Show All Transactions</button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="summary-section">
        <div className="summary-card income-card">
          <h3>Total Income</h3>
          <p>₹{income-expense}</p>
        </div>
        <div className="summary-card expense-card">
          <h3>Total Expense</h3>
          <p>₹{expense}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Total Income vs Expense</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#4caf50" />
              <Bar dataKey="expense" fill="#f44336" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Transaction Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Logout */}
      <div className="logout-section">
        <button className="logout-btn btn" onClick={handleLogout}>🚪 Sign Out</button>
      </div>

      {/* Modals */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AddTransaction
              token={token}
              type={transactionType}
              onClose={() => setShowModal(false)}
              onTransactionAdded={fetchData}
            />
          </div>
        </div>
      )}

      {showEMIModal && (
        <EMICalculatorModal onClose={() => setShowEMIModal(false)} />
      )}

      {/* Profile Pic Modal */}
      {showProfileModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Change Profile Picture</h2>
            <input type="file" onChange={(e) => setProfilePicFile(e.target.files[0])} />
            <button className="btn" onClick={handleProfileUpdate}>Update</button>
            <button className="btn logout-btn" onClick={() => setShowProfileModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Transactions Modal */}
      {showTransactionsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>All Transactions</h2>
            <ul className="transaction-list">
              {transactions.map(trx => (
                <li key={trx._id} className="transaction-item">
                  {trx.date.split("T")[0]} - {trx.type.toUpperCase()} ₹{trx.amount} ({trx.category})
                  <button className="delete-btn" onClick={() => deleteTransaction(trx._id)}>🗑</button>
                </li>
              ))}
            </ul>
            <button className="btn logout-btn" onClick={() => setShowTransactionsModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
