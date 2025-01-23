import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import ForumContext from './ForumContext';

function PostDetail() {
  const { topicId, postId } = useParams();
  const { topics, addReply } = useContext(ForumContext);
  const [newReply, setNewReply] = useState('');

  const topic = topics[topicId];

  if (!topic) {
    return <div>Topic not found</div>;
  }

  const post = topic.posts.find(post => post.id === parseInt(postId, 10));

  if (!post) {
    return <div>Post not found</div>;
  }

  const handleSubmitReply = () => {
    addReply(topicId, post.id, newReply);
    setNewReply('');
  };

  return (
    <section className="post-detail-section">
      <h1>{topic.title}</h1>
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      <div className="add-reply">
        <textarea 
          placeholder="Write your reply here..." 
          value={newReply} 
          onChange={(e) => setNewReply(e.target.value)} 
        />
        <button onClick={handleSubmitReply}>Add Reply</button>
      </div>
      <ul>
        {post.replies && post.replies.map((reply, index) => (
          <li key={index}>{reply}</li>
        ))}
      </ul>
    </section>
  );
}

export default PostDetail;
