import axios from 'axios';

const PAYMOB_BASE_URL = 'https://accept.paymob.com/api';

/**
 * Executes the 3-step Paymob flow:
 * 1. Authenticate & get Auth Token
 * 2. Create Order on Paymob
 * 3. Request Payment Key
 */
const generatePaymentIframeUrl = async (booking, user) => {
  // Step 1: Authentication Token
  const authResponse = await axios.post(`${PAYMOB_BASE_URL}/auth/tokens`, {
    api_key: process.env.PAYMOB_API_KEY,
  });
  const authToken = authResponse.data.token;

  // Step 2: Order Registration
  const amountCents = Math.round(booking.totalAmount * 100); // EGP to Cents

  const orderResponse = await axios.post(`${PAYMOB_BASE_URL}/ecommerce/orders`, {
    auth_token: authToken,
    delivery_needed: "false",
    amount_cents: amountCents,
    currency: "EGP",
    merchant_order_id: booking._id.toString(), // Link Paymob order to MongoDB booking ID
  });
  const paymobOrderId = orderResponse.data.id;

  // Step 3: Payment Key Request
  const paymentKeyResponse = await axios.post(`${PAYMOB_BASE_URL}/acceptance/payment_keys`, {
    auth_token: authToken,
    amount_cents: amountCents,
    expiration: 3600, // Token valid for 1 hour
    order_id: paymobOrderId,
    billing_data: {
      first_name: user.first_name || "Guest",
      last_name: user.last_name || "User",
      email: user.email,
      phone_number: user.phone || "01000000000",
      apartment: "NA", floor: "NA", street: "NA", building: "NA", shipping_method: "NA", postal_code: "NA", city: "Cairo", country: "EG", state: "NA"
    },
    currency: "EGP",
    integration_id: Number(process.env.PAYMOB_INTEGRATION_ID),
  });

  const paymentToken = paymentKeyResponse.data.token;

  // Return full iframe URL to embed or redirect on frontend
  return `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`;
};

export default generatePaymentIframeUrl;