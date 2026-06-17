import { motion } from 'framer-motion'
import { AnimatedButton } from './AnimatedButton'

function parseClosingDate(value) {
  if (!value) return null
  const raw = String(value).trim().slice(0, 10)
  const formats = ['%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y', '%Y/%m/%d']
  for (const fmt of formats) {
    const parts = fmt
      .replace('%Y', '(\\d{4})')
      .replace('%m', '(\\d{1,2})')
      .replace('%d', '(\\d{1,2})')
    const re = new RegExp(`^${parts}$`)
    const match = raw.match(re)
    if (match) {
      const order = fmt.includes('%Y-%m') ? [1, 2, 3] : [3, 2, 1]
      const y = parseInt(match[order[0]], 10)
      const m = parseInt(match[order[1]], 10) - 1
      const d = parseInt(match[order[2]], 10)
      const date = new Date(y, m, d)
      if (!Number.isNaN(date.getTime())) return date
    }
  }
  const fallback = new Date(raw)
  return Number.isNaN(fallback.getTime()) ? null : fallback
}

function isClosingSoon(closingDate) {
  const date = parseClosingDate(closingDate)
  if (!date) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const limit = new Date(today)
  limit.setDate(limit.getDate() + 7)
  return date >= today && date <= limit
}

export default function JobCard({ job, onViewDetails, onApply, onShare, index = 0 }) {
  const closingSoon = isClosingSoon(job.closing_date)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, boxShadow: '0 24px 48px rgba(27,43,75,0.18)' }}
      className="bg-white rounded-xl shadow-md p-6 flex flex-col relative transition-shadow duration-300 border-l-4 border-accent"
    >
      {job.urgent && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.06 + 0.2, type: 'spring', stiffness: 500 }}
          className="absolute top-4 right-4 bg-accent/15 text-accent text-xs font-bold px-3 py-1 rounded-full"
        >
          URGENT
        </motion.span>
      )}
      <h3 className="text-primary font-bold text-lg pr-20 mb-3">{job.title}</h3>
      {job.salary_range && (
        <p className="text-gray-600 text-sm mb-1 flex items-center gap-1.5">
          <span className="text-accent font-bold text-base leading-none">R</span>
          {job.salary_range}
        </p>
      )}
      <p className="text-gray-500 text-sm mb-6 flex flex-wrap items-center gap-2">
        <span>📅 {job.closing_date || 'Open until filled'}</span>
        {closingSoon && (
          <span className="text-orange-600 bg-orange-50 text-xs font-semibold px-2 py-0.5 rounded-full">
            ⚠️ Closing Soon
          </span>
        )}
      </p>
      <div className="mt-auto flex flex-wrap gap-3">
        {onShare && (
          <AnimatedButton
            type="button"
            variant="secondary"
            className="px-5 py-2.5 text-sm"
            onClick={() => onShare(job)}
          >
            Share ↗
          </AnimatedButton>
        )}
        <AnimatedButton
          type="button"
          variant="secondary"
          className="px-5 py-2.5 text-sm"
          onClick={() => onViewDetails(job.id)}
        >
          View Details
        </AnimatedButton>
        <AnimatedButton
          type="button"
          className="px-5 py-2.5 text-sm"
          onClick={() => onApply(job.id)}
        >
          Apply Now →
        </AnimatedButton>
      </div>
    </motion.div>
  )
}
