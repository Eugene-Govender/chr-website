import { useState } from 'react'
import { motion } from 'framer-motion'
import { AnimatedButton } from './AnimatedButton'

const MIN_CHARS = 20

export default function QuestionForm({ questions, onSubmit, candidateName }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState(() => questions.map(() => ''))
  const [reviewing, setReviewing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const currentAnswer = answers[step] || ''
  const isValid = currentAnswer.trim().length >= MIN_CHARS
  const isLast = step === questions.length - 1

  const updateAnswer = (value) => {
    const next = [...answers]
    next[step] = value
    setAnswers(next)
  }

  const handleNext = () => {
    if (!isValid) return
    if (isLast) {
      setReviewing(true)
    } else {
      setStep(step + 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError('')
    const payload = questions.map((q, i) => ({
      question: q,
      answer: answers[i].trim(),
    }))
    try {
      await onSubmit(payload)
    } catch (err) {
      setSubmitting(false)
      const detail = err.response?.data?.detail
      setSubmitError(
        typeof detail === 'string'
          ? detail
          : 'Submission failed. Please try again or contact admin@chrconsulting.co.za',
      )
    }
  }

  if (submitting) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-12 h-12 border-4 border-primary border-t-accent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-primary font-semibold">Submitting your application...</p>
        <p className="text-gray-500 text-sm mt-2">This may take up to a minute</p>
      </div>
    )
  }

  if (reviewing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8"
      >
        <h2 className="text-2xl font-bold text-primary mb-2">Review Your Answers</h2>
        <p className="text-gray-500 mb-6">
          Hi {candidateName}, please confirm before submitting your complete application
          (CV + screening questions).
        </p>
        {submitError && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 mb-6 text-sm">
            {submitError}
          </div>
        )}
        <div className="space-y-6 mb-8 max-h-96 overflow-y-auto">
          {questions.map((q, i) => (
            <div key={q} className="border-b pb-4">
              <p className="font-semibold text-primary text-sm mb-1">Q{i + 1}. {q}</p>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{answers[i]}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-4">
          <AnimatedButton type="button" variant="ghost" className="flex-1" onClick={() => setReviewing(false)}>
            Back to Edit
          </AnimatedButton>
          <AnimatedButton type="button" className="flex-1" onClick={handleSubmit}>
            Submit Application
          </AnimatedButton>
        </div>
      </motion.div>
    )
  }

  const progress = ((step + 1) / questions.length) * 100

  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8"
    >
      <p className="text-sm text-gray-500 mb-4">
        Complete all questions to submit your application to CHR Consulting.
      </p>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Question {step + 1} of {questions.length}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <p className="text-primary font-bold text-lg mb-4">
        {step + 1}. {questions[step]}
      </p>

      <textarea
        value={currentAnswer}
        onChange={(e) => updateAnswer(e.target.value)}
        rows={5}
        className="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-accent focus:border-accent outline-none resize-y min-h-[100px]"
        placeholder="Type your answer here (minimum 20 characters)..."
      />
      <p className={`text-sm mt-2 ${isValid ? 'text-success' : 'text-gray-400'}`}>
        {currentAnswer.length} characters {isValid ? '✓' : `(minimum ${MIN_CHARS})`}
      </p>

      <div className="flex gap-4 mt-6">
        <AnimatedButton
          type="button"
          variant="ghost"
          className="flex-1"
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
        >
          Previous
        </AnimatedButton>
        <AnimatedButton
          type="button"
          className="flex-1"
          disabled={!isValid}
          onClick={handleNext}
        >
          {isLast ? 'Review & Submit' : 'Next →'}
        </AnimatedButton>
      </div>
    </motion.div>
  )
}
