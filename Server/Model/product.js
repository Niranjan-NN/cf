const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    offerDescription: {
        type: String,
    },
    category: {
        type: String,
        required: true
    },
    // Shop-wise stock with units
    shopStocks: [
        {
            shopName: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 0
            },
            unit: {
                type: String,
                enum: ['box', 'kg', 'g', 'mg', 'bunch', 'pack', 'litre', 'ml', 'piece'],
                default: 'piece',
                required: true
            },
            vendor: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "Vendor",
                  required: true, // store vendor for quick access
                }
        }
    ],
    image: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Register',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// 🔢 Virtual to calculate total quantity (only when unit is the same)
productSchema.virtual('totalStock').get(function () {
    return this.shopStocks.reduce((sum, stock) => sum + stock.quantity, 0);
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
