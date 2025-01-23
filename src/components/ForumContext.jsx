// src/components/ForumContext.jsx
import React, { createContext, useState } from 'react';

const ForumContext = createContext();

export const ForumProvider = ({ children }) => {
  const [topics, setTopics] = useState({
    1: { id: 1, title: 'General Discussion', description: 'Talk about anything and everything related to World of Warcraft.', posts: [] },
    2: { id: 2, title: 'Guides and Tips', description: 'Share and find guides and tips for playing World of Warcraft.', posts: [] },
    3: { id: 3, title: 'Guild Recruitment', description: 'Looking for a guild or members? Post here.', posts: [] },
  });

  const addPost = (topicId, newPost) => {
    setTopics(prevTopics => {
      const updatedTopics = { ...prevTopics };
      updatedTopics[topicId].posts.push(newPost);
      return updatedTopics;
    });
  };

  const addReply = (topicId, postId, reply) => {
    setTopics(prevTopics => {
      const updatedTopics = { ...prevTopics };
      const postIndex = updatedTopics[topicId].posts.findIndex(post => post.id === postId);
      if (postIndex > -1) {
        const post = updatedTopics[topicId].posts[postIndex];
        if (!post.replies) {
          post.replies = [];
        }
        post.replies.push(reply);
      }
      return updatedTopics;
    });
  };

  return (
    <ForumContext.Provider value={{ topics, addPost, addReply }}>
      {children}
    </ForumContext.Provider>
  );
};

export default ForumContext;
