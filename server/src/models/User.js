import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      match: [/^[0-9]{10}$/, 'Phone number must be 10 digits'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      match: [/^[0-9]{6}$/, 'Pincode must be 6 digits'],
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      trim: true,
    },
    profilePicture: {
      type: String,
      default: '',
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'farmer'],
      default: 'farmer',
    },
    pin: {
      type: String,
      required: [true, 'PIN is required'],
      select: false, // Don't return pin by default
      validate: {
        validator: function(v) {
          // Only validate length if the PIN is not already hashed
          // Bcrypt hashes are 60 characters long and start with $2a$ or $2b$
          if (v.startsWith('$2a$') || v.startsWith('$2b$')) {
            return true; // Already hashed, skip validation
          }
          return v.length === 6 && /^\d+$/.test(v);
        },
        message: 'PIN must be 6 digits'
      }
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Hash pin before saving
userSchema.pre('save', async function (next) {
  // Only hash if pin is modified
  if (!this.isModified('pin')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.pin = await bcrypt.hash(this.pin, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare pins
userSchema.methods.comparePin = async function (candidatePin) {
  return await bcrypt.compare(candidatePin, this.pin);
};

// Method to get user without sensitive data
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.pin;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
