const express = require('express');
const axios = require('axios');
const { fetchPosts } = require('./posts.service');
const { fetchUserById } = require('../users/users.service');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const posts = await fetchPosts();

    const postsWithImagesPromises = posts.map(async post => {
      // Fetch photos for each album associated with the post
      const response = await axios.get(
        `https://jsonplaceholder.typicode.com/albums/${post.id}/photos`,
      );
      const images = response.data.map(photo => ({ url: photo.url }));
      return {
        ...post,
        images,
      };
    });

    // Resolve all promises to get the final array of posts with images
    const postsWithImages = await Promise.all(postsWithImagesPromises);

    res.json(postsWithImages);
  } catch (error) {
    console.error('Error fetching posts or images:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
