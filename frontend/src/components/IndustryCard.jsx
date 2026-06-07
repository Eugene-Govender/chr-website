import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { countJobsForIndustry } from '../data/industries'

export default function IndustryCard({ industry, index = 0, jobs = [] }) {
  const openCount = countJobsForIndustry(jobs, industry)
  const rolesPreview = industry.roles.slice(0, 3).join(' · ')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -6 }}
      className="group h-full"
    >
      <Link
        to={`/jobs?industry=${industry.id}`}
        className="block h-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-accent hover:shadow-lg hover:shadow-primary/10 focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <motion.span
            className="text-3xl"
            whileHover={{ scale: 1.15, rotate: -6 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            {industry.icon}
          </motion.span>
          {openCount > 0 && (
            <span className="shrink-0 bg-accent/15 text-accent text-xs font-bold px-2.5 py-1 rounded-full">
              {openCount} open
            </span>
          )}
        </div>

        <h3 className="font-bold text-primary text-base sm:text-lg mb-2 group-hover:text-primary">
          {industry.name}
        </h3>

        <p className="text-gray-600 text-sm leading-relaxed mb-4 min-h-[3rem]">
          {industry.description}
        </p>

        <p className="text-gray-400 text-xs mb-4 line-clamp-2 group-hover:text-gray-500">
          <span className="font-medium text-gray-500">Typical roles:</span> {rolesPreview}
        </p>

        <span className="inline-flex items-center gap-1 text-accent font-semibold text-sm group-hover:gap-2 transition-all duration-300">
          {openCount > 0 ? 'Browse open roles' : 'View all positions'}
          <span aria-hidden>→</span>
        </span>
      </Link>
    </motion.div>
  )
}
