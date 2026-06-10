import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { AnimatedButton } from './AnimatedButton'

function scoreColor(score) {
  if (score >= 75) return '#2ECC71'
  if (score >= 60) return '#C9A84C'
  return '#E74C3C'
}

function scoreLabel(score) {
  if (score >= 75) return 'Strong Match'
  if (score >= 65) return 'Good Match'
  if (score >= 60) return 'Possible Match'
  return 'Below Threshold'
}

export default function ScoreDisplay({ scoreData, onProceed }) {
  const score = scoreData?.score ?? 0
  const [animatedScore, setAnimatedScore] = useState(0)
  const color = scoreColor(score)
  const hasQuestions = (scoreData?.questions?.length ?? 0) > 0

  useEffect(() => {
    let current = 0
    const timer = setInterval(() => {
      current += 1
      if (current >= score) {
        setAnimatedScore(score)
        clearInterval(timer)
      } else {
        setAnimatedScore(current)
      }
    }, 20)
    return () => clearInterval(timer)
  }, [score])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8"
    >
      <div className="flex flex-col items-center mb-8">
        <div className="w-40 h-40 mb-4">
          <CircularProgressbar
            value={animatedScore}
            text={`${animatedScore}%`}
            styles={buildStyles({
              textSize: '22px',
              pathColor: color,
              textColor: color,
              trailColor: '#E5E7EB',
            })}
          />
        </div>
        <p className="text-xl font-bold text-primary">{scoreLabel(score)}</p>
        <p className="text-gray-500 text-sm mt-1">{scoreData?.recommendation}</p>
      </div>

      {scoreData?.analysis && (
        <p className="text-gray-600 mb-6 text-center">{scoreData.analysis}</p>
      )}

      {scoreData?.matched?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <h4 className="font-semibold text-primary mb-2">Matched</h4>
          <ul className="space-y-1">
            {scoreData.matched.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-success">✓</span> {item}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {scoreData?.gaps?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h4 className="font-semibold text-primary mb-2">Areas to Explore</h4>
          <ul className="space-y-1">
            {scoreData.gaps.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-orange-500">⚠</span> {item}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      <div className="border border-gray-200 bg-gray-50 rounded-lg p-4 text-sm text-gray-600 mb-4">
        This compatibility assessment is intended as an initial screening guide only
        and does not constitute a final evaluation of your suitability for this role.
        CHR Consulting reserves the right to consider all applications on their
        individual merits regardless of screening outcomes.
      </div>

      {hasQuestions && score >= 60 && (
        <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 text-sm text-gray-700 mb-6">
          <p className="font-semibold text-primary mb-1">One more step to submit</p>
          <p>
            Your CV has been reviewed, but your application is <strong>not yet submitted</strong>.
            Please answer all screening questions on the next screens to complete your
            application (about 10 minutes in total).
          </p>
        </div>
      )}

      {hasQuestions && score >= 60 && (
        <AnimatedButton type="button" variant="primary-full" onClick={onProceed}>
          Continue to Screening Questions →
        </AnimatedButton>
      )}
    </motion.div>
  )
}
