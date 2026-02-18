import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Terms of Service | Lifehacking',
  description: 'Read the Terms of Service for using Lifehacking.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-600 mb-8">
            Last Updated: February 18, 2026
          </p>

          <div className="prose prose-gray max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. Agreement to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to Lifehacking. These Terms of Service govern your access to and use of our website, services, and applications. By accessing or using our Services, you agree to be bound by these Terms and our Privacy Policy.
              </p>
              <p className="text-gray-700 leading-relaxed">
                If you do not agree to these Terms, you may not access or use our Services. We reserve the right to modify these Terms at any time, and your continued use of the Services constitutes acceptance of any changes.
              </p>
            </section>

            {/* Eligibility */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Eligibility
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You must be at least 13 years old to use our Services. By using our Services, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.
              </p>
            </section>

            {/* Account Registration */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. Account Registration and Security
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To access certain features, you may need to create an account. When creating an account, you agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            {/* Use of Services */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Use of Services
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                4.1 Permitted Use
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may use our Services for lawful purposes only. You agree to use the Services only to browse and search for life hacks, save favorites, and access content for personal, non-commercial use.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                4.2 Prohibited Conduct
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon intellectual property rights</li>
                <li>Transmit harmful or inappropriate content</li>
                <li>Attempt unauthorized access to our systems</li>
                <li>Use automated systems without permission</li>
                <li>Impersonate any person or entity</li>
                <li>Use the Services for commercial purposes without authorization</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Intellectual Property Rights
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                5.1 Our Content
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                All content on Lifehacking, including text, graphics, logos, tips, and guides, is the property of Lifehacking and is protected by copyright and trademark laws. The tips and life hacks are curated and created by Lifehacking, and all rights remain our exclusive property.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                5.2 Limited License
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We grant you a limited, non-exclusive, non-transferable license to access and use our Services for personal, non-commercial purposes. This license does not include rights to reproduce, distribute, create derivative works, or use our Content commercially.
              </p>
            </section>

            {/* Disclaimers */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Disclaimers
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                THE SERVICES ARE PROVIDED AS IS WITHOUT WARRANTIES OF ANY KIND. We do not warrant that the Services will be uninterrupted or error-free.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The tips provided are for informational purposes only. We are not responsible for any outcomes, injuries, or losses from following any tips. Use all tips at your own risk.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Limitation of Liability
              </h2>
              <p className="text-gray-700 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, LIFEHACKING SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE SERVICES.
              </p>
            </section>

            {/* Dispute Resolution */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. Dispute Resolution and Arbitration
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                8.1 Informal Resolution
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Before filing a claim, you agree to try to resolve disputes informally by contacting us at arielbvergara@gmail.com. If not resolved within 30 days, you may bring a formal proceeding.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                8.2 Binding Arbitration
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Any dispute shall be resolved by binding arbitration rather than in court, except for small claims court. The arbitrator&apos;s decision will be final and binding.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                8.3 Class Action Waiver
              </h3>
              <p className="text-gray-700 leading-relaxed">
                YOU AND LIFEHACKING AGREE THAT CLAIMS MAY ONLY BE BROUGHT IN INDIVIDUAL CAPACITY, NOT AS PART OF A CLASS ACTION.
              </p>
            </section>

            {/* Third-Party Links */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                9. Third-Party Links and Services
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our Services may contain links to third-party websites or services, including video content from YouTube or Instagram. These links are provided for your convenience only. We do not control, endorse, or assume responsibility for any third-party content, websites, or services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Your use of third-party websites and services is at your own risk and subject to their terms and conditions. We are not responsible for any loss or damage arising from your use of third-party services.
              </p>
            </section>

            {/* User Content */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                10. User Content and Feedback
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Currently, our Services do not allow users to submit or upload content. All tips and content are created and managed by our administrative team. If we introduce user-generated content features in the future, these Terms will be updated accordingly.
              </p>
              <p className="text-gray-700 leading-relaxed">
                If you provide us with feedback, suggestions, or ideas about our Services, you grant us the right to use such feedback without any obligation to compensate you.
              </p>
            </section>

            {/* Indemnification */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                11. Indemnification
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify, defend, and hold harmless Lifehacking and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, or expenses (including reasonable attorneys fees) arising from: (a) your use of the Services; (b) your violation of these Terms; (c) your violation of any rights of another party; or (d) your violation of any applicable laws.
              </p>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                12. Termination
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may terminate or suspend your account and access to the Services immediately, without prior notice, for any reason, including if you breach these Terms. Upon termination, your right to use the Services will immediately cease.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You may terminate your account at any time by contacting us or using the account deletion feature in your profile settings. All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                13. Governing Law
              </h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions. Any legal action or proceeding arising under these Terms will be brought exclusively in the appropriate courts, and you consent to personal jurisdiction and venue therein.
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                14. Changes to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. By continuing to access or use our Services after revisions become effective, you agree to be bound by the revised terms.
              </p>
            </section>

            {/* Severability */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                15. Severability and Waiver
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives to the greatest extent possible under applicable law, and the remaining provisions will continue in full force and effect.
              </p>
              <p className="text-gray-700 leading-relaxed">
                No waiver by Lifehacking of any term or condition shall be deemed a further or continuing waiver of such term or condition or a waiver of any other term or condition.
              </p>
            </section>

            {/* Entire Agreement */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                16. Entire Agreement
              </h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms, together with our Privacy Policy and any other legal notices published by us on the Services, constitute the entire agreement between you and Lifehacking concerning the Services and supersede all prior agreements and understandings.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                17. Contact Information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions about these Terms, please contact us:
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
