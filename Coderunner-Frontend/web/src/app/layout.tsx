import type {Metadata} from 'next';
import { Rajdhani, Fira_Code, Orbitron } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import { AudioProvider } from '@/contexts/AudioContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Font configurations
const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fira',
  display: 'swap',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-orbitron',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Code Runner',
  description: 'An online Python compiler for learning and practice.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('neural-theme') || 'light';
                document.documentElement.classList.toggle('dark', theme === 'dark');
              })();
            `,
          }}
        />
      </head>
      <body className={`${rajdhani.variable} ${firaCode.variable} ${orbitron.variable} font-rajdhani antialiased bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300`}>
        <AuthProvider>
          <ThemeProvider>
            <AudioProvider>
              {children}
              <Toaster />
            </AudioProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
