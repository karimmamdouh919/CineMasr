import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

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
    required: [true, 'Password is required'],
    select: false
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
  assignedCinemaId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cinema',
    default: null 
  },
  birthDate: { 
    type: Date,
    required: [true, 'Birth date is required']
  },
  gender: { 
    type: String, 
    enum: ['male', 'female'],
    required: [true, 'Gender is required']
  }
}, {
  timestamps: true,
  versionKey: false
});

// Hash password before save
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;