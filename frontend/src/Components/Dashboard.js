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

  const handleProfilePicChange = async (e) => {
    const formData = new FormData();
    formData.append('profilePic', e.target.files[0]);

    try {
      await axios.post(`${BASE_URL}/api/users/update-profile-pic`, formData, {
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

  const closeModal = () => {
    setShowModal(false);
  };

  const refreshTransactions = async () => {
    await fetchData();
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
          <input type="file" onChange={handleProfilePicChange} />
        </div>

        <div className="action-buttons">
          <button onClick={() => handleAddClick('income')}>➕ Add Income</button>
          <button onClick={() => handleAddClick('expense')}>➖ Add Expense</button>
          <button onClick={() => setShowEMIModal(true)}>📈 EMI Calculator</button>
        </div>
      </div>

      {/* Income and Expense Summary */}
      <div className="summary-section">
        <div className="summary-card income-card">
          <h3>Total Income</h3>
          <p>₹{income}</p>
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

      {/* Date-wise Transactions */}
      <div className="chart-card">
        <h3>Date-wise Transaction Amount</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dateWiseData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="amount" fill="#2196f3" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Transactions */}
      <div className="transactions-section">
        <h3>Recent Transactions</h3>
        <ul className="transaction-list">
          {transactions.map((trx) => (
            <li key={trx._id} className="transaction-item">
              <span>
                {trx.date.split("T")[0]} - <b>{trx.type.toUpperCase()}</b>: ₹{trx.amount} ({trx.category})
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Logout Button */}
      <button className="logout-btn" onClick={handleLogout}>Sign Out</button>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AddTransaction
              token={token}
              type={transactionType}
              onClose={closeModal}
              onTransactionAdded={refreshTransactions}
            />
          </div>
        </div>
      )}

      {/* EMI Calculator Modal */}
      {showEMIModal && (
        <EMICalculatorModal onClose={() => setShowEMIModal(false)} />
      )}
    </div>
  );
}

export default Dashboard;
