import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="wow-header">
      <h1 className="forum-title">World of Warcraft Forum</h1>
      <nav className="wow-nav">
        <a href="#">Home</a>
        <a href="#">Topics</a>
        <a href="#">About</a>
      </nav>
    </header>
  );
}

export default Header;
