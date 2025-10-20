import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ApolloProvider } from '@/components/providers/ApolloProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Clear AI v3 - Multi-Agent AI System',
  description: 'A sophisticated multi-agent AI system with real-time streaming and tool execution visualization',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <ApolloProvider>
              {children}
            </ApolloProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}