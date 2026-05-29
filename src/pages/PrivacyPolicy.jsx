import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-gray-800 mb-3">{title}</h2>
    <div className="text-gray-600 leading-relaxed space-y-2">{children}</div>
  </div>
);

const PrivacyPolicy = () => {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: May 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">

          <p className="text-gray-600 leading-relaxed mb-8">
            At Mentra, we are committed to protecting your privacy and handling your personal information with care. This Privacy Policy explains how we collect, use, store, and protect your data when you use our platform.
          </p>

          <Section title="1. Information We Collect">
            <p>We collect the following types of information:</p>
            <p className="font-medium text-gray-700 mt-2">Account Information</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Full name, email address, phone number</li>
              <li>Date of birth and age</li>
              <li>Profile photo (optional)</li>
              <li>Password (stored in encrypted form)</li>
            </ul>
            <p className="font-medium text-gray-700 mt-3">For Healthcare Professionals</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Medical license number and credentials</li>
              <li>Specialization and years of experience</li>
              <li>Hospital or clinic name and location</li>
              <li>License documents uploaded for verification</li>
            </ul>
            <p className="font-medium text-gray-700 mt-3">Usage Information</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Appointment history and session details</li>
              <li>Messages and communications on the platform</li>
              <li>Reviews and ratings submitted</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use your information to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Create and manage your account</li>
              <li>Facilitate appointment booking between patients and doctors</li>
              <li>Send appointment reminders and notifications</li>
              <li>Verify healthcare professional credentials</li>
              <li>Improve our platform and services</li>
              <li>Respond to your support requests</li>
              <li>Comply with legal obligations</li>
            </ul>
          </Section>

          <Section title="3. How We Share Your Information">
            <p>We do not sell your personal information to third parties. We may share your information in the following limited circumstances:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>With healthcare professionals you book appointments with</li>
              <li>With service providers who help us operate the platform (e.g., email services)</li>
              <li>When required by law or legal process</li>
              <li>To protect the rights and safety of our users</li>
            </ul>
            <p>When you book an appointment, your name, contact details, and reason for visit are shared with the relevant doctor to facilitate your care.</p>
          </Section>

          <Section title="4. Data Security">
            <p>We implement industry-standard security measures to protect your personal information, including:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Encryption of passwords using bcrypt hashing</li>
              <li>Secure HTTPS connections for all data transmission</li>
              <li>JWT-based authentication for session management</li>
              <li>Regular security reviews of our systems</li>
            </ul>
            <p>While we take reasonable precautions, no system is completely secure. We encourage you to use a strong, unique password for your account.</p>
          </Section>

          <Section title="5. Data Retention">
            <p>We retain your personal information for as long as your account is active or as needed to provide services. When you delete your account:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Your profile information is anonymized</li>
              <li>Your email is replaced with a deleted identifier</li>
              <li>Past appointment records are anonymized for record-keeping purposes</li>
              <li>You may re-register with the same email address after deletion</li>
            </ul>
          </Section>

          <Section title="6. Your Rights">
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Access the personal information we hold about you</li>
              <li>Update or correct your information through your profile settings</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of non-essential communications</li>
              <li>Request a copy of your data</li>
            </ul>
            <p>To exercise any of these rights, please contact us at support@mentra.com.</p>
          </Section>

          <Section title="7. Cookies">
            <p>Mentra uses local storage and session tokens to keep you logged in and remember your preferences. We do not use third-party tracking cookies.</p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>Mentra is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that a minor has registered, we will promptly delete their account.</p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on the platform or sending an email. Your continued use of Mentra after changes are posted constitutes your acceptance of the updated policy.</p>
          </Section>

          <Section title="10. Contact Us">
            <p>If you have any questions or concerns about this Privacy Policy or how we handle your data, please contact us:</p>
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

export default PrivacyPolicy;
