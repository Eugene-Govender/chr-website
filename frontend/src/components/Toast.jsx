import { AnimatePresence, motion } from 'framer-motion'

export default function Toast({ message }) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          key="toast"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-white shadow-lg"
        >
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
