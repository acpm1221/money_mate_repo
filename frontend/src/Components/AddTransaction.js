import { useState } from 'react';
import axios from 'axios';
import './AddTransaction.css';
import BASE_URL from "../config"; 
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AddTransaction({ token, type, onClose, onTransactionAdded }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = async () => {
    if (!title || !category || !amount || !date) {
      toast.error('Please fill all required fields!');
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/api/transactions`, {
        title,
        type,
        category,
        description,
        date,
        amount: parseFloat(amount),
      }, {
        headers: {
          Authorization: `Bearer ${token}`,  // ✅ Token is necessary
          "Content-Type": "application/json"
        }
      });

      if (response.status === 201 || response.status === 200) {
        toast.success('Transaction added successfully!');
        onTransactionAdded(); // Refresh dashboard
        onClose(); // Close modal
      } else {
        toast.error('Unexpected response from server.');
      }
    } catch (err) {
      console.error('Transaction Error:', err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Error adding transaction");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="add-transaction-container">
        <button className="close-btn" onClick={onClose}>×</button>

        <div className="form-card">
          <h2>MoneyMate<br />Add {type.charAt(0).toUpperCase() + type.slice(1)}</h2>

          <input
            type="text"
            placeholder="Title*"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Category*"
            value={category}
            onChange={e => setCategory(e.target.value)}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows="3"
          />
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount*"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />

          <div className="button-group">
            <button className="submit-btn" onClick={handleSubmit}>Submit</button>
            <button className="cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddTransaction;
