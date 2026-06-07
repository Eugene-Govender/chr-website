import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import ScrollToTop from './components/ScrollToTop'
import Footer from './components/Footer'
import PageTransition from './components/PageTransition'
import Home from './pages/Home'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import AboutUs from './pages/AboutUs'
import OurVision from './pages/OurVision'
import Apply from './pages/Apply'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          }
        />
        <Route
          path="/jobs"
          element={
            <PageTransition>
              <Jobs />
            </PageTransition>
          }
        />
        <Route
          path="/jobs/:spec_id"
          element={
            <PageTransition>
              <JobDetail />
            </PageTransition>
          }
        />
        <Route
          path="/about"
          element={
            <PageTransition>
              <AboutUs />
            </PageTransition>
          }
        />
        <Route
          path="/vision"
          element={
            <PageTransition>
              <OurVision />
            </PageTransition>
          }
        />
        <Route
          path="/apply/:spec_id"
          element={
            <PageTransition>
              <Apply />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow flex flex-col">
        <AnimatedRoutes />
      </main>
      <Footer />
    </div>
  )
}
