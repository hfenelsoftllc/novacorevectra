import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import Image from 'next/image';
import '../src/styles/globals.css';
import logo from '../src/images/NCV-Logo-Web.png'

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NovaCoreVectra - AI Consulting & Governance',
  description: 'Leading AI consulting and governance solutions for enterprise. Empowering organizations to lead the AI era through ethical innovation and world-class strategy.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-900 text-white`}>
        {/* Simplified Header */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-700 bg-slate-800/95 backdrop-blur">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white p-1">
                  <Image 
                    src={logo} 
                    alt="NovaCoreVectra Logo" 
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <a href="/" className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
                  NovaCoreVectra
                </a>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <a href="/" className="text-white hover:text-blue-400 transition-colors">Home</a>
                <a href="/services" className="text-white hover:text-blue-400 transition-colors">Services</a>
                <a href="/governance" className="text-white hover:text-blue-400 transition-colors">Governance</a>
                <a href="/about" className="text-white hover:text-blue-400 transition-colors">About</a>
                <a href="/contact" className="text-white hover:text-blue-400 transition-colors">Contact</a>
              </nav>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button className="text-white hover:text-blue-400">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-white">Loading...</div></div>}>
            {children}
          </Suspense>
        </main>

        {/* Simplified Footer */}
        <footer className="bg-slate-800/50 border-t border-slate-700 mt-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="mb-4 flex items-center justify-center space-x-3">
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white p-1">
                  <Image 
                    src={logo} 
                    alt="NovaCoreVectra Logo" 
                    fill
                    className="object-contain"
                  />
                </div>
                <a href="/" className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
                  NovaCoreVectra
                </a>
              </div>
              <p className="text-white text-sm mb-4">
                Leading AI consulting and governance solutions for enterprise.
              </p>
              <div className="flex justify-center space-x-6 mb-4">
                <a href="/" className="text-white hover:text-blue-400 text-sm transition-colors">Home</a>
                <a href="/services" className="text-white hover:text-blue-400 text-sm transition-colors">Services</a>
                <a href="/governance" className="text-white hover:text-blue-400 text-sm transition-colors">Governance</a>
                <a href="/about" className="text-white hover:text-blue-400 text-sm transition-colors">About</a>
                <a href="/contact" className="text-white hover:text-blue-400 text-sm transition-colors">Contact</a>
              </div>
              <p className="text-slate-400 text-xs">
                © {new Date().getFullYear()} NovaCoreVectra. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}