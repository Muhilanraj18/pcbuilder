// Analytics hook for tracking affiliate clicks and conversions

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackAffiliateClick(product: string, platform: string, price: number, category?: string) {
  // GA4 event tracking
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'affiliate_click', {
      event_category: 'affiliate',
      event_label: product,
      platform,
      price,
      component_category: category || 'unknown',
      currency: 'INR',
    });
  }

  // Console logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Affiliate Click] ${product} → ${platform} (₹${price})`);
  }
}

export function trackBuildComplete(budget: number, totalPrice: number, componentCount: number, useCase?: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'build_complete', {
      event_category: 'engagement',
      budget,
      total_price: totalPrice,
      component_count: componentCount,
      use_case: useCase || 'general',
      currency: 'INR',
    });
  }
}

export function trackPageView(pageName: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: pageName,
    });
  }
}
