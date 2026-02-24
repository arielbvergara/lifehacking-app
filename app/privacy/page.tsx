import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Privacy Policy | Lifehacking',
  description: 'Learn how Lifehacking collects, uses, and protects your personal information.',
  alternates: {
    canonical: 'https://lifehackbuddy.com/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-600 mb-8">
            Last Updated: February 18, 2026
          </p>

          <div className="prose prose-gray max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to Lifehacking (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using Lifehacking, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Information We Collect
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                2.1 Information You Provide
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you create an account or use our services, we may collect:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Email address</li>
                <li>Name</li>
                <li>Account credentials (managed through Firebase Authentication)</li>
                <li>Profile information you choose to provide</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                2.2 Automatically Collected Information
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you access our services, we automatically collect:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Device information (browser type, operating system)</li>
                <li>IP address and general location data</li>
                <li>Usage data (pages visited, time spent, features used)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                2.3 Local Storage
              </h3>
              <p className="text-gray-700 leading-relaxed">
                For users who browse without an account, we store favorite tips locally in your browser using local storage. This data remains on your device and is not transmitted to our servers unless you create an account and choose to sync your favorites.
              </p>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Create and manage your account</li>
                <li>Personalize your experience</li>
                <li>Save and sync your favorite tips across devices</li>
                <li>Communicate with you about updates, security alerts, and support</li>
                <li>Monitor and analyze usage patterns to improve our platform</li>
                <li>Detect, prevent, and address technical issues and security threats</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            {/* Third-Party Services */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Third-Party Services
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the following third-party services that may collect information about you:
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                4.1 Firebase Authentication (Google)
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use Firebase Authentication to manage user accounts and authentication. Firebase may collect and process your email address, authentication credentials, and related metadata. For more information, see Google&apos;s Privacy Policy at{' '}
                <a href="https://policies.google.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  https://policies.google.com/privacy
                </a>
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                4.2 Sentry.io
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use Sentry for error tracking and performance monitoring. Sentry may collect technical information about errors, crashes, and performance issues, including device information, browser data, and error logs. This helps us identify and fix technical problems. For more information, see Sentry&apos;s Privacy Policy at{' '}
                <a href="https://sentry.io/privacy/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  https://sentry.io/privacy/
                </a>
              </p>
            </section>

            {/* Cookies and Tracking */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Cookies and Tracking Technologies
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to track activity on our service and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Types of cookies we use:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for authentication and basic functionality</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how you use our service</li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. How We Share Your Information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf (Firebase, Sentry)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>With Your Consent:</strong> When you explicitly agree to share your information</li>
              </ul>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Data Security
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Encryption of data in transit using HTTPS</li>
                <li>Secure authentication through Firebase</li>
                <li>Regular security assessments and monitoring</li>
                <li>Access controls and authentication requirements</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.
              </p>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. Your Privacy Rights
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Opt-Out:</strong> Opt out of certain data processing activities</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                To exercise these rights, please contact us at arielbvergara@gmail.com. We will respond to your request within 30 days.
              </p>
            </section>

            {/* Data Retention */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                9. Data Retention
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy. When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal, regulatory, or security purposes.
              </p>
            </section>

            {/* Children's Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                10. Children&apos;s Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us, and we will delete such information.
              </p>
            </section>

            {/* International Users */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                11. International Data Transfers
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that are different from the laws of your country. We take appropriate safeguards to ensure that your personal information remains protected in accordance with this Privacy Policy.
              </p>
            </section>

            {/* Changes to Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                12. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                13. Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>Lifehacking</strong>
                </p>
                <p className="text-gray-700 mb-2">
                  Email: <a href="mailto:arielbvergara@gmail.com" className="text-primary hover:underline">arielbvergara@gmail.com</a>
                </p>
                <p className="text-gray-700">
                  Address: [Company Address]
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
