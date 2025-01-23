import React, { useState, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import ForumContext from './ForumContext';
import "./Forum.css"

function ForumTopic() {
  const { id } = useParams();
  const { topics, addPost } = useContext(ForumContext);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  const topic = topics[id];

  if (!topic) {
    return <div>Topic not found</div>;
  }

  const handleSubmitPost = () => {
    const newPost = {
      id: topic.posts.length + 1,
      title: newPostTitle,
      content: newPostContent,
    };
    addPost(id, newPost);
    setNewPostTitle('');
    setNewPostContent('');
  };

  return (
    <section className="forum-topic-section">
      <h1>{topic.title}</h1>
      <p>{topic.description}</p>
      <div className="add-post">
        <input 
          type="text" 
          placeholder="Post Title" 
          value={newPostTitle} 
          onChange={(e) => setNewPostTitle(e.target.value)} 
        />
        <textarea 
          placeholder="Write your post here..." 
          value={newPostContent} 
          onChange={(e) => setNewPostContent(e.target.value)} 
        />
        <button onClick={handleSubmitPost}>Add Post</button>
      </div>
      <ul>
        {topic.posts.map((post) => (
          <li key={post.id}>
            <h2>
              <Link to={`/forum/${id}/post/${post.id}`}>{post.title}</Link>
            </h2>
            <p>{post.content}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ForumTopic;
