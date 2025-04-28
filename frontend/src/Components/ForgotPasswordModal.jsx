import { useState } from 'react';
import axios from 'axios';
import BASE_URL from '../config';
import './ModalStyles.css'; // 👈 common CSS

function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);

  const getSecurityQuestion = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/api/users/forgot-password`, { email });
      setSecurityQuestion(res.data.securityQuestion);
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  const resetPassword = async () => {
    try {
      await axios.post(`${BASE_URL}/api/users/reset-password`, {
        email,
        securityAnswer: answer,
        newPassword,
      });
      alert('Password changed successfully!');
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="add-transaction-container">
        <button className="close-btn" onClick={onClose}>×</button>

        <div className="form-card">
          {step === 1 ? (
            <>
              <h2>Forgot Password</h2>
              <input
                type="email"
                placeholder="Enter your Email*"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <div className="button-group">
                <button className="submit-btn" onClick={getSecurityQuestion}>Next</button>
                <button className="cancel-btn" onClick={onClose}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <h2>Answer Security Question</h2>
              <p style={{ marginBottom: '10px', textAlign: 'center', color: '#555' }}>
                {securityQuestion}
              </p>
              <input
                type="text"
                placeholder="Answer*"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
              />
              <input
                type="password"
                placeholder="New Password*"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <div className="button-group">
                <button className="submit-btn" onClick={resetPassword}>Reset Password</button>
                <button className="cancel-btn" onClick={onClose}>Cancel</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
