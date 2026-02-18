import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'About Us | Lifehacking',
  description: 'Learn about Lifehacking - your trusted source for practical daily life tips and tricks to make everyday living easier.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              About Lifehacking
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Making everyday life a little easier, one tip at a time.
            </p>
          </div>

          {/* Mission Section */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              At Lifehacking, we believe that small, practical tips can make a big difference in your daily life. Our mission is to curate and share simple, actionable life hacks that help you save time, reduce stress, and live more efficiently.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Whether you&apos;re looking for kitchen shortcuts, organization tips, wellness advice, or clever solutions to everyday problems, we&apos;re here to help you discover practical tricks that actually work.
            </p>
          </section>

          {/* Vision Section */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Our Vision
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We envision a world where everyone has access to practical knowledge that makes daily tasks easier and more enjoyable. By building a comprehensive library of tested life hacks, we aim to become the go-to resource for anyone looking to simplify their life and discover smarter ways of doing things.
            </p>
          </section>

          {/* What We Offer Section */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              What We Offer
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Curated Tips
                </h3>
                <p className="text-gray-700">
                  Every tip on our platform is carefully selected and organized by category to help you find exactly what you need.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Step-by-Step Guides
                </h3>
                <p className="text-gray-700">
                  Clear, easy-to-follow instructions ensure you can implement any tip successfully, no expert skills required.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Diverse Categories
                </h3>
                <p className="text-gray-700">
                  From cooking and cleaning to productivity and wellness, we cover all aspects of daily life.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Regular Updates
                </h3>
                <p className="text-gray-700">
                  New tips are added regularly to keep our content fresh and relevant to your evolving needs.
                </p>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Our Team
            </h2>
            <p className="text-gray-700 leading-relaxed mb-8">
              Lifehacking is built and maintained by a dedicated team passionate about making everyday life easier for everyone.
            </p>
            
            {/* Team Member Placeholders */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  [Team Member Name]
                </h3>
                <p className="text-gray-600 text-sm">
                  [Role/Title]
                </p>
              </div>

              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  [Team Member Name]
                </h3>
                <p className="text-gray-600 text-sm">
                  [Role/Title]
                </p>
              </div>

              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  [Team Member Name]
                </h3>
                <p className="text-gray-600 text-sm">
                  [Role/Title]
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-gradient-to-r from-[#e8f5e8] to-[#f0f9f0] rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Join Our Community
            </h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Start exploring our collection of life hacks and discover smarter ways to handle everyday tasks.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-colors"
            >
              Explore Tips
            </Link>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
