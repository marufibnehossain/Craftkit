"use client";

import { useEffect, useState, useCallback, useRef } from "react";

type RecaptchaVersion = "v2_checkbox" | "v2_invisible" | "v3";

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      render: (container: string | HTMLElement, params: {
        sitekey: string;
        callback: (token: string) => void;
        "expired-callback"?: () => void;
        theme?: string;
        size?: string;
      }) => number;
      reset: (widgetId?: number) => void;
      getResponse: (widgetId?: number) => string;
      execute: (siteKeyOrWidgetId: string | number, options?: { action: string }) => Promise<string>;
    };
    onRecaptchaLoad?: () => void;
  }
}

interface UseReCaptchaReturn {
  token: string | null;
  setToken: (t: string | null) => void;
  executeRecaptcha: (action: string) => Promise<string | null>;
  resetCaptcha: () => void;
  isLoaded: boolean;
  isEnabled: boolean;
  siteKey: string | null;
  version: RecaptchaVersion;
}

export function useReCaptcha(): UseReCaptchaReturn {
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const [version, setVersion] = useState<RecaptchaVersion>("v2_checkbox");
  const [isLoaded, setIsLoaded] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const widgetIdRef = useRef<number | null>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchKey() {
      try {
        const res = await fetch("/api/recaptcha");
        const data = await res.json();
        if (!cancelled) {
          if (data.siteKey) setSiteKey(data.siteKey);
          if (data.version) setVersion(data.version);
        }
      } catch {}
    }
    fetchKey();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!siteKey || scriptLoadedRef.current) return;

    const isV3 = version === "v3";
    const scriptSrc = isV3
      ? `https://www.google.com/recaptcha/api.js?render=${siteKey}`
      : "https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit";

    if (document.querySelector('script[src*="recaptcha/api.js"]')) {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => setIsLoaded(true));
      }
      scriptLoadedRef.current = true;
      return;
    }

    if (!isV3) {
      window.onRecaptchaLoad = () => {
        setIsLoaded(true);
      };
    }

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    script.defer = true;
    if (isV3) {
      script.onload = () => {
        window.grecaptcha.ready(() => setIsLoaded(true));
      };
    }
    document.head.appendChild(script);
    scriptLoadedRef.current = true;
  }, [siteKey, version]);

  const executeRecaptcha = useCallback(async (action: string): Promise<string | null> => {
    if (!siteKey || !isLoaded || !window.grecaptcha) return null;
    if (version === "v3") {
      try {
        return await window.grecaptcha.execute(siteKey, { action });
      } catch (e) {
        console.error("[reCAPTCHA] Execute failed:", e);
        return null;
      }
    }
    if (version === "v2_invisible" && widgetIdRef.current !== null) {
      try {
        return await window.grecaptcha.execute(widgetIdRef.current);
      } catch (e) {
        console.error("[reCAPTCHA] Execute failed:", e);
        return null;
      }
    }
    return token;
  }, [siteKey, isLoaded, version, token]);

  const resetCaptcha = useCallback(() => {
    setToken(null);
    if (widgetIdRef.current !== null && window.grecaptcha) {
      try {
        window.grecaptcha.reset(widgetIdRef.current);
      } catch {}
    }
  }, []);

  return {
    token,
    setToken,
    executeRecaptcha,
    resetCaptcha,
    isLoaded,
    isEnabled: !!siteKey,
    siteKey,
    version,
  };
}

interface ReCaptchaWidgetProps {
  siteKey: string;
  isLoaded: boolean;
  version: RecaptchaVersion;
  onVerify: (token: string) => void;
  onExpired?: () => void;
}

export function ReCaptchaWidget({ siteKey, isLoaded, version, onVerify, onExpired }: ReCaptchaWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !siteKey || !containerRef.current || renderedRef.current) return;
    if (!window.grecaptcha) return;
    if (version === "v3") return;

    try {
      window.grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          onVerify(token);
        },
        "expired-callback": () => {
          onExpired?.();
        },
        size: version === "v2_invisible" ? "invisible" : "normal",
      });
      renderedRef.current = true;
    } catch (e) {
      console.error("[reCAPTCHA] Render failed:", e);
    }
  }, [isLoaded, siteKey, version, onVerify, onExpired]);

  if (version === "v3") return null;

  return <div ref={containerRef} />;
}
