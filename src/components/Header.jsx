import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="wow-header">
      <h1 className="forum-title">World of Warcraft Forum</h1>
      <nav className="wow-nav">
        <Link to="/">Home</Link>
        <Link to="/forum">Forum</Link>
        <Link to="/character">Character</Link>
      </nav>
    </header>
  );
}

export default Header;