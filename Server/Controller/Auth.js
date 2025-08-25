const express = require('express')
const Register = require('../Model/register')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser'); 
dotenv.config()

const adminRegister = async (req, res) => {
  try{
    const { name, email, password, secretKey } = req.body;

    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
        return res.status(403).json({ message: "Unauthorized to create an admin" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Register({ name, email, password: hashedPassword, role: "admin" });

    
        await newAdmin.save();

        const accessToken = jwt.sign({ id: newAdmin._id, role: newAdmin.role }, process.env.SECRET_CODE, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ id: newAdmin._id, role: newAdmin.role }, process.env.REFRESH_SECRET, { expiresIn: "7d" });
        
            res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false, // true in production with HTTPS
            sameSite: 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
        
        res.json({ message: 'Logged in successfully', token: accessToken, newAdmin });
    } catch (error) {
        res.status(400).json({ message: "Error registering admin" });
    }
};

const Adminlogin = async(req,res)=>{
    const { email, password,secretKey } = req.body;

  try {
    const user = await Register.findOne({ email });
    if (!user) return res.status(400).json({ message: "You're not an Admin" });
    

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        // res.clearCookie('jwt');
        return res.status(400).json({ message: "Invalid credentials" });}

    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
        // res.clearCookie('jwt');
        return res.status(403).json({ message: "You're not an admin" });
    }
    // if(req.user.role!="admin"){
    //     res.clearCookie('jwt');
    //     return res.status(401).json({message:'You are not authorized to perform this action'})
    // }

    const accessToken = jwt.sign({ id: user._id, role:'admin' }, process.env.SECRET_CODE, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ id: user._id, role: 'admin' }, process.env.REFRESH_SECRET, { expiresIn: "7d" });
        
            res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false, // true in production with HTTPS
            sameSite: 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
        
        res.json({ message: 'Logged in successfully', token: accessToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const adminrefreshToken = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.REFRESH_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid or expired refresh token

    const newAccessToken = jwt.sign(
      { id: user.id, role: 'admin' },
      process.env.SECRET_CODE,
      { expiresIn: "15m" }
    );

    res.json({ token: newAccessToken });
  });
};


module.exports = {adminRegister,Adminlogin, adminrefreshToken};