const express = require('express');
const authMiddleware = require('../Middleware/userAuth');
const { placeOrder, getUserOrders, getAllOrders, updateOrderStatus, cancelOrder , bulkUpdateOrderStatus} = require('../Controller/order');
const { authenticateJWT, authorizeRoles } = require('../Middleware/Authorization');
const router = express.Router()

router.post('/place',authMiddleware,placeOrder)
router.get('/user',authMiddleware,getUserOrders)
router.get('/all',authenticateJWT,authorizeRoles('admin'),getAllOrders)
router.put('/update/:orderId',authenticateJWT,updateOrderStatus)
router.delete('/delete',authMiddleware,cancelOrder)
router.put('/bulk-status',authenticateJWT,bulkUpdateOrderStatus)

module.exports = router;