import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'

const SECTIONS = [
  {
    title: 'Information We Collect',
    body:
      'When you apply for a position through our website, we collect your name, email address, phone number, and CV document. This information is used solely for recruitment purposes.',
  },
  {
    title: 'How We Use Your Information',
    body:
      'Your personal information is used to assess your suitability for open positions and to contact you regarding your application. We do not sell or share your personal information with third parties.',
  },
  {
    title: 'Your Rights Under POPIA',
    body:
      'In accordance with the Protection of Personal Information Act (POPIA), you have the right to access, correct, or request deletion of your personal information. Contact us at admin@chrconsulting.co.za to exercise these rights.',
  },
  {
    title: 'Data Retention',
    body:
      'We retain your personal information for a period of 12 months after your application. After this period, your data is securely deleted unless you have given consent for us to retain it for future opportunities.',
  },
]

export default function Privacy() {
  return (
    <div>
      <Helmet>
        <title>Privacy Policy — CHR Consulting</title>
        <meta
          name="description"
          content="CHR Consulting privacy policy and POPIA compliance. How we collect, use, and protect your personal information when you apply for positions."
        />
      </Helmet>
      <section className="bg-primary text-white pt-32 pb-20 px-4">
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
            POPIA Compliance — CHR Consulting
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-gray-400 text-sm mt-4"
          >
            Last updated: June 2026
          </motion.p>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto space-y-12">
          {SECTIONS.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <h2 className="text-2xl font-bold text-primary mb-4">{section.title}</h2>
              <p className="text-gray-700 leading-relaxed text-lg">{section.body}</p>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-primary mb-4">Contact</h2>
            <ul className="text-gray-700 leading-relaxed text-lg space-y-2">
              <li>
                <a
                  href="mailto:admin@chrconsulting.co.za"
                  className="text-accent hover:underline"
                >
                  admin@chrconsulting.co.za
                </a>
              </li>
              <li>+27 64 908 3151</li>
            </ul>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
