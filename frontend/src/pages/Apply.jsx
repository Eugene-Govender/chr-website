import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import { API_BASE_URL } from '../config'
import { AnimatedButton, AnimatedLink } from '../components/AnimatedButton'
import ScoreDisplay from '../components/ScoreDisplay'
import QuestionForm from '../components/QuestionForm'

const STATES = {
  FORM: 'form',
  ANALYSING: 'analysing',
  RESULTS: 'results',
  INTERVIEW: 'interview',
  COMPLETE: 'complete',
}

const ANALYSIS_STEPS = [
  'CV received',
  'Extracting information...',
  'Checking requirements...',
  'Calculating compatibility...',
]

function emailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function Apply() {
  const { spec_id } = useParams()
  const [state, setState] = useState(STATES.FORM)
  const [job, setJob] = useState(null)
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' })
  const [cvFile, setCvFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [formError, setFormError] = useState('')
  const [consentPopia, setConsentPopia] = useState(false)
  const [consentAccuracy, setConsentAccuracy] = useState(false)
  const [consentError, setConsentError] = useState('')
  const [analysisStep, setAnalysisStep] = useState(0)
  const [result, setResult] = useState(null)

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/jobs/${spec_id}`).then((res) => setJob(res.data)).catch(() => {})
  }, [spec_id])

  const handleFile = (file) => {
    setFileError('')
    if (!file) {
      setCvFile(null)
      return
    }
    const ext = file.name.toLowerCase()
    if (!ext.endsWith('.pdf') && !ext.endsWith('.docx')) {
      setFileError('Only PDF and DOCX files are accepted')
      setCvFile(null)
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError('File must be 5MB or smaller')
      setCvFile(null)
      return
    }
    setCvFile(file)
  }

  const onDrop = (e) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  const submitForm = async (e) => {
    e.preventDefault()
    setFormError('')
    setConsentError('')
    if (!consentPopia || !consentAccuracy) {
      setConsentError('Please accept both declarations to continue')
      return
    }
    if (!form.full_name.trim() || !form.email.trim() || !form.phone.trim()) {
      setFormError('Please fill in all required fields')
      return
    }
    if (!emailValid(form.email)) {
      setFormError('Please enter a valid email address')
      return
    }
    if (!cvFile) {
      setFormError('Please upload your CV')
      return
    }

    setState(STATES.ANALYSING)
    setAnalysisStep(0)

    const stepTimer = setInterval(() => {
      setAnalysisStep((s) => Math.min(s + 1, ANALYSIS_STEPS.length - 1))
    }, 2000)

    try {
      const data = new FormData()
      data.append('full_name', form.full_name.trim())
      data.append('email', form.email.trim())
      data.append('phone', form.phone.trim())
      data.append('spec_id', spec_id)
      data.append('cv_file', cvFile)
      data.append('consent_popia', 'true')
      data.append('consent_timestamp', new Date().toISOString())

      const res = await axios.post(`${API_BASE_URL}/api/apply`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      clearInterval(stepTimer)
      setResult(res.data)

      if (res.data.status === 'duplicate') {
        setFormError(res.data.message)
        setState(STATES.FORM)
        return
      }
      setState(STATES.RESULTS)
    } catch (err) {
      clearInterval(stepTimer)
      setFormError(err.response?.data?.detail || 'Something went wrong. Please try again.')
      setState(STATES.FORM)
    }
  }

  const submitAnswers = async (answers) => {
    await axios.post(
      `${API_BASE_URL}/api/submit-answers`,
      {
        submission_id: result.submission_id,
        candidate_name: result.candidate_name || form.full_name,
        role_title: result.role_title || job?.title,
        cv_text: result.cv_text,
        job_spec_text: result.job_spec_text,
        answers,
      },
      { timeout: 120000 },
    )
    setState(STATES.COMPLETE)
  }

  if (state === STATES.ANALYSING) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <div className="font-serif text-3xl font-bold text-primary mb-1">CHR</div>
          <div className="text-accent text-xs tracking-[0.25em] mb-10">CONSULTING</div>
          <div className="w-14 h-14 border-4 border-primary border-t-accent rounded-full animate-spin mx-auto mb-8" />
          <ul className="text-left space-y-3 mb-8">
            {ANALYSIS_STEPS.map((step, i) => (
              <li key={step} className={`flex items-center gap-2 ${i <= analysisStep ? 'text-primary' : 'text-gray-400'}`}>
                <span>{i < analysisStep ? '✅' : i === analysisStep ? '⏳' : '○'}</span>
                {step}
              </li>
            ))}
          </ul>
          <p className="text-gray-500 text-sm">This takes about 20-30 seconds</p>
        </div>
      </div>
    )
  }

  if (state === STATES.COMPLETE) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-background px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-lg"
        >
          <div className="text-6xl text-success mb-6">✓</div>
          <h1 className="text-3xl font-bold text-primary mb-4">Application Received!</h1>
          <p className="text-gray-600 mb-2">
            Thank you {result?.candidate_name || form.full_name}. Our recruitment team will
            review your complete application and be in touch within 3 business days.
          </p>
          <p className="text-gray-500 mb-8">In the meantime, explore other opportunities.</p>
          <AnimatedLink to="/jobs">Browse Other Positions</AnimatedLink>
          <div className="mt-10 text-sm text-gray-500">
            <p>admin@chrconsulting.co.za · +27 64 908 3151</p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (state === STATES.INTERVIEW && result?.questions?.length) {
    return (
      <div className="pt-28 pb-16 px-4 bg-background min-h-screen">
        <QuestionForm
          questions={result.questions}
          candidateName={result.candidate_name || form.full_name}
          onSubmit={submitAnswers}
        />
      </div>
    )
  }

  if (state === STATES.RESULTS && result) {
    if (result.status === 'below_requirements' || result.gate1_passed === false) {
      return (
        <div className="pt-28 pb-16 px-4 min-h-screen bg-background flex items-center justify-center">
          <div className="max-w-lg bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-primary mb-4">
              Thank you for applying, {form.full_name || result.candidate_name}.
            </h2>
            <p className="text-gray-600 mb-4">
              After reviewing your application, your profile does not currently meet the
              minimum requirements for this specific role.
            </p>
            <p className="text-gray-600 mb-8">
              We encourage you to check back for future opportunities or send your CV
              directly to admin@chrconsulting.co.za
            </p>
            <AnimatedLink to="/jobs" className="px-6 py-3">
              Browse Other Roles
            </AnimatedLink>
          </div>
        </div>
      )
    }

    const score = result.score ?? 0
    if (score < 60) {
      return (
        <div className="pt-28 pb-16 px-4 min-h-screen bg-background flex items-center justify-center">
          <div className="max-w-lg bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-primary mb-4">Thank you for applying</h2>
            <p className="text-gray-600 mb-8">
              Our team will review your application and be in touch.
            </p>
            <AnimatedLink to="/jobs" className="px-6 py-3">
              Browse Other Roles
            </AnimatedLink>
          </div>
        </div>
      )
    }

    return (
      <div className="pt-28 pb-16 px-4 bg-background min-h-screen">
        <ScoreDisplay
          scoreData={result}
          onProceed={() => setState(STATES.INTERVIEW)}
        />
      </div>
    )
  }

  return (
    <div className="pt-28 pb-16 px-4 min-h-screen bg-background">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-2">Apply for Role</h1>
        <p className="text-gray-600 mb-8">{job?.title || 'Loading role...'}</p>

        {formError && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 mb-6">{formError}</div>
        )}

        <form onSubmit={submitForm} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Phone Number *</label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">CV Upload *</label>
            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-accent transition cursor-pointer"
            >
              <input
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                id="cv-upload"
                onChange={(e) => handleFile(e.target.files[0])}
              />
              <label htmlFor="cv-upload" className="cursor-pointer">
                <div className="text-3xl mb-2">📄</div>
                <p className="text-gray-600">Drag & drop your CV here, or click to browse</p>
                <p className="text-gray-400 text-sm mt-1">PDF or DOCX, max 5MB</p>
              </label>
              {cvFile && (
                <p className="mt-3 text-primary font-medium text-sm">
                  {cvFile.name} ({(cvFile.size / 1024).toFixed(0)} KB)
                </p>
              )}
              {fileError && <p className="mt-2 text-red-600 text-sm">{fileError}</p>}
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentPopia}
                onChange={(e) => {
                  setConsentPopia(e.target.checked)
                  setConsentError('')
                }}
                className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-accent focus:ring-accent"
              />
              <span className="text-sm text-gray-500 leading-relaxed">
                I consent to CHR Consulting collecting, storing and processing my personal
                information for recruitment purposes in accordance with the{' '}
                <Link to="/privacy" className="text-accent hover:underline">
                  Protection of Personal Information Act (POPIA)
                </Link>
                . I understand my information will be kept for up to 12 months.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentAccuracy}
                onChange={(e) => {
                  setConsentAccuracy(e.target.checked)
                  setConsentError('')
                }}
                className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-accent focus:ring-accent"
              />
              <span className="text-sm text-gray-500 leading-relaxed">
                I confirm that all information provided in this application, including my CV and
                personal details, is accurate, complete and true to the best of my knowledge. I
                understand that any misrepresentation may result in my application being
                disqualified.
              </span>
            </label>

            {consentError && (
              <p className="text-red-600 text-sm">{consentError}</p>
            )}
          </div>

          <AnimatedButton
            type="submit"
            variant="primary-full"
            disabled={!consentPopia || !consentAccuracy}
            className={
              !consentPopia || !consentAccuracy
                ? '!bg-gray-300 !text-gray-500 !shadow-none hover:!brightness-100'
                : ''
            }
          >
            Analyse My CV →
          </AnimatedButton>
        </form>
      </div>
    </div>
  )
}
