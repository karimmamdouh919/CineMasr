import User from '../../db/models/user.model.js';
import jwt from 'jsonwebtoken';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '90d'
  });
};

export const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone, birthDate, gender } = req.body;
     if (!first_name || !last_name || !email || !password || !birthDate || !gender) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const newUser = await User.create({ first_name, last_name, email, password, phone, birthDate, gender });
    const token = signToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: newUser._id,
          name: `${newUser.first_name} ${newUser.last_name}`,
          email: newUser.email,
          role: newUser.role
        }
      }
    });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};