/* eslint-disable @next/next/no-img-element */
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import {
  CheckCircle, Zap, FileText, Users, Receipt, Download, 
  ArrowRight, Star, Sparkles, TrendingUp, Shield, Globe,
  ChevronRight, Menu, X, ArrowUpRight, Mail, Phone, MapPin
} from 'lucide-react'
import Navbar from '@/components/landing/Navbar'
import { tokens } from '@/lib/design-system'

const FEATURES = [
  {
    icon: FileText,
    title: 'Devis en 2 minutes',
    desc: 'Ajoutez vos prestations, sélectionnez votre client et générez un devis professionnel instantanément.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Receipt,
    title: 'Factures automatiques',
    desc: 'Numérotation automatique, calcul TVA, statut de paiement. Tout est géré pour vous.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: Users,
    title: 'Clients organisés',
    desc: "Carnet d'adresses intégré avec historique complet des factures par client.",
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    icon: Download,
    title: 'PDF professionnel',
    desc: 'Téléchargez des PDF au design premium à partager directement avec vos clients.',
    gradient: 'from-orange-500 to-red-500'
  },
]

const PROBLEMS = [
  { emoji: '😤', text: 'Word et Excel prennent 30 minutes pour une facture' },
  { emoji: '😰', text: 'Vos factures manquent de professionnalisme' },
  { emoji: '💸', text: 'Vous perdez des clients faute de crédibilité' },
  { emoji: '🤯', text: "Vous ne savez plus qui vous doit de l'argent" },
]

const TESTIMONIALS = [
  {
    name: 'Armelle K.',
    role: 'Designer freelance, Douala',
    text: 'Je crée mes factures en 2 minutes chrono. Mes clients me paient plus vite.',
    rating: 5,
    avatar: 'AK'
  },
  {
    name: 'Jean-Baptiste M.',
    role: 'Agence web, Yaounde',
    text: "Enfin un outil pensé pour l'Afrique. Le Mobile Money c'est parfait.",
    rating: 5,
    avatar: 'JB'
  },
  {
    name: 'Sophie T.',
    role: 'Consultante RH, Douala',
    text: "Mes devis sont devenus tellement professionnels que j'ai gagné de nouveaux clients.",
    rating: 5,
    avatar: 'ST'
  },
]

