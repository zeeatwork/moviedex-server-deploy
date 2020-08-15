require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const moviesdata = require('./movieData.js');

const app = express();

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';

app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());

app.get('/', (req, res) => {
  res.json({
    success:'page loaded'
  });
});

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

// eslint-disable-next-line quotes


app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }};
  } else {
    response = { error };
  }
  res.status(500).json(response);
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening at http://localhost:${PORT}`);
});
