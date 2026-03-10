export const metadata = {
  title: 'LinkedIn Title Generator',
  description: 'Generate creative LinkedIn titles with AI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}