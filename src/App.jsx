import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Forum from './components/Forum';
import ForumTopic from './components/ForumTopic';
import PostDetail from './components/PostDetail';
import Character from './components/Character';
//import GuildEvents from './components/GuildEvents';
import Footer from './components/Footer';
import Login from './components/Login';
import Signup from './components/Signup';
import { ForumProvider } from './components/ForumContext';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({});
  const [isBattleNetLogin, setIsBattleNetLogin] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsBattleNetLogin(false);
    setUserData({});
    localStorage.removeItem('token'); // Uklanjanje tokena pri odjavi
  };

  const handleBattleNetCallback = (battleNetUserData) => {
    setIsLoggedIn(true);
    setIsBattleNetLogin(true);
    setUserData(battleNetUserData);
    localStorage.setItem('token', battleNetUserData.token); // Spremanje tokena u localStorage
  };

  return (
    <ForumProvider>
      <Router>
        <QueryHandler onBattleNetCallback={handleBattleNetCallback} />
        <div className="app-container">
          <Header />
          <main className="forum-content">
            {!isLoggedIn ? (
              <div>
                <Login setIsLoggedIn={setIsLoggedIn} userData={userData} />
                <Signup setUserData={setUserData} />
                <hr />
                <button
                  onClick={() => handleBattleNetCallback({ username: 'BattleNetUser', id: '12345' })}
                  className="battlenet-login-button"
                >
                  Login with Battle.net
                </button>
              </div>
            ) : (
              <div>
                <p>
                  {isBattleNetLogin
                    ? `Welcome, Battle.net user: ${userData.username}`
                    : `Welcome, ${userData.username}`}
                </p>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/forum" element={<Forum />} />
                  <Route path="/forum/:id" element={<ForumTopic />} />
                  <Route path="/forum/:id/post/:postId" element={<PostDetail />} />
                  <Route path="/character" element={<Character token={userData.token} />} />
                </Routes>
              </div>
            )}
          </main>
          <Footer />
        </div>
      </Router>
    </ForumProvider>
  );
}

function QueryHandler({ onBattleNetCallback }) {
  const query = useQuery();
  const navigate = useNavigate();

  useEffect(() => {
    const token = query.get('token');
    const battletag = query.get('battletag');
    if (token && battletag) {
      onBattleNetCallback({ username: battletag, token });
      navigate('/home');
    }
  }, []); // Dodali smo prazan niz kao ovisnost

  return null;
}

export default App;