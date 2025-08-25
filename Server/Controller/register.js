const express = require('express')
const Register = require('../Model/register')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser'); 
dotenv.config()
const sendMail = require('../Middleware/sendMail')
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};
 // Adjust the path if needed

 const registerForm = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await Register.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const otp = Math.floor(100000 + Math.random() * 900000); // OTP 6-digit

    const user = { name, email, hashPassword };
    const tempToken = jwt.sign({ user, otp }, process.env.SECRET_CODE, { expiresIn: '5m' });

    // Send OTP email
    const message = `Your OTP is: ${otp}`;
    await sendMail(email, "Welcome to Esite", message);

    res.cookie('jwt', tempToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      maxAge: 5 * 60 * 1000 // 5 minutes
    });

    res.status(200).json({ message: "OTP has been sent to your email", tempToken });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(400).send({ message: error.message });
  }
};

const otpVerify = async (req, res) => {
  try {
    const { otp } = req.body;
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).send({ message: "Token not found, please register again" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_CODE);

    if (Number(decoded.otp) !== Number(otp)) {
      return res.status(401).send({ message: "Invalid OTP" });
    }

    const existingUser = await Register.findOne({ email: decoded.user.email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await Register.create({
      name: decoded.user.name,
      email: decoded.user.email,
      password: decoded.user.hashPassword
    });

    const accessToken = jwt.sign(
  { id: user._id, role: user.role },
  process.env.SECRET_CODE,
  { expiresIn: "15m" }
);

const refreshToken = jwt.sign(
  { id: user._id, role: user.role },
  process.env.REFRESH_SECRET,
  { expiresIn: "7d" }
);

// Set refresh token as secure cookie
res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: false, // true in production
  sameSite: "Lax",
  maxAge: 7 * 24 * 60 * 60 * 1000
});

res.status(200).json({
  message: "User created successfully",
  token: accessToken,
  user
});


  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
};
    
const login = async(req,res)=>{
    const { email, password } = req.body;

  try {
    const user = await Register.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.SECRET_CODE, { expiresIn: "15m" });
const refreshToken = jwt.sign({ id: user._id, role: user.role }, process.env.REFRESH_SECRET, { expiresIn: "7d" });

    res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false, // true in production with HTTPS
    sameSite: 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

res.json({ message: 'Logged in successfully', token: accessToken, user });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await Register.findOne({ email });
        if(!user) {return res.status(400).json({ message: "User not found"})}
        const otp = Math.floor(100000 + Math.random() * 900000);
    const token = jwt.sign({user,otp},process.env.SECRET_CODE,{expiresIn:'5m'})
    const message = `your otp is ${otp}`
    sendMail(email, "Forget password",message)
    res.cookie('jwt_otp',token,{
        httpOnly: true,
        maxAge: 24*60*60*1000 
    })
    res.status(200).send({message:"otp has been sent",
        token
    })
    }catch(error){
        res.status(400).send({message:error.message})
    }}

    const verifyOtp = async (req, res) => {
        const { otp } = req.body;
        const token = req.cookies.jwt_otp; 
    
        if (!token) {
            return res.status(400).json({ message: "No token found, request OTP again!" });
        }
    
        try {
            const decoded = jwt.verify(token, process.env.SECRET_CODE); 
    
            if (Number(decoded.otp) !== Number(otp)) {
                return res.status(400).json({ message: "Invalid OTP!" });
            }
    
            
            const finalToken = jwt.sign({ email: decoded.user.email }, process.env.SECRET_CODE, { expiresIn: "10m" });
    
            res.cookie("jwt_new", finalToken, {
              httpOnly: true,
              secure: false,
              sameSite: "Lax",
              maxAge: 7 * 24 * 60 * 60 * 1000
            });
            res.status(200).json({ message: "OTP verified, you can reset your password now!", token:finalToken });
    
        } catch (error) {
            res.status(400).json({ message: "Invalid or expired OTP!" });
        }
    };
    

    const resetPassword = async (req, res) => {
        const { password } = req.body;
        const token = req.cookies.jwt_new; 
    
        if (!token) {
            return res.status(400).json({ message: "Unauthorized request!" });
        }
    
        try {
            const decoded = jwt.verify(token, process.env.SECRET_CODE); 
            const user = await Register.findOne({ email: decoded.email });
    
            if (!user) {
                return res.status(400).json({ message: "User not found!" });
            }
    
           
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
    
            await user.save();
    
            res.clearCookie("resetToken");
    
            res.status(200).json({ message: "Password has been reset successfully!" });
    
        } catch (error) {
            res.status(400).json({ message: "Invalid or expired token!" });
        }
    };

  const googleLogin = async (req, res) => {
  const { token } = req.body;
    try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload(); // Contains user's email, name, etc.

    // Optionally: Create/find user in DB
    const email = payload.email;

    // Optionally generate JWT or session token
    const ourJwtToken = generateJWT({ email }); // Your own function

    res.json({ token: ourJwtToken });
  } catch (err) {
    console.error("Google login verification failed:", err);
    res.status(401).json({ error: "Invalid Google token" });
  }
};

const refreshToken = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.REFRESH_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid or expired refresh token

    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.SECRET_CODE,
      { expiresIn: "15m" }
    );

    res.json({ token: newAccessToken });
  });
};


    
    

module.exports = {registerForm, otpVerify, login, forgotPassword,verifyOtp, resetPassword,googleLogin,refreshToken};