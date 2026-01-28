import apiUserClient from "./apiUserAuth";


/**
* Start Stripe Checkout for a paid feature
* Backend determines:
* - price
* - product name
* - user_id (from JWT)
*/
export async function startCheckout(productKey: string) {
const res = await apiUserClient.post("/api/stripe/checkout", {
product_key: productKey,
});


const { url } = res.data;


// Redirect to Stripe-hosted checkout
window.location.href = url;
}


/**
* Check whether the current user has paid
*/
export async function fetchPaymentStatus(): Promise<boolean> {
const res = await apiUserClient.get("/api/stripe/status");
return res.data.paid === true;
}