const express = require('express');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
const router = express.Router();
const {newOrder,getOrderDetails,myOrders,allOrders,updateOrder, deleteOrder,getSales} = require ('../controllers/orderController')


router.route("/orders/new").post(isAuthenticatedUser,newOrder)
router.route("/orders/:id").get(isAuthenticatedUser,getOrderDetails)
router.route("/me/orders").get(isAuthenticatedUser,myOrders)

router.route("/admin/orders").get(isAuthenticatedUser,authorizeRoles('admin'),allOrders)
router.route("/admin/orders/:id").put(isAuthenticatedUser,authorizeRoles('admin'),updateOrder).delete(isAuthenticatedUser,authorizeRoles('admin'),deleteOrder)
router
  .route("/admin/get_sales")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getSales);


module.exports=router;