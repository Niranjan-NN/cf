const express = require('express')
const { addtoCart, getCartItems, removeItemFromCart } = require('../Controller/cart')
const authMiddleware = require('../Middleware/userAuth')
const router = express.Router()

router.post('/cart/add',authMiddleware,addtoCart)
router.get('/cart',authMiddleware,getCartItems)
router.delete('/remove/:productId',authMiddleware,removeItemFromCart)

module.exports = router