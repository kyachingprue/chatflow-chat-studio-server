import { User } from "../models/userModels.js";
import { Session } from '../models/sessionModels.js'; 
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"
import { verifyEmail } from "../emailVerify/verifyEmail.js";
import { sendOtpMail } from '../emailVerify/sendOtpMail.js';

export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role, image } = req.body;

    // Check required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
      image: image || undefined,
    });

    // Generate JWT token
    if (!process.env.SECRET_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: SECRET_KEY missing',
      });
    }
    const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY, {
      expiresIn: '10d',
    });

    // Send verification email
    try {
      await verifyEmail(token, email);
    } catch (err) {
      console.error('Email sending failed:', err.message);
    }

    // Save token in user
    newUser.token = token;
    await newUser.save();

    // Return safe user data (exclude password)
    const userResponse = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      isVerified: newUser.isVerified,
    };

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userResponse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verification = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res
        .status(401)
        .json({ success: false, message: 'Token missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Token verification failed or expired',
        });
    }

    const user = await User.findById(decoded.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });

    if (user.isVerified) {
      return res
        .status(200)
        .json({ success: true, message: 'Email already verified' });
    }

    user.isVerified = true;
    user.token = null;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'All fields are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized access' });
    }

    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {
      return res
        .status(402)
        .json({ success: false, message: 'Incorrect Password' });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({
          success: false,
          message: 'Please verify your email before login',
        });
    }

    // Session management
    const existingSession = await Session.findOne({ userId: user._id });
    if (existingSession) {
      await Session.deleteOne({ userId: user._id });
    }
    await Session.create({ userId: user._id });

    // JWT tokens
    const accessToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: '10d',
    });
    const refreshToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: '30d',
    });

    user.isLoggedIn = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Welcome back ${user.username}`,
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    console.error('Login error:', error); // Detailed logging
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const userId = req.userId;
    await Session.deleteMany({ userId });
    await User.findByIdAndUpdate(userId, { isLoggedIn: false })
    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpired = expiry;
    await user.save()
    await sendOtpMail(email, otp);
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully"
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const verifyOTP = async (req, res) => {
  const { otp } = req.body;
  const email = req.params.email;
  if (!otp) {
    return res.status(400).json({
      success: false,
      message: "OTP is required"
    })
  }
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    } if (!user.otp || !user.otpExpired) {
      return res.status(400).json({
        success: false,
        message: "OTP not generated or already verified"
      })
    } if (user.otpExpired < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one"
      })
    } if (otp !== user.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      })
    }
    user.otp = null
    user.otpExpired = null
    await user.save()
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully"
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }
}

export const changePassword = async (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  const email = req.params.email;
  if (!newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    })
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Password do not match"
    })
  }
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    await user.save()
    return res.status(200).json({
      success: true,
      message: "Password changed successfully"
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }
}
