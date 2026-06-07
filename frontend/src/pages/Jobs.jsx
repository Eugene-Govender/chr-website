import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { API_BASE_URL } from '../config'
import JobCard from '../components/JobCard'
import { AnimatedButton } from '../components/AnimatedButton'
import { fadeInUp } from '../components/AnimatedButton'
import {
  INDUSTRIES,
  filterJobsByIndustry,
  filterJobsBySearch,
  getIndustryById,
} from '../data/industries'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-6" />
      <div className="h-10 bg-gray-200 rounded w-32" />
    </div>
  )
}

export default function Jobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const industryId = searchParams.get('industry')
  const activeIndustry = getIndustryById(industryId)

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/jobs`)
      .then((res) => setJobs(res.data))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (industryId && activeIndustry) {
      setSearch('')
    }
  }, [industryId, activeIndustry])

  const filtered = useMemo(() => {
    if (activeIndustry) {
      return filterJobsByIndustry(jobs, activeIndustry.id)
    }
    return filterJobsBySearch(jobs, search)
  }, [jobs, search, activeIndustry])

  const clearIndustryFilter = () => {
    setSearchParams({})
    setSearch('')
  }

  return (
    <div className="pt-28 pb-16 px-4 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.h1 {...fadeInUp} className="text-3xl font-bold text-primary mb-2">
          Open Positions
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 mb-8"
        >
          Find your next career opportunity with CHR Consulting
        </motion.p>

        {activeIndustry && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-white border border-accent/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <p className="text-sm text-gray-500 mb-1">Filtered by industry</p>
              <p className="font-bold text-primary">
                {activeIndustry.icon} {activeIndustry.name}
              </p>
              <p className="text-gray-600 text-sm mt-1">{activeIndustry.description}</p>
            </div>
            <AnimatedButton type="button" variant="secondary" className="shrink-0" onClick={clearIndustryFilter}>
              Show all jobs
            </AnimatedButton>
          </motion.div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {INDUSTRIES.map((ind) => (
            <button
              key={ind.id}
              type="button"
              onClick={() => setSearchParams(industryId === ind.id ? {} : { industry: ind.id })}
              className={`text-sm px-3 py-1.5 rounded-full border transition-all duration-200 ${
                industryId === ind.id
                  ? 'bg-primary text-white border-accent shadow-md ring-1 ring-accent/40'
                  : 'bg-white text-primary border-gray-200 hover:border-accent hover:shadow-sm'
              }`}
            >
              {ind.icon} {ind.name}
            </button>
          ))}
        </div>

        <motion.input
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          whileFocus={{ boxShadow: '0 0 0 3px rgba(201,168,76,0.35)' }}
          type="search"
          placeholder="Search by job title..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            if (e.target.value.trim()) {
              setSearchParams({})
            }
          }}
          className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-3 mb-4 outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        <p className="text-gray-500 text-sm mb-8">
          Showing {filtered.length} open position{filtered.length !== 1 ? 's' : ''}
          {activeIndustry ? ` in ${activeIndustry.name}` : ''}
        </p>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="text-5xl mb-4">📭</div>
            <h2 className="text-xl font-bold text-primary mb-2">
              {activeIndustry
                ? `No open ${activeIndustry.name} roles right now`
                : 'No open positions at the moment'}
            </h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {activeIndustry
                ? 'Try another industry or send your CV — we match candidates across all sectors.'
                : "We're always looking for great talent. Send your CV to admin@chrconsulting.co.za"}
            </p>
            {activeIndustry && (
              <AnimatedButton type="button" variant="secondary" onClick={clearIndustryFilter}>
                View all positions
              </AnimatedButton>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((job, index) => (
              <JobCard
                key={job.id}
                job={job}
                index={index}
                onViewDetails={(id) => navigate(`/jobs/${id}`)}
                onApply={(id) => navigate(`/apply/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
