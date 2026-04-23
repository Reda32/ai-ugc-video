import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/context';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Sitevora AI Video',
  description: 'AI-powered face swap video generation platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
