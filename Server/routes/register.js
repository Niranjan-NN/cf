const express = require('express')
const router = express.Router()
const {registerForm, otpVerify, login, forgotPassword, verifyOtp, resetPassword,googleLogin,refreshToken,getUserById} = require('../Controller/register')
const {addAddress,getAddress,getByIdAddress,putAddress,deleteAddress} = require('../Controller/address')
const {adminRegister, Adminlogin, adminrefreshToken} = require('../Controller/Auth')
const {authenticateJWT, authorizeRoles} = require('../Middleware/Authorization')
const authMiddleware = require('../Middleware/userAuth')
const Register = require('../Model/register')
router.post('/user',registerForm)
router.post('/verifyUser',otpVerify)
router.post('/login',login)
router.post('/forgotPassword',forgotPassword)
router.post('/verifyOtp',verifyOtp)
router.post('/resetPassword',resetPassword)
router.post('/google-login', googleLogin);
router.post('/refresh-token',refreshToken)
router.get('/user/:id',getUserById)
router.post('/addAddress',authMiddleware,addAddress)
router.get('/getAddress',getAddress)
router.get('/getByIdAddress/:userId',getByIdAddress)
router.put('/putAddress/:userId',putAddress)
router.delete('/deleteAddress/:id',deleteAddress)

router.post('/adminRegister',adminRegister)
router.post('/adminLogin',Adminlogin)
router.post('/admin-refresh-token', adminrefreshToken)

router.put("/promote/:_id", authenticateJWT, async (req, res) => {
    const { _id } = req.params;
  
    try {
      const user = await Register.findById(_id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      user.role = "admin"; // ✅ Update role field
      await user.save();
  
      res.json({ message: "User promoted to admin" });
    } catch (error) {
      res.status(500).json({ message: "Error promoting user" });
    }
  });

//   router.get("/dashboard", authenticateJWT, authorizeRoles("admin"), (req, res) => {
//     res.json({ message: "Welcome to the Admin Dashboard!" });
//   });
 
module.exports = router;