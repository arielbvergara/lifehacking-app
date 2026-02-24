import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SocialLinks } from '@/components/shared/social-links';

export const metadata: Metadata = {
  title: 'Contact Us | Lifehacking',
  description: 'Get in touch with the Lifehacking team. We\'d love to hear from you!',
  alternates: {
    canonical: 'https://lifehackbuddy.com/contact',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions, suggestions, or feedback? We&apos;d love to hear from you!
            </p>
          </div>

          {/* Contact Information */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Email Section */}
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Email Us
                  </h2>
                  <p className="text-gray-600 mb-3">
                    Send us an email and we&apos;ll get back to you as soon as possible.
                  </p>
                  <a
                    href="mailto:arielbvergara@gmail.com"
                    className="text-primary hover:underline font-medium"
                  >
                    arielbvergara@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Person Section */}
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Contact Person
                  </h2>
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium text-gray-900">Ariel Vergara</span>
                  </p>
                  <p className="text-gray-600">
                    Founder & Lead Developer
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="bg-gradient-to-r from-[#e8f5e8] to-[#f0f9f0] rounded-lg p-8 mb-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Follow Us on Social Media
              </h2>
              <p className="text-gray-700 mb-6">
                Stay connected and get the latest tips and updates
              </p>
              <div className="flex justify-center">
                <SocialLinks />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              We Value Your Feedback
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto mb-6">
              Whether you have a question about our tips, want to suggest new content, report an issue, or just want to say hello, we&apos;re here to help. Your feedback helps us improve and provide better content for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:arielbvergara@gmail.com?subject=Feedback for Lifehacking"
                className="inline-block px-6 py-3 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-colors"
              >
                Send Feedback
              </a>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-white text-gray-900 font-semibold rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors"
              >
                Browse Tips
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
