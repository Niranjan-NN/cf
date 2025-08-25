// vendorController.js
const Vendor = require('../Model/vendor');
const addVendor = async (req, res) => {
    try {
        const vendor = new Vendor(req.body);
        await vendor.save();
        res.status(201).json({ message: "Vendor Added Successfully" });

    }catch{
        res.status(500).json({ message: "Error Occured" });
    }
}
const GetVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({}, "name _id"); // Only send ID & Name
    res.status(200).json({ vendors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching vendors" });
  }
};

module.exports = {addVendor, GetVendors };
