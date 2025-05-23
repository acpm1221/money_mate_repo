import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../config';
import "./Signup.css";

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: 'error', text: "Please enter valid email ID" });
      return;
    }

    if (!agreed) {
      setMessage({ type: 'error', text: "You must agree to the terms and conditions." });
      return;
    }

    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    const numberRegex = /\d/;
    if (!specialCharRegex.test(password) || !numberRegex.test(password)) {
      setMessage({ type: 'error', text: "Password must contain at least one special character and one number." });
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('securityQuestion', securityQuestion);
    formData.append('securityAnswer', securityAnswer);
    if (profilePic) formData.append('profilePic', profilePic);

    try {
      await axios.post(`${BASE_URL}/api/users/signup`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ type: 'success', text: 'Signup successful! Redirecting to login...' });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || "Signup failed" });
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-left">
        <h1>MoneyMate<br />Join Us Today</h1>
      </div>

      <div className="signup-right">
        <h2>Sign up</h2>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="Security Question"
          value={securityQuestion}
          onChange={e => setSecurityQuestion(e.target.value)}
        />
        <input
          type="text"
          placeholder="Security Answer"
          value={securityAnswer}
          onChange={e => setSecurityAnswer(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={e => setProfilePic(e.target.files[0])}
        />

        <div className="agree-terms">
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            id="terms"
          />
          <label htmlFor="terms">I agree to the <Link to="/terms" target="_blank">Terms & Conditions</Link></label>
        </div>

        {message && (
          <p className={message.type === 'error' ? 'error' : 'success'}>
            {message.text}
          </p>
        )}

        <button onClick={handleSignup} disabled={!agreed}>Sign up now</button>

        <p className="login-text">
          Already have an account? <Link to="/login" className="login-link">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
