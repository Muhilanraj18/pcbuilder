import Head from 'next/head';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy | PC Builder India</title>
        <meta
          name="description"
          content="Privacy policy, affiliate disclosure, and data usage terms for PC Builder India."
        />
      </Head>
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="mb-4 text-sm text-gray-700">
            We collect limited usage information to improve build recommendations, pricing relevance,
            and user experience for visitors in India.
          </p>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">What We Collect</h2>
          <p className="mb-4 text-sm text-gray-700">
            We may process page-view analytics, click events on outbound shop links, and basic browser
            metadata. We do not intentionally collect sensitive personal data through this website.
          </p>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Cookies and Consent</h2>
          <p className="mb-4 text-sm text-gray-700">
            Cookies may be used for analytics and affiliate attribution. You can accept or reject
            optional cookies using the consent banner shown on the website.
          </p>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Affiliate Disclosure</h2>
          <p className="mb-4 text-sm text-gray-700">
            This website participates in affiliate programs and may earn a commission when you buy
            through links on this site, at no extra cost to you.
          </p>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Third-Party Services</h2>
          <p className="mb-4 text-sm text-gray-700">
            Product pricing and availability data may be fetched from third-party services and stores
            including Amazon, Flipkart, and other Indian retailers.
          </p>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Contact</h2>
          <p className="text-sm text-gray-700">
            For privacy requests, contact the site owner through the official support channel.
          </p>
        </div>
      </main>
    </>
  );
}
