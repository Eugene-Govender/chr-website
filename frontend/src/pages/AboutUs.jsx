import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import IndustryCard from '../components/IndustryCard'
import { INDUSTRIES } from '../data/industries'
import { AnimatedLink } from '../components/AnimatedButton'
import { API_BASE_URL } from '../config'

const WHY_CHR = [
  {
    icon: '🎯',
    title: 'Specialist Focus',
    desc: 'We recruit exclusively in our areas of expertise, ensuring deep knowledge of every role we fill.',
  },
  {
    icon: '⚡',
    title: 'Fast Turnaround',
    desc: 'Our streamlined process means qualified candidates reach clients faster than traditional agencies.',
  },
  {
    icon: '🤝',
    title: 'Personal Service',
    desc: 'Every client and candidate works directly with an experienced consultant — no call centres, no handoffs.',
  },
  {
    icon: '✅',
    title: 'Quality Guaranteed',
    desc: 'We stand behind every placement. Our high retention rate speaks for itself.',
  },
]

export default function AboutUs() {
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/jobs`).then((res) => setJobs(res.data)).catch(() => {})
  }, [])

  return (
    <div>
      <section className="bg-primary text-white pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-bold mb-4"
          >
            About CHR Consulting
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-300 text-lg sm:text-xl"
          >
            Connecting Talent, Empowering Teams across South Africa
          </motion.p>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">Who We Are</h2>
          <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
            <p>
              CHR Consulting is a specialist recruitment agency founded in 2023, dedicated to placing
              exceptional candidates with leading organisations across South Africa.
            </p>
            <p>
              We combine deep industry knowledge with a personalised approach, ensuring the right fit
              for both candidate and client — every time.
            </p>
            <p>
              From our base in South Africa, we serve clients across multiple industries including
              Finance, HR, Payroll, Compliance, Operations, and Executive Management.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-primary text-center mb-12">Why Choose CHR</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {WHY_CHR.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6, boxShadow: '0 12px 28px rgba(27,43,75,0.1)' }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 300 }}
                className="bg-white rounded-xl p-6 shadow-sm transition-shadow duration-300"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-primary mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-primary text-center mb-3">Industries We Serve</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Click an industry to browse roles we are actively recruiting for.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {INDUSTRIES.map((ind, i) => (
              <IndustryCard key={ind.id} industry={ind} index={i} jobs={jobs} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-primary text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Whether you are looking for your next opportunity or searching for top talent, we would
            love to hear from you.
          </p>
          <ul className="space-y-3 text-gray-200 mb-10">
            <li>
              <a href="mailto:admin@chrconsulting.co.za" className="hover:text-accent transition">
                admin@chrconsulting.co.za
              </a>
            </li>
            <li>+27 64 908 3151</li>
            <li>
              <a href="https://www.chrconsulting.co.za" className="hover:text-accent transition">
                www.chrconsulting.co.za
              </a>
            </li>
          </ul>
          <AnimatedLink to="/jobs">View Open Positions</AnimatedLink>
        </div>
      </section>
    </div>
  )
}
