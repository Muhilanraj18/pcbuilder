import { useEffect, useState } from 'react';

const CONSENT_KEY = 'pcbuilder_cookie_consent';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

function loadScript(src: string, id: string) {
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function initializeAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

  if (gaId) {
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${gaId}`, 'ga4-loader');
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', gaId);
  }

  if (clarityId) {
    const inline = document.createElement('script');
    inline.id = 'clarity-loader';
    inline.innerHTML = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${clarityId}");`;
    if (!document.getElementById('clarity-loader')) {
      document.head.appendChild(inline);
    }
  }
}

export default function CookieConsentBanner() {
  const [consent, setConsent] = useState<'accepted' | 'rejected' | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(CONSENT_KEY);
    if (stored === 'accepted' || stored === 'rejected') {
      setConsent(stored);
      if (stored === 'accepted') {
        initializeAnalytics();
      }
    }
  }, []);

  const handleDecision = (value: 'accepted' | 'rejected') => {
    window.localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
    if (value === 'accepted') {
      initializeAnalytics();
    }
  };

  if (consent) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
      <p className="text-sm text-gray-700">
        We use cookies for affiliate attribution and analytics to improve PC recommendations.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => handleDecision('accepted')}
          className="rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Accept
        </button>
        <button
          onClick={() => handleDecision('rejected')}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
