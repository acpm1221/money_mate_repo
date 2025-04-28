import { useState } from 'react';
import './ModalStyles.css'; // 👈 new common CSS

function EMICalculatorModal({ onClose }) {
  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [years, setYears] = useState('');
  const [emi, setEmi] = useState(null);

  const calculateEMI = () => {
    const P = parseFloat(amount);
    const R = parseFloat(interestRate) / 12 / 100;
    const N = parseFloat(years) * 12;
    if (!P || !R || !N) return;
    const emiCalc = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    setEmi(emiCalc.toFixed(2));
  };

  return (
    <div className="modal-overlay">
      <div className="add-transaction-container">
        <button className="close-btn" onClick={onClose}>×</button>

        <div className="form-card">
          <h2>MoneyMate<br />EMI Calculator</h2>

          <input
            type="number"
            placeholder="Loan Amount*"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          <input
            type="number"
            placeholder="Annual Interest Rate (%)*"
            value={interestRate}
            onChange={e => setInterestRate(e.target.value)}
          />
          <input
            type="number"
            placeholder="Loan Term (Years)*"
            value={years}
            onChange={e => setYears(e.target.value)}
          />

          {emi && <h3 style={{ textAlign: 'center', margin: '10px 0' }}>Monthly EMI: ₹{emi}</h3>}

          <div className="button-group">
            <button className="submit-btn" onClick={calculateEMI}>Calculate</button>
            <button className="cancel-btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EMICalculatorModal;
