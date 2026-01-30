import apiUserClient from "./apiUserAuth";
import { useEffect, useState } from "react";
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
  return res.data?.paid === true;
}


export function usePaymentStatus() {
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    async function check() {
      try {
        const res = await apiUserClient.get("/api/stripe/status");

        if (!cancelled && res.data?.paid) {
          setPaid(true);
          setLoading(false);
          return true;
        }

        return false;
      } catch {
        return false;
      }
    }

    check().then((done) => {
      if (done) return;

      const interval = setInterval(async () => {
        attempts++;
        const done = await check();

        if (done || attempts >= 10) {
          setLoading(false);
          clearInterval(interval);
        }
      }, 1500);

      return () => clearInterval(interval);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { paid, loading };
}
