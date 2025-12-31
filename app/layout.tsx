import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Crypto Exchange Dashboard',
  description: 'Real-time cryptocurrency and exchange data with offline support',
  keywords: ['crypto', 'cryptocurrency', 'bitcoin', 'exchange', 'dashboard'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
