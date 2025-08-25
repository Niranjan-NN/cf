const express = require('express')
const Address = require('../Model/Address')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser'); 
dotenv.config()
const sendMail = require('../Middleware/sendMail')

const addAddress = async (req, res) => {
    try {
        const newAddress = new Address(req.body); // req.body should contain userId + address info
    const savedAddress = await newAddress.save();
    res.status(201).json(savedAddress);
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({ error: "Failed to add address" });
  }
}

const getAddress = async (req, res) => {
    try {
        const address = await Address.findOne();
        res.status(200).json(address);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch addresses" });
    }
}

const getByIdAddress = async (req, res) => {
    try {
        const { userId } = req.params;
        const addresses = await Address.find({ user: req.params.userId });
    res.status(200).json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ error: "Failed to fetch addresses" });
  }
};

const putAddress = async (req, res) => {
  try {
    const updatedAddress = await Address.findOneAndUpdate(
      { user: req.params.userId }, // filter by user
      req.body,
      { new: true }
    );

    if (!updatedAddress) return res.status(404).json({ error: "Address not found" });

    res.status(200).json({ message: "Address updated successfully", address: updatedAddress });
  } catch (error) {
    res.status(500).json({ error: "Failed to update address" });
  }
};

const deleteAddress = async (req, res) => {
    try {
    const addressId = req.params.id;
    const deleted = await Address.findByIdAndDelete(addressId);
    if (!deleted) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = {addAddress,getAddress,getByIdAddress,putAddress,deleteAddress}
