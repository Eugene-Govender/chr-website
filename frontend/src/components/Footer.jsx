import { Link } from 'react-router-dom'
import { scrollToTop } from '../utils/scroll'

function LogoLight() {
  return (
    <div>
      <img src="/logo-white.png" alt="CHR Consulting — Connecting Talent, Empowering Teams" className="h-12 w-auto" />
    </div>
  )
}

const FOOTER_LINKS = [
  { to: '/', label: 'Home', onClick: scrollToTop },
  { to: '/jobs', label: 'Jobs' },
  { to: '/about', label: 'About Us' },
  { to: '/vision', label: 'Our Vision' },
]

export default function Footer() {
  return (
    <footer className="bg-primary text-white mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <LogoLight />
          </div>
          <div>
            <h3 className="font-semibold text-accent mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              {FOOTER_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="inline-block rounded px-1 -mx-1 transition hover:text-white hover:bg-white/10"
                    onClick={link.onClick}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-accent mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="mailto:admin@chrconsulting.co.za" className="hover:text-white transition">
                  admin@chrconsulting.co.za
                </a>
              </li>
              <li>+27 64 908 3151</li>
              <li>
                <a href="https://www.chrconsulting.co.za" className="hover:text-white transition">
                  www.chrconsulting.co.za
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-10 pt-6 text-center text-gray-400 text-sm">
          © 2026 CHR Consulting. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
