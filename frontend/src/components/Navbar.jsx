import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { scrollToTop } from '../utils/scroll'

function Logo() {
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400 }}>
      <img src="/logo-dark.png" alt="CHR Consulting — Connecting Talent, Empowering Teams" className="h-14 w-auto" />
    </motion.div>
  )
}

function NavLink({ to, children, onClick, className }) {
  return (
    <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
      <Link to={to} className={className} onClick={onClick}>
        {children}
      </Link>
    </motion.div>
  )
}

const NAV_ITEMS = [
  { to: '/', label: 'Home', home: true },
  { to: '/jobs', label: 'Jobs' },
  { to: '/about', label: 'About Us' },
  { to: '/vision', label: 'Our Vision' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleHomeClick = () => {
    scrollToTop()
    setMenuOpen(false)
  }

  const navLink =
    'inline-block px-3 py-2 rounded-lg text-textdark font-medium transition-all duration-200 ' +
    'hover:text-primary hover:bg-primary/8 hover:shadow-sm hover:ring-1 hover:ring-primary/15'

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-md' : 'bg-white shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex-shrink-0 rounded-lg transition-all hover:opacity-90" onClick={handleHomeClick}>
            <Logo />
          </Link>

          <nav className="hidden lg:flex items-center gap-2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={navLink}
                onClick={item.home ? handleHomeClick : undefined}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(0, 51, 102, 0.06)' }}
            whileTap={{ scale: 0.9 }}
            className="lg:hidden p-2 text-primary rounded-lg transition-colors hover:ring-2 hover:ring-primary/20"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden bg-white border-t overflow-hidden"
          >
            <motion.div
              initial="closed"
              animate="open"
              variants={{
                open: { transition: { staggerChildren: 0.06 } },
                closed: {},
              }}
              className="px-4 py-4 flex flex-col gap-2"
            >
              {NAV_ITEMS.map((item) => (
                <motion.div
                  key={item.to}
                  variants={{
                    closed: { opacity: 0, x: -12 },
                    open: { opacity: 1, x: 0 },
                  }}
                >
                  <Link
                    to={item.to}
                    className={`block ${navLink}`}
                    onClick={item.home ? handleHomeClick : () => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
