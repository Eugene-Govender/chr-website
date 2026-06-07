import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

export const DEFAULT_STATS = {
  candidates_in_network: '296+',
  client_retention: '92%',
  industries_served: '6',
  years_experience: '15+',
}

const STAT_CONFIG = [
  { key: 'candidates_in_network', label: 'Candidates Placed' },
  { key: 'client_retention', label: 'Client Retention' },
  { key: 'industries_served', label: 'Industries Served' },
  { key: 'years_experience', label: 'Years in Business' },
]

function parseNumber(value) {
  if (!value) return 0
  const num = parseInt(String(value).replace(/[^0-9]/g, ''), 10)
  return Number.isNaN(num) ? 0 : num
}

function resolveStats(stats) {
  return {
    ...DEFAULT_STATS,
    ...stats,
    candidates_in_network:
      stats?.candidates_in_network ??
      stats?.candidates_placed ??
      DEFAULT_STATS.candidates_in_network,
  }
}

function StatCard({ value, label, animate }) {
  const numericTarget = parseNumber(value)
  const suffix = String(value || '').replace(/[0-9]/g, '')
  const [display, setDisplay] = useState(numericTarget > 0 ? numericTarget : null)

  useEffect(() => {
    setDisplay(numericTarget > 0 ? numericTarget : null)
    if (!animate || numericTarget <= 0) return undefined

    let start = 0
    const duration = 1500
    const step = Math.max(1, Math.floor(numericTarget / (duration / 16)))
    const timer = setInterval(() => {
      start += step
      if (start >= numericTarget) {
        setDisplay(numericTarget)
        clearInterval(timer)
      } else {
        setDisplay(start)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [animate, numericTarget])

  const shown =
    numericTarget > 0 && animate && display !== null
      ? `${display}${suffix}`
      : String(value)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={animate ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="bg-white/10 backdrop-blur rounded-xl p-6 text-center border border-accent/20"
    >
      <div className="text-3xl sm:text-4xl font-bold text-accent mb-2">{shown}</div>
      <div className="text-gray-300 text-sm font-medium">{label}</div>
    </motion.div>
  )
}

export default function Stats({ stats }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const resolved = resolveStats(stats)

  return (
    <section ref={ref} className="bg-primary py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-3">
          Trusted Expertise, <span className="text-accent">Lasting Partnerships</span>
        </h2>
        <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          Deep HR experience across South Africa&apos;s key industries, backed by a strong candidate network and long-term client relationships.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STAT_CONFIG.map(({ key, label }) => (
            <StatCard
              key={key}
              value={resolved[key]}
              label={label}
              animate={inView}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
