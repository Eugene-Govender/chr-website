import { motion } from 'framer-motion'
import { AnimatedButton, AnimatedLink } from '../components/AnimatedButton'

const IMPACT_CARDS = [
  {
    icon: '📚',
    title: 'Empowering Graduates',
    desc: 'Equipping HR and business graduates with the practical skills, industry exposure, and confidence needed to become truly employment-ready professionals.',
  },
  {
    icon: '🏢',
    title: 'Supporting Organisations',
    desc: 'Helping South African businesses find motivated, capable talent that grows with their teams — reducing turnover and building long-term value.',
  },
  {
    icon: '🌍',
    title: 'Building the Economy',
    desc: "Every successful placement is a contribution to South Africa's economic growth and the reduction of graduate unemployment.",
  },
]

const VISION_PILLARS = [
  { icon: '🎯', title: 'Specialist Excellence', desc: 'Deep expertise in every sector we serve' },
  { icon: '🚀', title: 'Technology-Driven', desc: 'Smarter, faster processes for candidates and clients' },
  { icon: '🤝', title: 'Human First', desc: 'Every placement treated as a career-defining moment' },
  { icon: '🌱', title: 'Graduate Development', desc: 'Actively growing the next generation of professionals' },
]

export default function OurVision() {
  return (
    <div>
      <section className="bg-primary text-white pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-bold mb-4"
          >
            Our Vision
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-300 text-lg sm:text-xl"
          >
            Building the future of HR talent in South Africa
          </motion.p>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">Where We Started</h2>
          <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
            <p>
              CHR Consulting was born from a recognition of a critical gap in the South African job
              market — talented HR and business graduates with the academic foundation but limited
              practical exposure needed to launch successful careers.
            </p>
            <p>
              We saw an opportunity not just to recruit, but to actively develop and bridge that gap
              — connecting motivated graduates and professionals with organisations willing to invest
              in growing talent.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">The South African Opportunity</h2>
          <div className="space-y-6 text-gray-700 leading-relaxed text-lg mb-12">
            <p>
              South Africa continues to face a significant graduate employment challenge. Many
              graduates possess strong theoretical knowledge but limited practical experience —
              creating a disconnect between what employers need and what the market offers.
            </p>
            <p>
              CHR Consulting exists to close that gap. We work with both candidates and clients to
              build meaningful, lasting employment relationships that benefit individuals, businesses,
              and the broader economy.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {IMPACT_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <div className="text-3xl mb-3">{card.icon}</div>
                <h3 className="font-bold text-primary mb-2">{card.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">Our Vision for the Future</h2>
          <div className="space-y-6 text-gray-700 leading-relaxed text-lg mb-12 max-w-3xl mx-auto">
            <p>
              We are building CHR Consulting into South Africa&apos;s most trusted specialist
              recruitment partner — known not just for filling roles, but for transforming careers
              and building exceptional teams.
            </p>
            <p>
              Our goal is to expand our industry coverage, deepen our graduate development programmes,
              and leverage technology to make the recruitment process faster, fairer, and more human.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VISION_PILLARS.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="text-center p-5 rounded-xl border border-gray-100 bg-background"
              >
                <div className="text-3xl mb-2">{pillar.icon}</div>
                <h3 className="font-bold text-primary text-sm mb-2">{pillar.title}</h3>
                <p className="text-gray-600 text-xs leading-relaxed">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-primary text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Be Part of the Story</h2>
          <p className="text-gray-300 mb-10 leading-relaxed">
            Whether you are a candidate looking for your next step or an organisation building your
            dream team — CHR Consulting is your partner.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AnimatedLink to="/jobs">View Open Positions</AnimatedLink>
            <AnimatedButton
              type="button"
              variant="outline"
              onClick={() => { window.location.href = 'mailto:admin@chrconsulting.co.za' }}
            >
              Contact Us
            </AnimatedButton>
          </div>
        </div>
      </section>
    </div>
  )
}
