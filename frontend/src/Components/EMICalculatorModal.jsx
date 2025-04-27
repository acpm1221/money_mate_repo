import { useState } from 'react';


function EMICalculatorModal({ onClose }) {
  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [years, setYears] = useState('');
  const [emi, setEmi] = useState(null);

  const calculateEMI = () => {
    const P = parseFloat(amount);
    const R = parseFloat(interestRate) / 12 / 100;
    const N = parseFloat(years) * 12;
    const emiCalc = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    setEmi(emiCalc.toFixed(2));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>EMI Calculator</h2>
        <input type="number" placeholder="Loan Amount" value={amount} onChange={e => setAmount(e.target.value)} />
        <input type="number" placeholder="Annual Interest Rate (%)" value={interestRate} onChange={e => setInterestRate(e.target.value)} />
        <input type="number" placeholder="Loan Term (Years)" value={years} onChange={e => setYears(e.target.value)} />
        <button onClick={calculateEMI}>Calculate EMI</button>
        {emi && <h3>Monthly EMI: ₹{emi}</h3>}
        <button onClick={onClose} className="close-btn">X</button>
      </div>
    </div>
  );
}

export default EMICalculatorModal;
