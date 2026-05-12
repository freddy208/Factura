'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Menu } from 'lucide-react'

export default function Navbar() {
  const [scrollY, setScrollY] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function scrollToSection(id: string) {
    setIsMenuOpen(false)
    setTimeout(() => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const NAV_ITEMS = [
    { label: 'Fonctionnalités', id: 'features' },
    { label: 'Témoignages', id: 'testimonials' },
    { label: 'Tarifs', id: 'pricing' },
    { label: 'Contact', id: 'contact' },
  ]

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 50
            ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/50 shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <Image 
                src="/icon-192.png" 
                alt="Logo Factura" 
                width={36}
                height={36}
                className="w-9 h-9 rounded-xl transition-transform duration-300 group-hover:scale-110"
                priority
              />
              <span className="text-2xl font-black bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
                Factura
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_ITEMS.map(({ label, id }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className="text-slate-600 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:block px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-all duration-200 hover:bg-blue-50 rounded-lg"
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                className="px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm sm:text-base rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                Essai gratuit
              </Link>

              {/* Hamburger */}
              <button
                onClick={() => setIsMenuOpen(prev => !prev)}
                className="md:hidden p-2 rounded-lg hover:bg-blue-50 transition-colors text-blue-600 cursor-pointer"
                aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                type="button"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu — en dehors du nav, overlay complet */}
              {isMenuOpen && (
  <div className="fixed top-20 left-4 right-4 z-50 md:hidden bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
    <div className="px-4 py-3 space-y-1">
      {NAV_ITEMS.map(({ label, id }) => (
        <button
          key={id}
          type="button"
          onClick={() => scrollToSection(id)}
          className="block w-full text-left py-3 px-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors duration-200 rounded-xl"
        >
          {label}
        </button>
      ))}

      <div className="border-t border-slate-100 pt-3 space-y-2">
        <Link
          href="/login"
          onClick={() => setIsMenuOpen(false)}
          className="block text-center py-3 text-slate-700 font-medium hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
        >
          Se connecter
        </Link>
        <Link
          href="/register"
          onClick={() => setIsMenuOpen(false)}
          className="block text-center py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
        >
          Créer un compte gratuit
        </Link>
      </div>
    </div>
  </div>
)}
    </>
  )
}