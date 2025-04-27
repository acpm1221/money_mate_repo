import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../config';
import "./Login.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter valid email ID");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/api/users/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      onLogin(res.data.token);
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.error || "Login failed";
      setError(message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <h1>MoneyMate<br />Because Every Penny Counts.</h1>
        <p>Login and start tracking your expenses smarter and faster.</p>
      </div>

      <div className="login-right">
        <h2>Sign in</h2>
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
        {error && <p className="error">{error}</p>}

        <button onClick={handleLogin}>Sign in now</button>

        <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>

        <p className="signup-text">
          New user? <Link to="/signup" className="signup-link">Sign up here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
