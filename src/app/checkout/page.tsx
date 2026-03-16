"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore, useCartHydration } from "@/lib/cart-store";
import { useCurrencyStore } from "@/lib/currency-store";
import { useCurrencyHydrated } from "@/lib/use-currency-hydrated";
import { useAvatarStore } from "@/lib/avatar-store";
import { EUROPEAN_COUNTRIES, getStatesForCountry } from "@/lib/european-countries";

type PaymentMethod = "card" | "cod";

interface Address {
  id: string;
  label: string | null;
  address: string;
  city: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

const labelClass = "block mb-2 font-sans text-sm text-dark-100 tracking-wider";
const inputClass =
  "w-full min-w-0 max-w-full border border-brand-dark bg-white px-4 py-3.5 font-sans text-sm text-dark-100 placeholder:text-[#8a8a8a] focus:outline-none focus:border-dark-100 tracking-wider";

const CHECKOUT_SAVED_KEY = "ecommerce-checkout-saved";

const CARD_NUMBER_MAX_DIGITS = 16;

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, CARD_NUMBER_MAX_DIGITS);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function formatCvv(value: string): string {
  return value.replace(/\D/g, "").slice(0, 4);
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

type CheckoutSaved = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phoneCountryCode?: string;
  address?: string;
  address2?: string;
  city?: string;
  zip?: string;
  country?: string;
  state?: string;
  rememberPhoneCode?: string;
  rememberPhoneNumber?: string;
};

function loadSavedCheckout(): CheckoutSaved | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CHECKOUT_SAVED_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as CheckoutSaved) : null;
  } catch {
    return null;
  }
}

