import { usePaymentStatus, startCheckout } from "@/api/payment";

export default function BillingPage() {
  const { paid, loading } = usePaymentStatus();

  if (loading) {
    return <p>Checking payment status…</p>;
  }

  if (paid) {
    return (
      <div>
        <h1>Billing</h1>
        <p>✅ You already have access.</p>
        <button onClick={() => window.location.href = "/dashboard"}>
          Go to dashboard
        </button>
      </div>
    );
  }

  // ❌ USER IS NOT PAID
  return (
    <div>
      <h1>Billing</h1>
      <p>This feature requires a subscription.</p>

      <button onClick={() => startCheckout("tariff_basic")}>
        Upgrade now
      </button>
    </div>
  );
}