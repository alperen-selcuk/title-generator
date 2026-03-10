import './globals.css';

export const metadata = {
  title: 'LinkedIn Title Generator',
  description: 'Generate professional LinkedIn titles with Gemini AI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}