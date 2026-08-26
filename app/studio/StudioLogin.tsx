"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type GoogleIdentityApi = {
  initialize(options: {
    client_id: string;
    login_uri: string;
    ux_mode: "redirect";
    auto_select: boolean;
    cancel_on_tap_outside: boolean;
    itp_support: boolean;
  }): void;
  renderButton(parent: HTMLElement, options: {
    type: "standard";
    theme: "filled_black";
    size: "large";
    text: "signin_with";
    shape: "pill";
    logo_alignment: "left";
    width: number;
  }): void;
};

type GoogleIdentityWindow = typeof window & {
  google?: { accounts?: { id?: GoogleIdentityApi } };
};

export function StudioLogin({ clientId, loginUri }: { clientId: string; loginUri: string }) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);

  const renderGoogleButton = useCallback(() => {
    const identity = (window as GoogleIdentityWindow).google?.accounts?.id;
    if (!identity || !buttonRef.current) return false;

    buttonRef.current.replaceChildren();
    identity.initialize({
      client_id: clientId,
      login_uri: loginUri,
      ux_mode: "redirect",
      auto_select: false,
      cancel_on_tap_outside: true,
      itp_support: true,
    });
    identity.renderButton(buttonRef.current, {
      type: "standard",
      theme: "filled_black",
      size: "large",
      text: "signin_with",
      shape: "pill",
      logo_alignment: "left",
      width: 280,
    });
    setStatus("ready");
    return true;
  }, [clientId, loginUri]);

  useEffect(() => {
    let disposed = false;
    let script = document.querySelector<HTMLScriptElement>("script[data-studio-google-identity]");

    const handleLoad = () => {
      if (!disposed && !renderGoogleButton()) setStatus("error");
    };
    const handleError = () => {
      if (!disposed) setStatus("error");
    };

    if (renderGoogleButton()) return;

    if (attempt > 0 && script) {
      script.remove();
      script = null;
    }
    if (!script) {
      script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.dataset.studioGoogleIdentity = "true";
      document.head.appendChild(script);
    }
    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    const timeout = window.setTimeout(() => {
      if (!disposed && !renderGoogleButton()) setStatus("error");
    }, 8_000);

    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      script?.removeEventListener("load", handleLoad);
      script?.removeEventListener("error", handleError);
    };
  }, [attempt, renderGoogleButton]);

  return (
    <div className="studio-google-login">
      <div ref={buttonRef} className="studio-google-button" aria-live="polite" />
      {status === "loading" ? <p className="studio-login-loading">正在準備 Google 登入…</p> : null}
      {status === "error" ? (
        <div className="studio-login-fallback" role="alert">
          <p>Google 登入元件沒有載入完成。</p>
          <button type="button" onClick={() => { setStatus("loading"); setAttempt((current) => current + 1); }}>重新載入登入按鈕</button>
        </div>
      ) : null}
    </div>
  );
}
