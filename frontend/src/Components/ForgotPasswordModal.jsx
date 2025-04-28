import { useState } from 'react';
import axios from 'axios';
import BASE_URL from '../config';
import './ModalStyles.css';

function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = email, 2 = security question, 3 = new password
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/users/forgot-password`, { email });
      setSecurityQuestion(res.data.securityQuestion);
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.error || 'Error fetching security question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityAnswerSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Verify the answer first
      await axios.post(`${BASE_URL}/api/users/verify-security-answer`, {
        email,
        answer
      });
      setStep(3); // Only proceed to password reset if answer is correct
    } catch (err) {
      alert(err.response?.data?.error || 'Incorrect security answer');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/users/reset-password`, {
        email,
        newPassword,
        securityAnswer: answer // Include answer again for final verification
      });
      alert('Password has been reset successfully!');
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || 'Error resetting password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="forgot-password-container">
        
        
        <div className="modal-header">
          <h2 className="modal-title">MoneyMate</h2>
          
        </div>

        {step === 1 && (
          <form className="forgot-password-form" onSubmit={handleEmailSubmit}>
            <h3>Forgot Password</h3>
            <input
              type="email"
              placeholder="Enter your Email*"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <div className="button-group">
              <button type="submit" className="primary-btn" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Next'}
              </button>
              <button type="button" className="secondary-btn" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form className="forgot-password-form" onSubmit={handleSecurityAnswerSubmit}>
            <h3>Security Verification</h3>
            <div className="security-question">
              <p><strong>Your Security Question:</strong></p>
              <p>{securityQuestion}</p>
            </div>
            <input
              type="text"
              placeholder="Your Answer*"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
            />
            
            <div className="button-group">
              <button type="submit" className="primary-btn" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Continue'}
              </button>
              <button type="button" className="secondary-btn" onClick={() => setStep(1)}>
                Back
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form className="forgot-password-form" onSubmit={handlePasswordReset}>
            <h3>Reset Your Password</h3>
            <input
              type="password"
              placeholder="New Password*"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength="6"
            />
            <input
              type="password"
              placeholder="Confirm New Password*"
              required
              minLength="6"
            />
            
            <div className="button-group">
              <button type="submit" className="primary-btn" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
              <button type="button" className="secondary-btn" onClick={() => setStep(2)}>
                Back
              </button>
            </div>
          </form>
        )}

        
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
