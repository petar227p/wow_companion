import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import ForumContext from './ForumContext';
import "./Forum.css"

function Forum() {
  const { topics } = useContext(ForumContext);

  return (
    <section className="forum-section">
      <h1>Forum</h1>
      {Object.keys(topics).map(topicId => (
        <div key={topicId} className="forum-topic">
          <h2 className="topic-title">
            <Link to={`/forum/${topicId}`}>{topics[topicId].title}</Link>
          </h2>
          <p className="topic-description">{topics[topicId].description}</p>
        </div>
      ))}
    </section>
  );
}

export default Forum;