const STATS = [
  { number: '300+', label: 'Utilisateurs actifs' },
  { number: '500+', label: 'Factures générées' },
  { number: '3+', label: 'Pays africains' },
  { number: '99.9%', label: 'Uptime garanti' }
]

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)
  
  // Refs pour focus management
  const heroRef = useRef<HTMLElement>(null)
  const featuresRef = useRef<HTMLElement>(null)
  const pricingRef = useRef<HTMLElement>(null)
  const testimonialsRef = useRef<HTMLElement>(null)
  const contactRef = useRef<HTMLElement>(null)

  // Fonction pour gérer le défilement smooth vers les sections
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      // Focus management pour accessibilité
      setTimeout(() => {
        element.focus({ preventScroll: true })
      }, 500)
    }
    setIsMenuOpen(false)
  }

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    const handleScroll = () => setScrollY(window.scrollY)
    
    // Optimized mouse tracking - disabled on mobile and reduced frequency
    let ticking = false
    let lastTime = 0
    const THROTTLE_DELAY = 16 // ~60fps
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking && !isMobile) {
        const now = performance.now()
        if (now - lastTime > THROTTLE_DELAY) {
          requestAnimationFrame(() => {
            setMousePosition({ x: e.clientX, y: e.clientY })
            ticking = false
          })
          lastTime = now
          ticking = true
        }
      }
    }
    
    // Intersection Observer for performance optimization
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Element is visible, enable animations
            entry.target.classList.remove('animate-paused')
          } else {
            // Element is not visible, pause animations
            entry.target.classList.add('animate-paused')
          }
        })
      },
      { threshold: 0.1 }
    )
    
    // Observe animated elements
    const animatedElements = document.querySelectorAll('.animate-pulse, .animate-bounce')
    animatedElements.forEach(el => observer.observe(el))
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (!isMobile) {
        window.removeEventListener('mousemove', handleMouseMove)
      }
      window.removeEventListener('resize', checkMobile)
      observer.disconnect()
    }
  }, [isMobile])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50" role="application">
      {/* Animated Background - Optimized for mobile */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        {!isMobile && (
          <>
            <div 
              className="absolute w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"
              style={{
                left: `${mousePosition.x * 0.05}px`,
                top: `${mousePosition.y * 0.05}px`,
                willChange: 'transform',
              }}
            />
            <div 
              className="absolute w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse"
              style={{
                right: `${-mousePosition.x * 0.03}px`,
                bottom: `${-mousePosition.y * 0.03}px`,
                willChange: 'transform',
              }}
            />
          </>
        )}
      </div>

      <Navbar />

            {/* Hero Section Magnifique - Mobile Optimized */}
      <section 
        ref={heroRef}
        className="relative pt-32 pb-20 px-6 overflow-hidden safe-area-padding"
        role="banner"
        aria-labelledby="hero-heading"
        tabIndex={0}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50" aria-hidden="true" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            {/* Badge Premium */}
            <div 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 text-blue-700 text-sm font-bold px-6 py-3 rounded-full mb-8 backdrop-blur-sm animate-bounce"
              role="status"
              aria-live="polite"
            >
              <Sparkles size={16} className="text-yellow-500" aria-hidden="true" />
              <span className="hidden sm:inline">Conçu pour l&apos;Afrique francophone</span>
              <span className="sm:hidden">Afrique francophone</span>
              <ChevronRight size={16} className="animate-pulse" aria-hidden="true" />
            </div>

            {/* Titre Premium avec Gradient - Mobile Optimized */}
            <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight mb-6 sm:mb-8">
              <span className="block bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent animate-gradient">
                Créez des devis et
              </span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
                factures professionnels
              </span>
              <span className="block text-3xl sm:text-4xl lg:text-5xl xl:text-6xl" style={{color: tokens.colors.gray[700]}}>
                en <span style={{color: tokens.colors.primary[600]}} className="font-black">2 minutes</span>
              </span>
            </h1>

            {/* Description Premium - Mobile Optimized */}
            <p className="text-lg sm:text-xl lg:text-2xl max-w-4xl mx-auto mb-8 sm:mb-12 leading-relaxed font-medium" style={{color: tokens.colors.gray[600]}}>
              Gagnez du temps, soyez payé plus vite et inspirez confiance à vos clients.
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                Pensé pour les freelances, PME et agences au Cameroun et en Afrique.
              </span>
            </p>

            {/* CTA Premium - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 sm:mb-12">
              <Link
                href="/register"
                className="group relative px-6 py-4 sm:px-8 sm:py-5 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-4"
                style={{background: `linear-gradient(135deg, ${tokens.colors.primary[600]}, ${tokens.colors.secondary[600]})`}}
                role="button"
                aria-label="Créer votre compte Factura gratuitement"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                  <span className="text-sm sm:text-base">Créer mon compte</span>
                  <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" aria-hidden="true" />
                </span>
                <div 
                  className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                  style={{background: `linear-gradient(135deg, ${tokens.colors.primary[700]}, ${tokens.colors.secondary[700]})`}}
                />
              </Link>
              <Link
                href="/login"
                className="group relative px-6 py-4 sm:px-8 sm:py-5 backdrop-blur-sm border-2 font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-4"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderColor: tokens.colors.gray[200],
                  color: tokens.colors.gray[700]
                }}
                role="button"
                aria-label="Voir une démonstration de Factura"
              >
                <span className="flex items-center justify-center gap-2 sm:gap-3">
                  <span className="text-sm sm:text-base">Voir demo</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </span>
              </Link>
            </div>

            {/* Trust Indicators - Mobile Optimized */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium" style={{color: tokens.colors.gray[500]}}>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} style={{color: tokens.colors.success[500]}} aria-hidden="true" />
                <span className="hidden xs:inline">Gratuit pour commencer</span>
                <span className="xs:hidden">Gratuit</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={14} style={{color: tokens.colors.primary[500]}} aria-hidden="true" />
                <span className="hidden xs:inline">Aucune carte bancaire</span>
                <span className="xs:hidden">Sans CB</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={14} style={{color: tokens.colors.warning[500]}} aria-hidden="true" />
                <span className="hidden xs:inline">Operationnel en 2 minutes</span>
                <span className="xs:hidden">Rapide</span>
              </div>
            </div>
          </div>

          {/* Stats Premium - Mobile Optimized */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-8 mb-12 sm:mb-16" role="region" aria-label="Statistiques Factura">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center group">
                <div 
                  className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 group-hover:scale-105 transition-transform duration-300"
                  role="status"
                  aria-live="polite"
                >
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm font-medium" style={{color: tokens.colors.gray[600]}}>{stat.label}</div>
              </div>
            ))}
          </div>
          {/* Preview Dashboard Premium */}
          <div className="relative max-w-6xl mx-auto" role="img" aria-label="Aperçu du tableau de bord Factura">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-3xl" aria-hidden="true" />
            <div className="relative bg-gradient-to-b from-white/90 to-white/50 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center gap-3" aria-hidden="true">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                </div>
                <span className="text-white font-bold">Factura - Tableau de bord</span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Chiffre d'affaires", value: '1 250 000 FCFA', color: 'from-blue-500 to-blue-600' },
                    { label: 'En attente', value: '3 factures', color: 'from-yellow-500 to-orange-500' },
                    { label: 'Ce mois', value: '12 factures', color: 'from-green-500 to-emerald-500' },
                    { label: 'Clients', value: '8 actifs', color: 'from-purple-500 to-pink-500' }
                  ].map((item, i) => (
                    <div key={i} className={`bg-gradient-to-br ${item.color} p-4 rounded-xl text-white`}>
                      <p className="text-xs opacity-90 mb-1">{item.label}</p>
                      <p className="text-lg font-black">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-700">Dernières factures</span>
                    <span className="text-xs text-slate-500">Voir tout</span>
                  </div>
                  {['FACT-2024-001', 'FACT-2024-002', 'FACT-2024-003'].map((fact, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-200 last:border-0">
                      <span className="text-sm font-medium text-slate-700">{fact}</span>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Payée</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Probleme */}
      <section 
        className="py-20 px-6 safe-area-padding"
        style={{backgroundColor: tokens.colors.gray[50]}}
        role="region"
        aria-labelledby="problemes-heading"
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 id="problemes-heading" className="text-3xl font-bold mb-4" style={{color: tokens.colors.gray[900]}}>
              Vous en avez assez de perdre du temps ?
            </h2>
            <p className="text-lg" style={{color: tokens.colors.gray[500]}}>
              La plupart des professionnels en Afrique utilisent encore Word ou Excel
              pour leurs factures. Resultat :
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list">
            {PROBLEMS.map(({ emoji, text }) => (
              <article
                key={text}
                className="flex items-start gap-4 bg-white rounded-2xl border p-5 hover:shadow-lg transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                style={{borderColor: tokens.colors.gray[200]}}
                role="listitem"
                tabIndex={0}
              >
                <span className="text-2xl flex-shrink-0" aria-hidden="true">{emoji}</span>
                <p className="font-medium" style={{color: tokens.colors.gray[700]}}>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Solution - Mobile Optimized */}
      <section 
        ref={featuresRef}
        id="features" 
        className="py-16 sm:py-20 px-6 safe-area-padding"
        role="region"
        aria-labelledby="features-heading"
        tabIndex={0}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 id="features-heading" className="text-2xl sm:text-3xl font-bold mb-4" style={{color: tokens.colors.gray[900]}}>
              Factura règle tout ça en 2 minutes
            </h2>
            <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{color: tokens.colors.gray[500]}}>
              Un outil simple, rapide et professionnel pensé pour le contexte africain
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6" role="list">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <article
                key={title}
                className="group flex gap-4 bg-white rounded-2xl border p-4 sm:p-6 hover:border-blue-200 hover:shadow-lg transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                style={{borderColor: tokens.colors.gray[200]}}
                role="listitem"
                tabIndex={0}
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300"
                  style={{backgroundColor: tokens.colors.primary[50]}}
                >
                  <Icon size={20} style={{color: tokens.colors.primary[600]}} />
                </div>
                <div>
                  <h3 className="font-bold mb-1 text-sm sm:text-base" style={{color: tokens.colors.gray[900]}}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{color: tokens.colors.gray[500]}}>{desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Mobile Optimized */}
      <section 
        ref={pricingRef}
        id="pricing" 
        className="py-16 sm:py-20 px-6 safe-area-padding"
        style={{backgroundColor: tokens.colors.gray[50]}}
        role="region"
        aria-labelledby="pricing-heading"
        tabIndex={0}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 id="pricing-heading" className="text-2xl sm:text-3xl font-bold mb-4" style={{color: tokens.colors.gray[900]}}>
              Tarif simple et transparent
            </h2>
            <p className="text-base sm:text-lg" style={{color: tokens.colors.gray[500]}}>
              Commencez gratuitement, passez en Pro quand vous êtes prêt
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6" role="list">
            {/* Free */}
            <article 
              className="bg-white rounded-2xl border p-6 sm:p-8 hover:shadow-lg transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
              style={{borderColor: tokens.colors.gray[200]}}
              role="listitem"
              tabIndex={0}
            >
              <h3 className="font-bold text-lg mb-1" style={{color: tokens.colors.gray[900]}}>Gratuit</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl sm:text-4xl font-bold" style={{color: tokens.colors.gray[900]}}>0</span>
                <span className="text-sm sm:text-base" style={{color: tokens.colors.gray[500]}}>FCFA / mois</span>
              </div>
              <div className="space-y-3 mb-6 sm:mb-8">
                {['5 factures par mois', '5 devis par mois', 'Generation PDF', 'Gestion clients'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm" style={{color: tokens.colors.gray[600]}}>
                    <CheckCircle size={16} style={{color: tokens.colors.gray[300]}} aria-hidden="true" />
                    <span className="text-sm">{f}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/register"
                className="block text-center font-semibold py-2.5 px-4 sm:py-3 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                style={{
                  border: `1px solid ${tokens.colors.gray[200]}`,
                  color: tokens.colors.gray[700]
                }}
                role="button"
                aria-label="Commencer gratuitement avec Factura"
              >
                Commencer gratuitement
              </Link>
            </article>

            {/* Pro */}
            <article 
              className="p-6 sm:p-8 relative hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
              style={{backgroundColor: tokens.colors.primary[600]}}
              role="listitem"
              tabIndex={0}
            >
              <div className="absolute top-4 right-4 bg-white text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full animate-pulse" role="status" aria-live="polite">
                POPULAIRE
              </div>
              <h3 className="font-bold text-lg mb-1 text-white">Pro</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl sm:text-4xl font-bold text-white">2 500</span>
                <span className="text-sm sm:text-base" style={{color: tokens.colors.primary[200]}}>FCFA / mois</span>
              </div>
              <p className="text-sm mb-6" style={{color: tokens.colors.primary[200]}}>ou 5 USD / mois</p>
              <div className="space-y-3 mb-6 sm:mb-8">
                {[
                  'Factures illimitees',
                  'Devis illimites',
                  'PDF sans watermark',
                  'Conversion devis vers facture',
                  'Support prioritaire',
                ].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-white">
                    <CheckCircle size={16} style={{color: tokens.colors.primary[300]}} aria-hidden="true" />
                    <span className="text-sm">{f}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/register"
                className="block text-center font-bold py-2.5 px-4 sm:py-3 rounded-lg sm:rounded-xl hover:bg-blue-50 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-2"
                style={{
                  backgroundColor: 'white',
                  color: tokens.colors.primary[600]
                }}
                role="button"
                aria-label="Passer au plan Pro Factura"
              >
                Passer en Pro
              </Link>
            </article>
          </div>

          <p className="text-center text-sm mt-6" style={{color: tokens.colors.gray[400]}}>
            Paiement via MTN Mobile Money ou Orange Money - Activation sous 24h
          </p>
        </div>
      </section>

      {/* Testimonials - Mobile Optimized */}
      <section 
        ref={testimonialsRef}
        id="testimonials" 
        className="py-16 sm:py-20 px-6 safe-area-padding"
        role="region"
        aria-labelledby="testimonials-heading"
        tabIndex={0}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 id="testimonials-heading" className="text-2xl sm:text-3xl font-bold mb-4" style={{color: tokens.colors.gray[900]}}>
              Ils nous font confiance
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" role="list">
            {TESTIMONIALS.map(({ name, role, text }) => (
              <article
                key={name}
                className="bg-white rounded-2xl border p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                style={{borderColor: tokens.colors.gray[200]}}
                role="listitem"
                tabIndex={0}
              >
                <div className="flex gap-0.5 mb-4" role="img" aria-label="Note 5 étoiles">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-yellow-400 fill-yellow-400 group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{color: tokens.colors.gray[700]}}>
                  &quot;{text}&quot;
                </p>
                <div>
                  <p className="font-semibold text-sm" style={{color: tokens.colors.gray[900]}}>{name}</p>
                  <p className="text-xs" style={{color: tokens.colors.gray[400]}}>{role}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final - Mobile Optimized */}
      <section 
        className="py-16 sm:py-20 px-6 safe-area-padding"
        style={{backgroundColor: tokens.colors.primary[600]}}
        role="region"
        aria-labelledby="cta-heading"
        tabIndex={0}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 id="cta-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            Prêt à facturer comme un pro ?
          </h2>
          <p className="text-base sm:text-lg mb-6 sm:mb-8" style={{color: tokens.colors.primary[100]}}>
            Rejoignez des centaines de freelances et PME en Afrique
            <br className="hidden sm:block" />
            qui font confiance à Factura.
          </p>
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 font-bold text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl hover:bg-blue-50 transition-all duration-300 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-4"
            style={{
              backgroundColor: 'white',
              color: tokens.colors.primary[600]
            }}
            role="button"
            aria-label="Commencer maintenant avec Factura"
          >
            <span className="text-sm sm:text-base">Commencer maintenant</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true" />
          </Link>
          <p className="text-sm mt-4" style={{color: tokens.colors.primary[200]}}>
            Aucune carte bancaire requise
          </p>
        </div>
      </section>

      {/* Contact - Mobile Optimized */}
      <section 
        ref={contactRef}
        id="contact" 
        className="py-16 sm:py-20 px-6 safe-area-padding"
        style={{background: `linear-gradient(135deg, ${tokens.colors.primary[50]}, white)`}}
        role="region"
        aria-labelledby="contact-heading"
        tabIndex={0}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 id="contact-heading" className="text-3xl sm:text-4xl font-black mb-4" style={{color: tokens.colors.gray[900]}}>
              Contactez-nous
            </h2>
            <p className="text-lg sm:text-xl" style={{color: tokens.colors.gray[600]}}>
              Une question ? Besoin d&apos;aide ? Notre équipe est là pour vous
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12" role="list">
            {/* WhatsApp */}
            <article 
              className="group relative bg-white rounded-3xl p-6 sm:p-8 border hover:border-green-300 transition-all duration-300 hover:shadow-2xl hover:scale-105 focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2"
              style={{borderColor: tokens.colors.gray[200]}}
              role="listitem"
              tabIndex={0}
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-lg sm:text-2xl font-bold transition-colors duration-300" aria-hidden="true">💬</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4 transition-colors duration-300" style={{color: tokens.colors.gray[900]}}>WhatsApp</h3>
              <p className="mb-4 sm:mb-6 leading-relaxed transition-colors duration-300" style={{color: tokens.colors.gray[600]}}>
                Chat instantane pour un support rapide et efficace. Disponible 7j/7.
              </p>
              <a
                href="https://wa.me/237620187495"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-3 px-4 sm:px-6 py-3 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 overflow-hidden focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-offset-4"
                style={{background: `linear-gradient(135deg, ${tokens.colors.success[500]}, ${tokens.colors.success[600]})`}}
                role="button"
                aria-label="Contacter via WhatsApp"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-lg sm:text-xl transition-transform duration-300" aria-hidden="true">📱</span>
                  <span className="text-sm sm:text-base transition-colors duration-300">WhatsApp Direct</span>
                </span>
                <div 
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                  style={{background: `linear-gradient(135deg, ${tokens.colors.success[600]}, ${tokens.colors.success[700]})`}}
                />
              </a>
            </article>
            
            {/* Email */}
            <article 
              className="group relative bg-white rounded-3xl p-6 sm:p-8 border hover:border-blue-300 transition-all duration-300 hover:shadow-2xl hover:scale-105 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
              style={{borderColor: tokens.colors.gray[200]}}
              role="listitem"
              tabIndex={0}
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Mail size={20} className="text-white transition-colors duration-300 sm:hidden" aria-hidden="true" />
                <Mail size={32} className="text-white transition-colors duration-300 hidden sm:block" aria-hidden="true" />
              </div>
              <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4 transition-colors duration-300" style={{color: tokens.colors.gray[900]}}>Email</h3>
              <p className="mb-4 sm:mb-6 leading-relaxed transition-colors duration-300" style={{color: tokens.colors.gray[600]}}>
                Pour les demandes détaillées, questions techniques ou partenariats.
              </p>
              <a
                href="mailto:kfreddypatient@gmail.com"
                className="group relative inline-flex items-center gap-3 px-4 sm:px-6 py-3 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 overflow-hidden focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-4"
                style={{background: `linear-gradient(135deg, ${tokens.colors.primary[600]}, ${tokens.colors.primary[700]})`}}
                role="button"
                aria-label="Envoyer un email"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Mail size={16} className="text-white transition-transform duration-300 sm:hidden" aria-hidden="true" />
                  <Mail size={20} className="text-white transition-transform duration-300 hidden sm:block" aria-hidden="true" />
                  <span className="text-sm sm:text-base transition-colors duration-300">Envoyer un email</span>
                </span>
                <div 
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                  style={{background: `linear-gradient(135deg, ${tokens.colors.primary[700]}, ${tokens.colors.primary[800]})`}}
                />
              </a>
            </article>
          </div>
          
          {/* Info supplementaires - Mobile Optimized */}
          <div className="text-center bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 sm:p-8 border" style={{borderColor: tokens.colors.gray[200]}} role="region" aria-label="Informations de contact">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8" role="list">
              <div className="flex flex-col items-center gap-3" role="listitem">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Phone size={16} className="text-white sm:hidden" aria-hidden="true" />
                  <Phone size={24} className="text-white hidden sm:block" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-bold text-sm sm:text-base" style={{color: tokens.colors.gray[900]}}>Telephone</p>
                  <p className="text-sm" style={{color: tokens.colors.gray[600]}}>+237 620 187 495</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3" role="listitem">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <MapPin size={16} className="text-white sm:hidden" aria-hidden="true" />
                  <MapPin size={24} className="text-white hidden sm:block" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-bold text-sm sm:text-base" style={{color: tokens.colors.gray[900]}}>Localisation</p>
                  <p className="text-sm" style={{color: tokens.colors.gray[600]}}>Douala, Cameroun</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3" role="listitem">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Globe size={16} className="text-white sm:hidden" aria-hidden="true" />
                  <Globe size={24} className="text-white hidden sm:block" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-bold text-sm sm:text-base" style={{color: tokens.colors.gray[900]}}>Disponibilite</p>
                  <p className="text-sm" style={{color: tokens.colors.gray[600]}}>Lun-Sam: 8h-18h</p>
                </div>
              </div>
            </div>
            <p className="text-sm" style={{color: tokens.colors.gray[500]}}>
              Temps de reponse moyen : WhatsApp (2-5 min) • Email (2-4 heures)
            </p>
          </div>
        </div>
      </section>
      <footer 
        className="px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12 safe-area-padding"
        style={{backgroundColor: tokens.colors.gray[900]}}
        role="contentinfo"
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image 
              src="/icon-192.png" 
              alt="Logo Factura" 
              width={24}
              height={24}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg"
              priority
            />
            <span className="text-white font-bold text-sm sm:text-base">Factura</span>
          </div>
          <p className="text-xs sm:text-sm text-center sm:text-left" style={{color: tokens.colors.gray[400]}}>
            &copy; 2026 Factura - Devis et factures professionnels pour l&apos;Afrique francophone. Tous droits reserves.
          </p>
          <nav className="flex gap-3 sm:gap-4 text-xs sm:text-sm" style={{color: tokens.colors.gray[400]}} aria-label="Navigation footer">
            <Link 
              href="/login" 
              className="hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 rounded px-2 py-1"
              aria-label="Se connecter a Factura"
            >
              Connexion
            </Link>
            <Link 
              href="/register" 
              className="hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 rounded px-2 py-1"
              aria-label="Créer un compte Factura"
            >
              Inscription
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}