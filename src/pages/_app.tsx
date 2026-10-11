import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import Link from 'next/link'
import Script from 'next/script'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import CookieConsentBanner from '@/components/CookieConsentBanner'
import AIChatAgent from '@/components/AIChatAgent'

const GA_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>INAN INFINITES | Premium PC Builder</title>
        <meta
          name="description"
          content="Build your perfect PC with INAN INFINITES. Get AI-powered compatibility checks and live pricing."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Google Analytics 4 */}
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { page_path: window.location.pathname });
            `}
          </Script>
        </>
      )}

      {/* Microsoft Clarity */}
      {CLARITY_ID && (
        <Script id="clarity-init" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_ID}");
          `}
        </Script>
      )}

      {/* Global Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 relative overflow-hidden flex items-center justify-center">
              <img 
                src="/images/components/1000148170%20(1).png" 
                alt="INAN INFINITES Logo" 
                className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 group-hover:text-primary-600 transition-colors">
              INAN INFINITES
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm font-semibold text-gray-600">
            <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <Link href="/budget" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm">Build PC</Link>
          </div>
        </div>
      </nav>

      {/* Smooth Page Transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={router.route}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen flex flex-col"
        >
          <main className="flex-1">
            <Component {...pageProps} />
          </main>
          
          <footer className="border-t border-gray-200 bg-white px-4 py-6 text-center text-xs text-gray-600 mt-auto">
            <p>INAN INFINITES © {new Date().getFullYear()}. All rights reserved.</p>
            <p className="mt-1">
              <Link href="/privacy-policy" className="text-primary-600 hover:underline">
                Privacy Policy & Disclosure
              </Link>
            </p>
          </footer>
        </motion.div>
      </AnimatePresence>
      
      <CookieConsentBanner />
      <AIChatAgent />
    </>
  )
}