function saveCheckoutToStorage(data: CheckoutSaved) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHECKOUT_SAVED_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, label: "Cart" },
    { num: 2, label: "Checkout" },
    { num: 3, label: "Confirmation" },
  ];

  return (
    <div className="flex items-center justify-center w-full max-w-[600px] mx-auto">
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center flex-1 last:flex-none">
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className={`w-7 h-7 flex items-center justify-center text-sm font-sans ${
                step.num < currentStep
                  ? "bg-dark-100 text-white"
                  : step.num === currentStep
                  ? "border border-dark-100 text-dark-100 font-semibold"
                  : "border border-brand-dark text-dark-60"
              }`}
            >
              {step.num < currentStep ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                step.num
              )}
            </div>
            <span
              className={`font-sans text-sm tracking-wider whitespace-nowrap ${
                step.num === currentStep ? "text-dark-100 font-semibold" : "text-dark-60"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 mx-4">
              <div className={`h-px w-full ${step.num < currentStep ? "bg-dark-100" : "bg-brand-dark"}`} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const selectedCurrency = useCurrencyStore((s) => s.currency);
  const { formatPrice } = useCurrencyHydrated();

  const items = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const cartHasHydrated = useCartHydration((s) => s.hasHydrated);

  const [mounted, setMounted] = useState(false);
  const [savedLoaded, setSavedLoaded] = useState(false);
  useEffect(() => setMounted(true), []);

  const { profileName, profileEmail } = useAvatarStore();

  useEffect(() => {
    if (!mounted || savedLoaded) return;
    const saved = loadSavedCheckout();
    if (saved) {
      if (saved.firstName) setFirstName(saved.firstName);
      if (saved.lastName) setLastName(saved.lastName);
      if (saved.email) setEmail(saved.email);
      if (saved.phone) setPhone(saved.phone);
      if (saved.phoneCountryCode) setPhoneCountryCode(saved.phoneCountryCode);
      if (saved.address) setAddress(saved.address);
      if (saved.address2) setAddress2(saved.address2);
      if (saved.city) setCity(saved.city);
      if (saved.zip) setZip(saved.zip);
      if (saved.country) setCountry(saved.country);
      if (saved.state) setState(saved.state);
      if (saved.rememberPhoneCode) setRememberPhoneCode(saved.rememberPhoneCode);
      if (saved.rememberPhoneNumber) setRememberPhoneNumber(saved.rememberPhoneNumber ?? "");
    } else {
      if (profileName) {
        const parts = profileName.trim().split(/\s+/);
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      }
      if (profileEmail) setEmail(profileEmail);
    }
    setSavedLoaded(true);
  }, [mounted, savedLoaded, profileName, profileEmail]);

  const rawSubtotal = useMemo(() => getSubtotal(), [getSubtotal]);
  const subtotal = mounted ? rawSubtotal : 0;
  const deliveryFee = mounted ? (rawSubtotal >= 50 ? 0 : 5) : 0;
  const [discountAmount, setDiscountAmount] = useState(0);
  const total = mounted ? subtotal - discountAmount + deliveryFee : 0;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+44");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [rememberPhoneCode, setRememberPhoneCode] = useState("+44");
  const [rememberPhoneNumber, setRememberPhoneNumber] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [codEnabled, setCodEnabled] = useState(true);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);

  const [saveInfo, setSaveInfo] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(searchParams.get("error") || null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [addressesLoaded, setAddressesLoaded] = useState(false);
  const orderPlacedSuccessRef = useRef(false);

  useEffect(() => {
    if (!cartHasHydrated || orderPlacedSuccessRef.current) return;
    if (items.length === 0) router.replace("/cart");
  }, [cartHasHydrated, items.length, router]);

  useEffect(() => {
    fetch("/api/settings/checkout")
      .then((r) => r.ok ? r.json() : { codEnabled: true })
      .then((data: { codEnabled?: boolean }) => setCodEnabled(data.codEnabled !== false))
      .catch(() => setCodEnabled(true));
  }, []);

  useEffect(() => {
    if (!codEnabled && paymentMethod === "cod") setPaymentMethod("card");
  }, [codEnabled, paymentMethod]);

  useEffect(() => {
    if (!session?.user) return;
    if (session.user.name) {
      const parts = session.user.name.split(" ");
      setFirstName(parts[0] ?? "");
      setLastName(parts.slice(1).join(" "));
    }
    if (session.user.email) setEmail(session.user.email);
    setSaveInfo(true);
  }, [session]);

  useEffect(() => {
    if (!session?.user?.email || addressesLoaded) return;
    async function loadAddresses() {
      try {
        const res = await fetch("/api/account/addresses");
        if (!res.ok) return;
        const data = (await res.json()) as Address[];
        const def = data.find((a) => a.isDefault) ?? data[0];
        if (def) {
          setAddress(def.address);
          setCity(def.city);
          setZip(def.zip);
          setCountry(def.country);
        }
      } catch {
        // ignore
      } finally {
        setAddressesLoaded(true);
      }
    }
    loadAddresses();
  }, [session, addressesLoaded]);

  function handleApplyVoucher() {
    if (voucherCode.trim().toUpperCase() === "SAVE10") {
      setDiscountAmount(10);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) {
      setShowLoginModal(true);
      return;
    }
    if (items.length === 0 || loading) return;
    setLoading(true);
    setError(null);

    try {
      const orderBody = {
        email,
        name: `${firstName} ${lastName}`.trim() || undefined,
        address,
        city,
        zip,
        country,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          variationId: i.variationId,
          variationLabel: i.attributes
            ? Object.entries(i.attributes)
                .map(([k, v]) => `${k}: ${v}`)
                .join(", ")
            : undefined,
        })),
        subtotal,
        discount: discountAmount,
        shipping: deliveryFee,
        total,
        coupon: voucherCode || null,
        paymentMethod,
        deliveryMethod: "standard",
        orderNotes: orderNotes.trim() || undefined,
      };

      const orderRes = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderBody),
      });

      if (!orderRes.ok) {
        const d = await orderRes.json().catch(() => ({}));
        throw new Error(d.error || "Failed to place order");
      }

      const orderData = (await orderRes.json()) as { ok: boolean; orderId: string };
      const orderId = orderData.orderId;

      if (paymentMethod === "card") {
        const totalCents = Math.round(total * 100);
        const origin = window.location.origin;
        const chargeRes = await fetch("/api/payment/charge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountCents: totalCents,
            currency: selectedCurrency,
            cardNumber: cardNumber.replace(/\D/g, ""),
            cardExpiry: cardExpiry.replace(/\D/g, "").padStart(4, "0").slice(-4),
            cardCvv,
            cardholderName: cardName.trim(),
            merchantRef: orderId,
            firstName: firstName.trim(),
            surname: lastName.trim(),
            streetLine1: address.trim(),
            streetLine2: address2.trim() || undefined,
            city: city.trim(),
            postalCode: zip.trim(),
            stateProvince: state.trim() || undefined,
            country: country.trim(),
            email: email.trim(),
            telephone: phone.trim() || undefined,
            successURL: `${origin}/api/payment/return`,
            failURL: `${origin}/api/payment/return`,
            callbackURL: `${origin}/api/payment/callback`,
          }),
        });

        const chargeData = (await chargeRes.json().catch(() => ({}))) as {
          ok?: boolean;
          error?: string;
          transactionId?: string;
          redirect?: boolean;
          redirectUrl?: string;
        };

        if (chargeData.redirect && chargeData.redirectUrl) {
          saveCheckoutToStorage({
            firstName, lastName, email, phone, phoneCountryCode,
            address, address2, city, zip, country, state,
            rememberPhoneCode, rememberPhoneNumber,
          });
          orderPlacedSuccessRef.current = true;
          clearCart();
          window.location.href = chargeData.redirectUrl;
          return;
        }

        if (!chargeRes.ok || !chargeData.ok) {
          throw new Error(chargeData.error || "Payment declined. Please check your card details.");
        }
      }

      if (session?.user?.email && saveInfo) {
        try {
          await fetch("/api/account/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              label: "Default",
              address,
              city,
              zip,
              country,
              isDefault: true,
            }),
          });
        } catch {}
      }

      saveCheckoutToStorage({
        firstName, lastName, email, phone, phoneCountryCode,
        address, address2, city, zip, country, state,
        rememberPhoneCode, rememberPhoneNumber,
      });
      orderPlacedSuccessRef.current = true;
      clearCart();
      router.push(`/checkout/success?orderId=${encodeURIComponent(orderId)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
    {showLoginModal && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={() => setShowLoginModal(false)} />
        <div className="relative bg-bg p-8 md:p-12 max-w-[480px] w-[90%] text-center shadow-xl">
          <button
            type="button"
            onClick={() => setShowLoginModal(false)}
            className="absolute top-4 right-4 text-[#5f5d5d] hover:text-dark-100 transition-colors"
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#862830" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-6">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <h2 className="font-sans text-2xl font-medium text-dark-100 mb-3">
            Login to Continue
          </h2>
          <p className="font-sans text-base text-[#5f5d5d] tracking-wider leading-relaxed mb-8">
            You need an account to place an order. Please log in or create an account to proceed with checkout.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/account/login"
              className="inline-flex items-center justify-center px-10 h-14 bg-dark-100 text-white font-sans text-lg tracking-wider hover:bg-dark-80 transition-colors"
            >
              Login →
            </Link>
            <Link
              href="/account/register"
              className="inline-flex items-center justify-center px-10 h-14 border border-dark-100 text-dark-100 font-sans text-lg tracking-wider hover:bg-dark-100 hover:text-white transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    )}
    <div className="min-h-screen bg-bg">
      <div className="max-w-[1440px] mx-auto px-6 md:px-20 py-16 md:py-24">
        <StepIndicator currentStep={2} />

        <div className="flex flex-col lg:flex-row gap-8 mt-16">
          <form id="checkout-form" onSubmit={handleSubmit} className="flex-1 min-w-0">
            <div className="bg-surface p-8">
              <h2 className="font-sans text-xl text-dark-100 leading-relaxed mb-8">
                Billing Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="billing-fullname" className={labelClass}>Full Name *</label>
                  <div className="flex gap-4">
                    <input
                      id="billing-fullname"
                      className={inputClass}
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      autoComplete="given-name"
                      required
                    />
                    <input
                      className={inputClass}
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      autoComplete="family-name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="billing-email" className={labelClass}>Email *</label>
                    <input
                      id="billing-email"
                      type="email"
                      className={inputClass}
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="billing-phone" className={labelClass}>Phone *</label>
                    <input
                      id="billing-phone"
                      type="tel"
                      className={inputClass}
                      placeholder="+44 1234 567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="billing-country" className={labelClass}>Country *</label>
                  <div className="relative">
                    <select
                      id="billing-country"
                      className={`${inputClass} appearance-none pr-10`}
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        setState("");
                      }}
                      required
                    >
                      <option value="">Select country</option>
                      {EUROPEAN_COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-60 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {country && getStatesForCountry(country).length > 0 && (
                  <div>
                    <label htmlFor="billing-state" className={labelClass}>State</label>
                    <div className="relative">
                      <select
                        id="billing-state"
                        className={`${inputClass} appearance-none pr-10`}
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      >
                        <option value="">Select state</option>
                        {getStatesForCountry(country).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-60 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="billing-address" className={labelClass}>Address *</label>
                  <input
                    id="billing-address"
                    className={inputClass}
                    placeholder="123 Main Street, Apt 4B"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    autoComplete="address-line1"
                    required
                  />
                  <input
                    className={`${inputClass} mt-2`}
                    placeholder="Optional"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    autoComplete="address-line2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="billing-city" className={labelClass}>City *</label>
                    <input
                      id="billing-city"
                      type="text"
                      className={inputClass}
                      placeholder="New York"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      autoComplete="address-level2"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="billing-zip" className={labelClass}>Zip Code *</label>
                    <input
                      id="billing-zip"
                      className={inputClass}
                      placeholder="10001"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      autoComplete="postal-code"
                      required
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-3 mt-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useShippingAsBilling}
                  onChange={(e) => setUseShippingAsBilling(e.target.checked)}
                  className="w-4 h-4 shrink-0 border-brand-dark text-dark-100 focus:ring-dark-100"
                />
                <span className="font-sans text-sm text-dark-100 tracking-wider">
                  Use billing address as shipping address
                </span>
              </label>
            </div>

            <div className="bg-surface p-8 mt-8">
              <h2 className="font-sans text-xl text-dark-100 leading-relaxed mb-8">
                Additional Information
              </h2>
              <div>
                <label htmlFor="order-notes" className={labelClass}>Order notes (optional)</label>
                <textarea
                  id="order-notes"
                  className={`${inputClass} resize-none`}
                  rows={5}
                  placeholder="Notes about your order, e.g. special delivery instructions"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-surface p-8 mt-8">
              <h2 className="font-sans text-xl text-dark-100 leading-relaxed mb-6">
                Payment
              </h2>
              <div className="space-y-3">
                {codEnabled && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="w-4 h-4 text-dark-100 focus:ring-dark-100"
                    />
                    <span className="font-sans text-sm text-dark-100 tracking-wider">Cash on delivery</span>
                  </label>
                )}
                <label className="flex items-center gap-3 cursor-pointer flex-wrap">
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="w-4 h-4 text-dark-100 focus:ring-dark-100"
                    />
                    <span className="font-sans text-sm text-dark-100 tracking-wider">Pay with Card</span>
                  </span>
                  <span className="flex items-center gap-1 w-full sm:w-auto mt-1 sm:mt-0 sm:ml-2">
                    <Image src="/images/payments.svg" alt="MasterCard, VISA, Google Pay, Apple Pay" width={80} height={20} className="h-5 w-auto" />
                  </span>
                </label>
              </div>

              {paymentMethod === "card" && (
                <div className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="card-number" className={labelClass}>Card Number</label>
                    <input
                      id="card-number"
                      type="text"
                      inputMode="numeric"
                      maxLength={CARD_NUMBER_MAX_DIGITS + 3}
                      className={inputClass}
                      placeholder="XXXX XXXX XXXX XXXX"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      autoComplete="cc-number"
                      required={paymentMethod === "card"}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="card-cvv" className={labelClass}>CVV</label>
                      <input
                        id="card-cvv"
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        className={inputClass}
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(formatCvv(e.target.value))}
                        autoComplete="cc-csc"
                        required={paymentMethod === "card"}
                      />
                    </div>
                    <div>
                      <label htmlFor="card-expiry" className={labelClass}>Expiration Date</label>
                      <input
                        id="card-expiry"
                        type="text"
                        inputMode="numeric"
                        maxLength={5}
                        className={inputClass}
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        autoComplete="cc-exp"
                        required={paymentMethod === "card"}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="card-name" className={labelClass}>Name Of Card</label>
                    <input
                      id="card-name"
                      className={inputClass}
                      placeholder="Name of Card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required={paymentMethod === "card"}
                    />
                  </div>
                </div>
              )}

              <label className="flex items-center gap-3 mt-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveInfo}
                  onChange={(e) => setSaveInfo(e.target.checked)}
                  className="w-4 h-4 shrink-0 border-brand-dark text-dark-100 focus:ring-dark-100"
                />
                <span className="font-sans text-sm text-dark-100 tracking-wider">
                  Save my information for a faster checkout
                </span>
              </label>
            </div>
          </form>

          <div className="w-full lg:w-[475px] shrink-0">
            <div className="bg-surface p-8 lg:sticky lg:top-28">
              <h2 className="font-sans text-xl text-dark-100 leading-relaxed mb-6">
                Order Summary
              </h2>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="font-sans text-sm text-dark-100 tracking-wider">Subtotal</span>
                  <span className="font-sans text-sm text-dark-100 tracking-wider">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-sans text-sm text-dark-100 tracking-wider">Shipping</span>
                  <span className="font-sans text-sm text-dark-100 tracking-wider">
                    {deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-sans text-sm text-dark-100 tracking-wider">Discount</span>
                  <span className="font-sans text-sm text-dark-100 tracking-wider">-{formatPrice(discountAmount)}</span>
                </div>

                <div className="border-t border-brand-dark pt-4 flex justify-between items-center">
                  <span className="font-sans text-lg font-medium text-dark-100">Total</span>
                  <span className="font-sans text-lg font-medium text-dark-100">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  className="flex-1 h-11 px-4 bg-[#faf8f6] border border-brand-dark rounded text-sm font-sans text-dark-100 tracking-wider placeholder:text-dark-100 focus:outline-none focus:border-dark-60"
                />
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  className="h-11 px-5 bg-[#faf8f6] border border-brand-dark rounded font-sans text-sm text-dark-100 tracking-wider hover:bg-brand-dark transition-colors"
                >
                  Apply
                </button>
              </div>

              {error && (
                <p className="font-sans text-sm text-red-600 mt-4">
                  {error}
                </p>
              )}

              <div className="flex flex-col gap-3 mt-6">
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={loading || items.length === 0}
                  className="w-full h-14 flex items-center justify-center bg-dark-100 text-white font-sans text-lg tracking-wider hover:bg-dark-80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Placing order..." : "Place Order"}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-brand-dark">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f5d5d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span className="font-sans text-xs font-semibold text-dark-80 text-center leading-relaxed">
                      Secure<br />Checkout
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f5d5d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                    <span className="font-sans text-xs font-semibold text-dark-80 text-center leading-relaxed">
                      Easy<br />Returns
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f5d5d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <rect x="1" y="3" width="15" height="13" />
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                    <span className="font-sans text-xs font-semibold text-dark-80 text-center leading-relaxed">
                      Fast<br />Shipping
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}
