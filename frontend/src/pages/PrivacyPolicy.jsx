import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { scrollToTop } from '../utils/scroll'

function Section({ number, title, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      className="scroll-mt-28"
    >
      <div className="flex items-start gap-4 mb-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
          {number}
        </span>
        <h2 className="text-2xl font-bold text-primary pt-1">{title}</h2>
      </div>
      <div className="pl-0 sm:pl-14 space-y-4 text-gray-700 leading-relaxed">{children}</div>
    </motion.section>
  )
}

function HighlightBox({ title, children }) {
  return (
    <div className="rounded-xl border-2 border-accent bg-background p-6">
      {title ? <h3 className="mb-3 font-bold text-primary">{title}</h3> : null}
      <div className="space-y-2 text-gray-700">{children}</div>
    </div>
  )
}

export default function PrivacyPolicy() {
  return (
    <div>
      <Helmet>
        <title>Privacy Policy — CHR Consulting</title>
        <meta
          name="description"
          content="CHR Consulting Privacy Policy. How we collect, use, store, and protect your personal information under POPIA."
        />
      </Helmet>

      <section className="bg-primary text-white pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-bold mb-4"
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-300 text-lg sm:text-xl"
          >
            CHR Consulting — Protection of Personal Information
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-6 inline-flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm text-gray-300"
          >
            <span className="rounded-full border border-accent/50 bg-white/10 px-4 py-1.5">
              Last Updated: June 2026
            </span>
            <span className="rounded-full border border-white/20 px-4 py-1.5">Version: 1.0</span>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto space-y-14">
          <Section number="1" title="Who We Are">
            <p>
              CHR Consulting is a specialist recruitment agency registered and operating in South
              Africa.
            </p>
            <HighlightBox title="CHR Consulting">
              <p>
                <strong>Registered Name:</strong> CHR Consulting
              </p>
              <p>
                <strong>Website:</strong>{' '}
                <a
                  href="https://www.chrconsulting.co.za"
                  className="text-accent hover:underline"
                >
                  www.chrconsulting.co.za
                </a>
              </p>
              <p>
                <strong>Email:</strong>{' '}
                <a href="mailto:admin@chrconsulting.co.za" className="text-accent hover:underline">
                  admin@chrconsulting.co.za
                </a>
              </p>
              <p>
                <strong>Phone:</strong> +27 64 908 3151
              </p>
            </HighlightBox>
            <p>
              As a recruitment agency, CHR Consulting acts as a Responsible Party under the
              Protection of Personal Information Act 4 of 2013 (POPIA). We are committed to
              protecting your personal information and processing it lawfully, fairly, and
              transparently.
            </p>
          </Section>

          <Section number="2" title="Information We Collect">
            <div>
              <h3 className="font-semibold text-primary mb-2">2.1 Information you provide directly</h3>
              <p className="mb-2">
                When you apply for a position through our website, we collect:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Full name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>
                  Curriculum Vitae (CV) document including employment history, qualifications, and
                  skills
                </li>
                <li>Responses to screening questions</li>
                <li>Declaration of accuracy and consent records</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">2.2 Information collected automatically</h3>
              <p className="mb-2">When you visit our website we may collect:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent</li>
                <li>Referring website</li>
                <li>Device type and operating system</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">2.3 Cookies</h3>
              <p>
                Our website currently uses essential cookies only, required for the website to
                function correctly. We may in future implement additional cookies for analytics and
                performance purposes. When we do, we will update this policy and request your consent
                where required by law.
              </p>
              <p className="mt-3 mb-2">Types of cookies we may use in future:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Essential cookies:</strong> required for website functionality
                </li>
                <li>
                  <strong>Analytics cookies:</strong> to understand how visitors use our website
                  (e.g. Google Analytics)
                </li>
                <li>
                  <strong>Preference cookies:</strong> to remember your settings
                </li>
              </ul>
              <p className="mt-3">
                You can control cookies through your browser settings. Disabling essential cookies
                may affect website functionality.
              </p>
            </div>
          </Section>

          <Section number="3" title="How We Use Your Information">
            <p>We use your personal information for the following lawful purposes:</p>
            <div>
              <h3 className="font-semibold text-primary mb-2">3.1 Recruitment processing</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Assessing your suitability for advertised positions</li>
                <li>Matching your profile to current and future opportunities</li>
                <li>Conducting initial screening and compatibility assessments</li>
                <li>Generating interview questions relevant to your experience</li>
                <li>Communicating with you regarding your application</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">3.2 Business operations</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Maintaining accurate recruitment records</li>
                <li>Reporting to clients on candidate pipelines</li>
                <li>Complying with legal and regulatory obligations</li>
                <li>Improving our recruitment processes and services</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">3.3 We will NEVER</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Sell your personal information to third parties</li>
                <li>Use your information for unsolicited marketing without your consent</li>
                <li>Share your information with clients without informing you first</li>
                <li>Process your information for purposes incompatible with recruitment</li>
              </ul>
            </div>
          </Section>

          <Section number="4" title="How We Share Your Information">
            <div>
              <h3 className="font-semibold text-primary mb-2">4.1 With clients</h3>
              <p>
                We may share your CV and assessment results with client companies for positions you
                have applied for. We will always inform you before sharing your information with a
                specific client.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">4.2 With service providers</h3>
              <p className="mb-3">
                We use the following trusted third-party services to operate our platform. Each
                processes your data only as necessary to provide their service:
              </p>
              <ul className="space-y-3">
                <li>
                  <strong>Anthropic (Claude AI):</strong> CV screening and assessment processing.
                  Data processed under Anthropic&apos;s privacy policy at{' '}
                  <a
                    href="https://www.anthropic.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    anthropic.com/privacy
                  </a>
                </li>
                <li>
                  <strong>Railway:</strong> Cloud hosting and data storage —{' '}
                  <a
                    href="https://railway.app/legal/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    railway.app/legal/privacy
                  </a>
                </li>
                <li>
                  <strong>Cloudflare:</strong> Website security and performance —{' '}
                  <a
                    href="https://www.cloudflare.com/privacypolicy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    cloudflare.com/privacypolicy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">4.3 Legal requirements</h3>
              <p>
                We may disclose your information where required by South African law, court order, or
                regulatory authority.
              </p>
            </div>
          </Section>

          <Section number="5" title="Data Storage and Security">
            <div>
              <h3 className="font-semibold text-primary mb-2">5.1 Where we store your data</h3>
              <p>
                Your personal information is stored on secure cloud servers hosted by Railway,
                located in data centres that comply with international security standards. Your data
                may be processed outside of South Africa in accordance with POPIA&apos;s conditions
                for cross-border transfers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">5.2 How we protect your data</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>All data transmitted via HTTPS encryption (SSL/TLS)</li>
                <li>Database access restricted to authorised systems only</li>
                <li>Regular security monitoring and updates</li>
                <li>Access controls limiting who can view personal data</li>
                <li>DDoS protection via Cloudflare</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">5.3 Data retention</h3>
              <p className="mb-2">We retain your personal information for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Active applications:</strong> for the duration of the recruitment process
                </li>
                <li>
                  <strong>Unsuccessful applications:</strong> 12 months from date of application
                </li>
                <li>
                  <strong>Talent pool candidates (with consent):</strong> 24 months
                </li>
                <li>
                  <strong>After retention period:</strong> securely deleted
                </li>
              </ul>
            </div>
          </Section>

          <Section number="6" title="Your Rights Under POPIA">
            <p>As a data subject under POPIA, you have the right to:</p>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-primary">6.1 Right of Access</h3>
                <p>
                  Request confirmation of whether we hold your personal information and obtain a
                  copy of that information.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-primary">6.2 Right to Correction</h3>
                <p>
                  Request correction of inaccurate, misleading, or incomplete personal information we
                  hold about you.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-primary">6.3 Right to Deletion</h3>
                <p>
                  Request deletion of your personal information where we no longer have a lawful
                  basis to retain it.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-primary">6.4 Right to Object</h3>
                <p>
                  Object to the processing of your personal information in certain circumstances.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-primary">6.5 Right to Withdraw Consent</h3>
                <p>
                  Where processing is based on your consent, withdraw that consent at any time.
                  Withdrawal does not affect the lawfulness of processing before withdrawal.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-primary">6.6 Right to Lodge a Complaint</h3>
                <p className="mb-3">
                  Lodge a complaint with the Information Regulator of South Africa if you believe
                  your rights have been violated:
                </p>
                <HighlightBox title="Information Regulator (South Africa)">
                  <p>
                    <strong>Website:</strong>{' '}
                    <a
                      href="https://www.inforegulator.org.za"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      inforegulator.org.za
                    </a>
                  </p>
                  <p>
                    <strong>Email:</strong>{' '}
                    <a href="mailto:inforeg@justice.gov.za" className="text-accent hover:underline">
                      inforeg@justice.gov.za
                    </a>
                  </p>
                  <p>
                    <strong>Phone:</strong> 010 023 5207
                  </p>
                </HighlightBox>
              </div>
            </div>
          </Section>

          <Section number="7" title="Automated Decision Making">
            <p>
              Our website uses an automated screening system to assess CV compatibility with
              advertised positions. This system generates a compatibility score and screening
              questions.
            </p>
            <p className="font-semibold text-primary">Important disclosures:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Automated scores are an initial screening guide only</li>
              <li>No application is rejected solely based on an automated score</li>
              <li>
                All applications are reviewed by a qualified human recruitment consultant
              </li>
              <li>You have the right to request human review of any automated assessment</li>
              <li>The automated system does not make final hiring decisions</li>
            </ul>
            <p>
              To request human review of your assessment, contact us at{' '}
              <a href="mailto:admin@chrconsulting.co.za" className="text-accent hover:underline">
                admin@chrconsulting.co.za
              </a>
            </p>
          </Section>

          <Section number="8" title="Children's Privacy">
            <p>
              Our services are intended for individuals who are 18 years of age or older. We do not
              knowingly collect personal information from persons under 18. If you believe we have
              inadvertently collected information from a minor, please contact us immediately at{' '}
              <a href="mailto:admin@chrconsulting.co.za" className="text-accent hover:underline">
                admin@chrconsulting.co.za
              </a>{' '}
              and we will delete it promptly.
            </p>
          </Section>

          <Section number="9" title="Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our
              practices, technology, legal requirements, or for other operational reasons.
            </p>
            <p className="mb-2">When we make material changes we will:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Update the &ldquo;Last Updated&rdquo; date at the top of this page</li>
              <li>Where appropriate, notify you by email</li>
              <li>Where required by law, request fresh consent</li>
            </ul>
            <p>
              We encourage you to review this policy periodically. Continued use of our website
              after changes constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section number="10" title="Contact Us">
            <p>
              For any privacy-related queries, requests, or complaints, please contact our
              Information Officer:
            </p>
            <HighlightBox title="CHR Consulting — Information Officer">
              <p>
                <strong>Email:</strong>{' '}
                <a href="mailto:admin@chrconsulting.co.za" className="text-accent hover:underline">
                  admin@chrconsulting.co.za
                </a>
              </p>
              <p>
                <strong>Phone:</strong> +27 64 908 3151
              </p>
              <p>
                <strong>Website:</strong>{' '}
                <a
                  href="https://www.chrconsulting.co.za"
                  className="text-accent hover:underline"
                >
                  www.chrconsulting.co.za
                </a>
              </p>
            </HighlightBox>
            <p>
              We will respond to all requests within 30 days in accordance with POPIA requirements.
            </p>
          </Section>

          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-primary px-6 py-3 font-semibold text-primary transition hover:bg-primary hover:text-white"
            >
              ↑ Back to top
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
