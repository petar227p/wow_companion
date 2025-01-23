import React, { useState } from 'react';
import './Signup.css';

function Signup({ setUserData }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = () => {
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    const newUserData = { username, password };
    setUserData(newUserData); // Pass to parent
    setMessage('Signup successful! You can now log in.');
  };





  return (
    <div className="signup-container">
      <h2>Signup</h2>
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
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button onClick={handleSignup}>Signup</button>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default Signup;