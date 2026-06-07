import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const spring = { type: 'spring', stiffness: 400, damping: 22 }

const baseHover =
  'transition-all duration-200 hover:ring-2 hover:ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'

const variants = {
  primary:
    `${baseHover} bg-accent text-primary font-semibold shadow-md shadow-accent/20 hover:shadow-xl hover:shadow-accent/40 hover:ring-accent/70 hover:brightness-105`,
  secondary:
    `${baseHover} border-2 border-primary text-primary font-semibold bg-white hover:bg-primary hover:text-white hover:ring-primary/40 hover:shadow-lg`,
  outline:
    `${baseHover} border-2 border-white text-white font-semibold hover:bg-white/15 backdrop-blur-sm hover:ring-white/60 hover:shadow-lg hover:shadow-white/10`,
  ghost:
    `${baseHover} border border-gray-300 text-primary font-medium hover:bg-primary/5 hover:border-primary/30 hover:ring-primary/25 hover:shadow-sm`,
  'primary-full':
    `${baseHover} w-full bg-accent text-primary font-semibold shadow-md shadow-accent/20 hover:shadow-xl hover:shadow-accent/40 hover:ring-accent/70 hover:brightness-105`,
}

const motionProps = {
  whileHover: { scale: 1.05, y: -3 },
  whileTap: { scale: 0.96, y: 0 },
  transition: spring,
}

export function AnimatedButton({
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <motion.button
      {...motionProps}
      disabled={disabled}
      whileHover={disabled ? {} : motionProps.whileHover}
      whileTap={disabled ? {} : motionProps.whileTap}
      className={`inline-flex items-center justify-center px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:ring-0 disabled:hover:shadow-none ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export function AnimatedLink({
  children,
  variant = 'primary',
  className = '',
  to,
  ...props
}) {
  return (
    <motion.div {...motionProps} className="inline-block">
      <Link
        to={to}
        className={`inline-flex items-center justify-center px-6 py-3 rounded-lg ${variants[variant] || variants.primary} ${className}`}
        {...props}
      >
        {children}
      </Link>
    </motion.div>
  )
}

export const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
}

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
}

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
}

export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
}
