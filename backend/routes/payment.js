

const express = require('express');
const { isAuthenticatedUser} = require('../middlewares/auth');

const {stripeCheckoutSession,stripeWebhook} = require("../controllers/paymentControllers.js")
const router = express.Router();

router
  .route("/payment/checkout_session")
  .post(isAuthenticatedUser, stripeCheckoutSession);

router.route("/payment/webhook").post(stripeWebhook);
module.exports = router