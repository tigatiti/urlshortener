import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import crypto from "crypto";
import basex from 'base-x';
import ogUrl from '../models/shorten.js'
import auth from '../middleware/auth.js';

const base62 = basex(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
);  

const URL_LENGTH = 6;

const router = express.Router();  

//Regex for http(s)://
const regex = /^(http)[s]?(:\/\/)/;

//mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true });

console.log(mongoose.connection.readyState);

router.get('/user-urls', auth, async function(req, res) {
  try {
    const urls = await ogUrl.find({ userId: req.user.id }).exec();
    res.json(urls);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch URLs' });
  }
});


// When trying to visit short_url
router.get('/:shortUrl', async function(req, res, next) {
  let short = await ogUrl.findOne({ short_url: req.params.shortUrl }).exec();

  console.log(short);

  req.shorty = short.original_url;

  next();
}, function(req, res) {
  res.redirect(`${req.shorty}`);
});

router.delete('/:shortUrl', async function(req, res) {
  try {
    const result = await ogUrl.findOneAndDelete({ short_url: req.params.shortUrl });
    if (!result) {
      return res.status(404).json({ error: 'URL not found' });
    }
    res.status(200).json({ message: 'URL deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete URL' });
  }
});

// Converts url to short_url(Number) and returns json
router.post('/shorten', auth, async function(req, res) {
  try {
    if (!regex.test(req.body.url)) {
      return res.status(400).json({ error: 'invalid url' });
    }

    let currUrl = await ogUrl.findOne({ 
      original_url: req.body.url,
      userId: req.user.id 
    }).exec();

    if (currUrl != null) {
      return res.json({ 
        original_url: currUrl.original_url,
        short_url: currUrl.short_url 
      });
    }

    let shortHash = (base62.encode(crypto.createHash('sha256')
      .update(req.body.url)
      .digest())
      .slice(0, URL_LENGTH))
      .toString();

    const newUrl = await ogUrl.create({ 
      original_url: req.body.url, 
      short_url: shortHash,
      userId: req.user.id  // This will now be available from auth middleware
    });

    res.json({ 
      original_url: newUrl.original_url,
      short_url: newUrl.short_url 
    });
  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({ error: 'Failed to create short URL' });
  }
});


export default router;
