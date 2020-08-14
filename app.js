require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const moviesdata = require('./movieData.js');

const app = express();

app.use(morgan('common'));
app.use(helmet());
app.use(cors());

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const bearerToken = req.get('Authorization');
  if (!bearerToken || bearerToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'unauthorized request' });
  }
  next();
});

app.get('/movie', (req, res) => {
  let filteredMovies = [...moviesdata];
  const { genre, country, avg_vote } = req.query;
  //do a bunch of stuff
  if (genre) {
    filteredMovies = filteredMovies.filter((movie) => {
      return movie.genre.toLowerCase().includes(genre.toLowerCase());
    });
  }
  if (country) {
    filteredMovies = filteredMovies.filter((movie) => {
      return movie.country.toLowerCase().includes(country.toLowerCase());
    });
  }
  if (avg_vote) {
    const floatVote = parseFloat(avg_vote);
    if (Number.isNaN(floatVote)) {
      res.status(400).send('avg_vote must be a number');
    }
    filteredMovies = filteredMovies.filter((movie) => {
      return parseFloat(movie.avg_vote) >= floatVote;
    });
  }

  res.json(filteredMovies);
});

app.listen(8000, () => {
  console.log('server start at port 8000');
});
