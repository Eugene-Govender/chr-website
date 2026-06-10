import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import axios from 'axios'
import { API_BASE_URL } from '../config'
import Stats, { DEFAULT_STATS } from '../components/Stats'
import IndustryCard from '../components/IndustryCard'
import { INDUSTRIES } from '../data/industries'
import { AnimatedButton, AnimatedLink, fadeInUp } from '../components/AnimatedButton'

const STEPS = [
  { icon: '🔍', title: 'Browse Roles', desc: 'Explore our current open positions' },
  { icon: '📄', title: 'Upload Your CV', desc: 'Submit your CV for the role that fits you' },
  { icon: '⚡', title: 'Instant Assessment', desc: 'Receive an immediate compatibility check' },
  { icon: '💬', title: 'Answer Questions', desc: 'Complete a brief screening questionnaire' },
  {
    icon: '✅',
    title: 'Submitted to Admin',
    desc: 'Your CV and question answers are sent to our recruitment team for review',
  },
]

const TESTIMONIALS = [
  {
    text: 'CHR Consulting placed me in my dream role within 2 weeks. The process was seamless and professional.',
    author: 'Priya N., Financial Analyst, Cape Town',
    initials: 'PN',
    avatarBg: '#0D9488',
  },
  {
    text: 'I was impressed by how quickly they understood my experience and matched me to the perfect opportunity.',
    author: 'Michael T., HR Manager, Johannesburg',
    initials: 'MT',
    avatarBg: '#1B2B4B',
  },
  {
    text: 'Professional, efficient, and genuinely invested in finding the right fit. Highly recommend CHR Consulting.',
    author: 'Fatima K., Compliance Officer, Durban',
    initials: 'FK',
    avatarBg: '#C9A84C',
  },
]

export default function Home() {
  const [stats, setStats] = useState(null)
  const [jobs, setJobs] = useState([])
  const [jobCount, setJobCount] = useState(null)

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/stats`)
      .then((res) => setStats(res.data))
      .catch(() => setStats(DEFAULT_STATS))
    axios
      .get(`${API_BASE_URL}/api/jobs`)
      .then((res) => {
        setJobs(res.data)
        setJobCount(Array.isArray(res.data) ? res.data.length : null)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const orgData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'CHR Consulting',
      url: 'https://www.chrconsulting.co.za',
      logo: 'https://www.chrconsulting.co.za/logo-dark.png',
      description:
        'Specialist recruitment agency connecting exceptional talent with leading organisations across South Africa',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'ZA',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+27-64-908-3151',
        contactType: 'customer service',
        email: 'admin@chrconsulting.co.za',
      },
      sameAs: ['https://www.chrconsulting.co.za'],
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = 'org-structured-data'
    script.text = JSON.stringify(orgData)
    document.head.appendChild(script)

    return () => {
      document.getElementById('org-structured-data')?.remove()
    }
  }, [])

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const badgeText =
    jobCount !== null
      ? `✦ ${jobCount} Positions Available Now`
      : '✦ Positions Available Now'

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>CHR Consulting — Recruitment Agency South Africa</title>
        <meta
          name="description"
          content="CHR Consulting connects exceptional talent with leading organisations across South Africa. Specialist recruitment in HR, Finance, Payroll, Compliance and more."
        />
      </Helmet>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-[#0D1829] text-white overflow-hidden pt-20">
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-accent rounded-full"
              style={{ left: `${(i * 17) % 100}%`, top: `${(i * 23) % 100}%` }}
              animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block mb-6 px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-semibold border border-accent/40 animate-pulse"
          >
            {badgeText}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
          >
            Find Your Next{' '}
            <span className="text-accent">Opportunity</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 text-lg sm:text-xl mb-10 max-w-2xl mx-auto"
          >
            CHR Consulting connects exceptional talent with leading organisations across South
            Africa. Your next opportunity is closer than you think.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <AnimatedButton type="button" onClick={() => scrollTo('jobs-section')}>
              Browse Open Positions
            </AnimatedButton>
            <AnimatedButton type="button" variant="outline" onClick={() => scrollTo('how-it-works')}>
              Learn How It Works
            </AnimatedButton>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="text-gray-400 text-sm mt-8 max-w-xl mx-auto"
          >
            ⚡ Instant compatibility check · 📋 No lengthy forms · 🤝 Personal recruiter follow-up
          </motion.p>
        </div>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-accent text-2xl"
        >
          ↓
        </motion.div>
      </section>

      <Stats stats={stats} />

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            {...fadeInUp}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-primary text-center mb-16"
          >
            Your Journey to the Right Role
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 relative">
            <div
              className="hidden lg:block absolute top-4 left-[10%] right-[10%] border-t-2 border-dotted border-accent/60 z-0"
              aria-hidden
            />
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
                className="text-center relative z-10 rounded-xl p-4 transition-all duration-200 hover:border hover:border-accent/40 hover:shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center mx-auto mb-3">
                  {i + 1}
                </div>
                <motion.div
                  className="text-4xl mb-3 inline-block"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  {step.icon}
                </motion.div>
                <h3 className="font-bold text-primary mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-primary text-center mb-3"
          >
            Industries We Serve
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 text-center max-w-2xl mx-auto mb-12"
          >
            Specialist recruitment across six core sectors. Select an industry to browse matching open roles.
          </motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {INDUSTRIES.map((ind, i) => (
              <IndustryCard key={ind.id} industry={ind} index={i} jobs={jobs} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-primary text-center mb-12">What Our Candidates Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(27,43,75,0.12)' }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="bg-background rounded-xl p-6 shadow-md"
              >
                <p className="text-gray-700 mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                <p className="text-accent text-sm mb-4">⭐⭐⭐⭐⭐</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ backgroundColor: t.avatarBg }}
                  >
                    {t.initials}
                  </div>
                  <p className="text-primary font-semibold text-sm">{t.author}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Jobs preview + CTA */}
      <section id="jobs-section" className="py-20 px-4 bg-primary text-white text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold mb-4"
        >
          Ready to Take the Next Step?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-gray-300 mb-8 max-w-xl mx-auto"
        >
          Explore our open positions and start your application today.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <AnimatedLink to="/jobs">View Open Positions</AnimatedLink>
        </motion.div>
      </section>
    </div>
  )
}

