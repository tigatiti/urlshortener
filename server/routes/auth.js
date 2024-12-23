import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import dotenv from 'dotenv';

dotenv.config({path: '../.env'});
const router = express.Router();


router.post('/register', async (req, res) => {
  try {
    const user = await User.create(req.body);
    console.log(user);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    console.log(token);
    res.status(201).json({ token, user: { id: user._id, email: user.email } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  console.log(user);
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  console.log(token);
  res.json({ token, user: { id: user._id, email: user.email } });
});

router.delete('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        return res.status(400).json({ error: 'Unable to log out' });
      }
      res.clearCookie('token');
      res.json({ message: 'Logout successful' });
    });
  } else {
    res.status(200).json({ message: 'Already logged out' });
  }
});

export default router;