import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ res, req }) => {
  const host = req.headers.host || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

  const content = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`;

  res.setHeader('Content-Type', 'text/plain');
  res.write(content);
  res.end();

  return { props: {} };
};

export default function Robots() {
  return null;
}
