"use client";

import { useEffect, useState } from "react";
import { Download, Share, PlusSquare, X } from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isSafariDesktop, setIsSafariDesktop] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Register service worker unconditionally for push notifications & PWA
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registered with scope:", registration.scope);
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error);
          });
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW, { once: true });
      }
    }

    // Check if the PWA install prompt has already been shown or dismissed on this browser instance
    const alreadyShown =
      localStorage.getItem("pwa_install_prompt_shown") ||
      localStorage.getItem("pwa_prompt_dismissed") ||
      sessionStorage.getItem("pwa_prompt_dismissed");
    if (alreadyShown) return;

    // Check if already in standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Helper to display banner exactly once and record to localStorage
    const triggerBannerOnce = (delay: number) => {
      setTimeout(() => {
        if (
          !localStorage.getItem("pwa_install_prompt_shown") &&
          !localStorage.getItem("pwa_prompt_dismissed")
        ) {
          localStorage.setItem("pwa_install_prompt_shown", "true");
          setShowBanner(true);
        }
      }, delay);
    };

    // Detect iOS devices (iPhone, iPad, iPod)
    const ua = window.navigator.userAgent;
    const isAppleMobile =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    // Detect desktop Safari
    const isSafari =
      /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS|Android/.test(ua);

    if (isAppleMobile) {
      setIsIOS(true);
      triggerBannerOnce(2000);
      return;
    }

    if (isSafari && /Macintosh/.test(ua)) {
      setIsSafariDesktop(true);
      triggerBannerOnce(2000);
      return;
    }

    // Listen for beforeinstallprompt event (Android / Chromium)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      triggerBannerOnce(1500);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
      localStorage.setItem("pwa_install_prompt_shown", "true");
      localStorage.setItem("pwa_prompt_dismissed", "true");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa_prompt_dismissed", "true");
    localStorage.setItem("pwa_install_prompt_shown", "true");
    sessionStorage.setItem("pwa_prompt_dismissed", "true");
  };

  const handleInstallClick = async () => {
    if (isIOS || isSafariDesktop) {
      setShowInstructions(true);
      return;
    }

    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
      localStorage.setItem("pwa_prompt_dismissed", "true");
      localStorage.setItem("pwa_install_prompt_shown", "true");
    }
    setDeferredPrompt(null);
  };

  const handleCloseInstructions = () => {
    setShowInstructions(false);
    setShowBanner(false);
    localStorage.setItem("pwa_prompt_dismissed", "true");
    localStorage.setItem("pwa_install_prompt_shown", "true");
  };

  if (isInstalled || !showBanner) return null;

  return (
    <>
      {/* Main Install Floating Banner */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-50 animate-bounce-once">
        <div className="bg-slate-900/95 backdrop-blur-md text-white border border-teal-500/30 rounded-2xl p-4 shadow-2xl flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-600 flex items-center justify-center shrink-0 shadow-md">
            <Download size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold leading-tight text-white">Install Apex Onco App</h4>
            <p className="text-xs text-slate-300 mt-0.5 truncate">
              {isIOS || isSafariDesktop ? "Add to home screen or dock" : "Fast access directly from your screen"}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="bg-teal-500 hover:bg-teal-400 text-slate-100 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors shadow-sm"
            >
              {isIOS || isSafariDesktop ? "How to" : "Install"}
            </button>
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              title="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Safari / iOS Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-sm w-full p-5 text-white shadow-2xl relative">
            <button
              onClick={handleCloseInstructions}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Download size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-base leading-tight">Install on Apple Safari</h3>
                <p className="text-xs text-slate-400">Quick installation instructions</p>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
                  <div className="p-1.5 bg-slate-700/50 rounded-lg text-teal-400 shrink-0">
                    <Share size={16} />
                  </div>
                  <div>
                    <span className="font-medium text-white block">Step 1: Tap Share</span>
                    Tap the <strong>Share</strong> button located in Safari&apos;s bottom toolbar or top right.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
                  <div className="p-1.5 bg-slate-700/50 rounded-lg text-teal-400 shrink-0">
                    <PlusSquare size={16} />
                  </div>
                  <div>
                    <span className="font-medium text-white block">Step 2: Add to Home Screen</span>
                    Scroll down the share sheet and tap <strong>&apos;Add to Home Screen&apos;</strong>.
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
                  <span className="font-medium text-white block mb-1">On macOS Safari (Sonoma+)</span>
                  Click <strong className="text-white">File</strong> in the top menu bar, then select <strong className="text-teal-400">&apos;Add to Dock...&apos;</strong>.
                </div>
              </div>
            )}

            <button
              onClick={handleCloseInstructions}
              className="mt-5 w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs py-2.5 rounded-xl transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

