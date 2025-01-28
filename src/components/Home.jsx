import React from "react";
import { Link } from "react-router-dom";

function Home() {
  const topics = [
    { id: 1, title: 'Forum', description: 'Forum for connecting with people from all over the world.', link: '/forum' },
    { id: 2, title: 'Character', description: 'See your characters items and stats (Bnet login required).', link: '/character' },
    { id: 3, title: 'Auction House', description: 'Access the auction house to view current listings (Bnet login required).', link: '/auctionhouse' },
  ];

  return (
    <section className="forum-section">
      {topics.map((topic) => (
        <div key={topic.id} className="forum-topic">
          <h2 className="topic-title">
            <Link to={topic.link}>{topic.title}</Link>
          </h2>
          <p className="topic-description">{topic.description}</p>
        </div>
      ))}
    </section>
  );
}

export default Home;