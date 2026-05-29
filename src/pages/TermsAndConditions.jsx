import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-gray-800 mb-3">{title}</h2>
    <div className="text-gray-600 leading-relaxed space-y-2">{children}</div>
  </div>
);

const TermsAndConditions = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#f0f7f4] to-white py-12 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => window.close()} className="flex items-center gap-2 text-sm text-[#4A7C59] hover:text-[#3d6b4a] mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Close
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
          <p className="text-gray-500 text-sm">Last updated: May 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">

          <p className="text-gray-600 leading-relaxed mb-8">
            Welcome to Mentra. By accessing or using our platform, you agree to be bound by these Terms and Conditions. Please read them carefully before registering or using any of our services.
          </p>

          <Section title="1. Acceptance of Terms">
            <p>By creating an account or using Mentra's services, you confirm that you have read, understood, and agree to these Terms and Conditions. If you do not agree, please do not use our platform.</p>
            <p>We reserve the right to update these terms at any time. Continued use of the platform after changes constitutes acceptance of the revised terms.</p>
          </Section>

          <Section title="2. Eligibility">
            <p>You must be at least 18 years of age to use Mentra. By registering, you confirm that you meet this requirement.</p>
            <p>Healthcare professionals registering on the platform must hold valid, current licenses and credentials as required by applicable laws and regulations.</p>
          </Section>

          <Section title="3. User Accounts">
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.</p>
            <p>You must provide accurate, complete, and up-to-date information during registration and keep your profile information current.</p>
            <p>Each person may only maintain one active account. Creating multiple accounts is prohibited.</p>
          </Section>

          <Section title="4. Healthcare Services">
            <p>Mentra is a platform that connects patients with licensed mental health professionals for in-person therapy sessions. We do not provide medical advice, diagnosis, or treatment directly.</p>
            <p>All healthcare services are provided by independent licensed professionals. Mentra is not responsible for the quality, accuracy, or outcomes of any healthcare services provided through the platform.</p>
            <p>In case of a medical emergency, please contact emergency services (100/102) immediately. Mentra is not an emergency service.</p>
          </Section>

          <Section title="5. Appointments and Cancellations">
            <p>Users are expected to attend scheduled appointments or cancel with reasonable notice. Repeated no-shows may result in account restrictions.</p>
            <p>Doctors are expected to honor confirmed appointments. Cancellations should be communicated to patients as early as possible.</p>
            <p>Session fees and refund policies are determined by individual practitioners and will be communicated at the time of booking.</p>
          </Section>

          <Section title="6. Prohibited Conduct">
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Use the platform for any unlawful purpose</li>
              <li>Harass, abuse, or harm other users or healthcare professionals</li>
              <li>Provide false or misleading information</li>
              <li>Attempt to gain unauthorized access to any part of the platform</li>
              <li>Use the platform to solicit services outside of Mentra</li>
              <li>Share your account credentials with others</li>
            </ul>
          </Section>

          <Section title="7. Intellectual Property">
            <p>All content on the Mentra platform, including text, graphics, logos, and software, is the property of Mentra and is protected by applicable intellectual property laws.</p>
            <p>You may not reproduce, distribute, or create derivative works from our content without explicit written permission.</p>
          </Section>

          <Section title="8. Privacy">
            <p>Your use of Mentra is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices.</p>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>To the fullest extent permitted by law, Mentra shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.</p>
            <p>Our total liability to you for any claims arising from these terms shall not exceed the amount you paid to use our services in the three months preceding the claim.</p>
          </Section>

          <Section title="10. Termination">
            <p>We reserve the right to suspend or terminate your account at any time for violations of these Terms or for any other reason at our discretion.</p>
            <p>You may delete your account at any time through the Settings page, subject to any outstanding obligations (such as upcoming appointments).</p>
          </Section>

          <Section title="11. Governing Law">
            <p>These Terms shall be governed by and construed in accordance with the laws of Nepal. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Nepal.</p>
          </Section>

          <Section title="12. Contact Us">
            <p>If you have any questions about these Terms and Conditions, please contact us at:</p>
            <div className="mt-2 p-4 bg-[#f0f7f4] rounded-xl text-sm">
              <p className="font-medium text-gray-800">Mentra Healthcare Platform</p>
              <p>Email: support@mentra.com</p>
              <p>Address: Kathmandu, Nepal</p>
            </div>
          </Section>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsAndConditions;
