const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  first_name: { 
    type: String, 
    required: [true, 'First name is required'],
    trim: true 
  },
  last_name: { 
    type: String, 
    required: [true, 'Last name is required'],
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    lowercase: true,
    trim: true 
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'] 
  },
  phone: { 
    type: String, 
    trim: true 
  },
  role: { 
    type: String, 
    enum: ['user', 'cinema_manager', 'admin'], 
    default: 'user' 
  },
  // If role is 'cinema_manager', scope them to a specific branch
  assignedCinemaId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cinema',
    default: null 
  },
  birthDate: { 
    type: Date,
    required: [true, 'Birth date is required for age verification']
  },
  gender: { 
    type: String, 
    enum: ['male', 'female'],
    required: [true, 'Gender is rerquired']
  }
}, 
{
  timestamps: true,
  versionKey: false
});

export const userModel = mongoose.model('User', userSchema);
