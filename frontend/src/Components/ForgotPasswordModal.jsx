import { useState } from 'react';
import axios from 'axios';
import BASE_URL from '../config';
import './Modal.css';

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
      <div className="modal-content">
        {step === 1 ? (
          <>
            <h2>Forgot Password</h2>
            <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} />
            <button onClick={getSecurityQuestion}>Next</button>
          </>
        ) : (
          <>
            <h2>Answer Security Question</h2>
            <p>{securityQuestion}</p>
            <input type="text" placeholder="Answer" value={answer} onChange={e => setAnswer(e.target.value)} />
            <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <button onClick={resetPassword}>Reset Password</button>
          </>
        )}
        <button onClick={onClose} className="close-btn">X</button>
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
