import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { API_BASE_URL } from '../config'
import { AnimatedButton } from '../components/AnimatedButton'

export default function JobDetail() {
  const { spec_id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    axios
      .get(`${API_BASE_URL}/api/jobs/${spec_id}`)
      .then((res) => setJob(res.data))
      .catch(() => setError('This position could not be found or is no longer open.'))
      .finally(() => setLoading(false))
  }, [spec_id])

  if (loading) {
    return (
      <div className="pt-28 pb-16 px-4 min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-12 h-12 border-4 border-primary border-t-accent rounded-full mx-auto mb-4"
          />
          <p className="text-primary font-medium">Loading job details...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="pt-28 pb-16 px-4 min-h-screen bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto text-center bg-white rounded-2xl shadow-lg p-8"
        >
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/jobs" className="text-primary font-semibold hover:underline">
            ← Back to all positions
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="pt-28 pb-16 px-4 min-h-screen bg-background">
      <div className="max-w-3xl mx-auto">
        <motion.button
          type="button"
          whileHover={{ x: -4 }}
          onClick={() => navigate('/jobs')}
          className="text-primary font-medium mb-6 hover:underline"
        >
          ← Back to all positions
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <h1 className="text-3xl font-bold text-primary mb-6">{job.title}</h1>

          <div className={`grid gap-4 mb-8 ${job.salary_range ? 'sm:grid-cols-2' : ''}`}>
            {[
              job.salary_range && { label: 'Salary', value: job.salary_range },
              { label: 'Closing Date', value: job.closing_date || 'Open until filled' },
            ]
              .filter(Boolean)
              .map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                whileHover={{ y: -2 }}
                className="bg-background rounded-lg p-4"
              >
                <p className="text-gray-500 text-sm mb-1">{item.label}</p>
                <p className="text-primary font-semibold">{item.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-primary mb-3">Job Specification</h2>
            {job.raw_text ? (
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-background rounded-lg p-5">
                {job.raw_text}
              </div>
            ) : (
              <p className="text-gray-500 italic">Full job specification not available for this role.</p>
            )}
          </div>

          <AnimatedButton type="button" onClick={() => navigate(`/apply/${job.id}`)}>
            Apply for this Role →
          </AnimatedButton>
        </motion.div>
      </div>
    </div>
  )
}
