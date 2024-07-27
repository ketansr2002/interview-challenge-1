import axios from 'axios';
import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import Post from './Post';
import Container from '../common/Container';
import { useWindowWidth } from '../hooks/useWindowWidth';

const PostListContainer = styled.div(() => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
}));

const LoadMoreButton = styled.button(() => ({
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: 5,
  cursor: 'pointer',
  fontSize: 16,
  marginTop: 20,
  transition: 'background-color 0.3s ease',
  fontWeight: 600,

  '&:hover': {
    backgroundColor: '#0056b3',
  },
  '&:disabled': {
    backgroundColor: '#808080',
    cursor: 'default',
  },
}));

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  //states for maintaining pages and check if more posts are availab;e
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [users, setUsers] = useState([]);

  // Use the custom hook to get the isSmallerDevice value
  const { isSmallerDevice } = useWindowWidth();

  useEffect(() => {
    const fetchPosts = async (reset = false) => {
      setIsLoading(true);
      try {
        const { data: newPosts } = await axios.get('/api/v1/posts', {
          params: {
            start: reset ? 0 : page * (isSmallerDevice ? 5 : 10),
            limit: isSmallerDevice ? 5 : 10,
          },
        });

        const { data: users } = await axios.get('/api/v1/users');
        if (newPosts.length > 0) {
          setPosts(reset ? newPosts : [...posts, ...newPosts]);
          setPage(reset ? 1 : page + 1);
          setUsers(users);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts(true);
  }, [isSmallerDevice]);

  const handleClick = () => {
    const fetchMorePosts = async () => {
      try {
        const { data: morePosts } = await axios.get('/api/v1/posts', {
          params: {
            start: page * (isSmallerDevice ? 5 : 10),
            limit: isSmallerDevice ? 5 : 10,
          },
        });

        if (morePosts.length > 0) {
          setPosts([...posts, ...morePosts]);
          setPage(page + 1);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error('Error fetching more posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    fetchMorePosts();
  };

  return (
    <Container>
      <PostListContainer>
        {posts.map((post, index) => (
          <Post key={index} post={post} user={users[index]} />
        ))}
      </PostListContainer>

      {hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <LoadMoreButton onClick={handleClick} disabled={isLoading}>
            {!isLoading ? 'Load More' : 'Loading...'}
          </LoadMoreButton>
        </div>
      )}
    </Container>
  );
}
