import React, { useState } from 'react';
import './Login.css';

function Login({ setIsLoggedIn, userData }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (userData.username === username && userData.password === password) {
      setIsLoggedIn(true);
    } else {
      setError('Invalid username or password');
    }
  };

  const handleBattleNetLogin = () => {
    window.location.href = 'http://localhost:5000/auth/bnet';
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      {error && <p className="error-message">{error}</p>}

      <hr />
      {/* Battle.net login dugme */}
      <button onClick={handleBattleNetLogin} className="battlenet-login-button">
        Login with Battle.net
      </button>
    </div>
  );
}

export default Login;
