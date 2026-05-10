/* eslint-disable @next/next/no-img-element */
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import {
  CheckCircle, Zap, FileText, Users, Receipt, Download, 
  ArrowRight, Star, Sparkles, TrendingUp, Shield, Globe,
  ChevronRight, Menu, X, ArrowUpRight, Mail, Phone, MapPin
} from 'lucide-react'
import Navbar from '@/components/landing/Navbar'

const FEATURES = [
  {
    icon: FileText,
    title: 'Devis en 2 minutes',
    desc: 'Ajoutez vos prestations, selectionnez votre client et generez un devis professionnel instantanement.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Receipt,
    title: 'Factures automatiques',
    desc: 'Numerotation automatique, calcul TVA, statut de paiement. Tout est gere pour vous.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: Users,
    title: 'Clients organises',
    desc: "Carnet d'adresses integre avec historique complet des factures par client.",
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    icon: Download,
    title: 'PDF professionnel',
    desc: 'Telechargez des PDF au design premium a partager directement avec vos clients.',
    gradient: 'from-orange-500 to-red-500'
  },
]

const PROBLEMS = [
  { emoji: '😤', text: 'Word et Excel prennent 30 minutes pour une facture' },
  { emoji: '😰', text: 'Vos factures manquent de professionnalisme' },
  { emoji: '💸', text: 'Vous perdez des clients faute de credibilite' },
  { emoji: '🤯', text: "Vous ne savez plus qui vous doit de l'argent" },
]

const TESTIMONIALS = [
  {
    name: 'Armelle K.',
    role: 'Designer freelance, Douala',
    text: 'Je cree mes factures en 2 minutes chrono. Mes clients me paient plus vite.',
    rating: 5,
    avatar: 'AK'
  },
  {
    name: 'Jean-Baptiste M.',
    role: 'Agence web, Yaounde',
    text: "Enfin un outil pense pour l'Afrique. Le Mobile Money c'est parfait.",
    rating: 5,
    avatar: 'JB'
  },
  {
    name: 'Sophie T.',
    role: 'Consultante RH, Douala',
    text: "Mes devis sont devenus tellement professionnels que j'ai gagne de nouveaux clients.",
    rating: 5,
    avatar: 'ST'
  },
]

const STATS = [
  { number: '300+', label: 'Utilisateurs actifs' },
  { number: '500+', label: 'Factures generees' },
  { number: '3+', label: 'Pays africains' },
  { number: '99.9%', label: 'Uptime garanti' }
]

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)

  // Fonction pour gérer le défilement smooth vers les sections
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
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
    
    // Throttle mouse tracking for performance
    let ticking = false
    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking && !isMobile) {
        requestAnimationFrame(() => {
          setMousePosition({ x: e.clientX, y: e.clientY })
          ticking = false
        })
        ticking = true
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', checkMobile)
    }
  }, [isMobile])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Animated Background - Optimized for mobile */}
      <div className="fixed inset-0 pointer-events-none">
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
      <section className="relative pt-32 pb-20 px-6 overflow-hidden safe-area-padding">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            {/* Badge Premium */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 text-blue-700 text-sm font-bold px-6 py-3 rounded-full mb-8 backdrop-blur-sm animate-bounce">
              <Sparkles size={16} className="text-yellow-500" />
              <span className="hidden sm:inline">Concu pour l&apos;Afrique francophone</span>
              <span className="sm:hidden">Afrique francophone</span>
              <ChevronRight size={16} className="animate-pulse" />
            </div>

            {/* Titre Premium avec Gradient - Mobile Optimized */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight mb-6 sm:mb-8">
              <span className="block bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent animate-gradient">
                Creez des devis et
              </span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
                factures professionnels
              </span>
              <span className="block text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-slate-700 mt-2">
                en <span className="text-blue-600 font-black">2 minutes</span>
              </span>
            </h1>

            {/* Description Premium - Mobile Optimized */}
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto mb-8 sm:mb-12 leading-relaxed font-medium">
              Gagnez du temps, soyez paye plus vite et inspirez confiance a vos clients.
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                Pense pour les freelances, PME et agences au Cameroun et en Afrique.
              </span>
            </p>

            {/* CTA Premium - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 sm:mb-12">
              <Link
                href="/register"
                className="group relative px-6 py-4 sm:px-8 sm:py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:shadow-blue-500/25 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-4"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                  <span className="text-sm sm:text-base">Creer mon compte</span>
                  <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              <Link
                href="/login"
                className="group relative px-6 py-4 sm:px-8 sm:py-5 bg-white/80 backdrop-blur-sm border-2 border-slate-200 hover:border-blue-300 text-slate-700 font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 hover:bg-blue-50/50 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-4"
              >
                <span className="flex items-center justify-center gap-2 sm:gap-3">
                  <span className="text-sm sm:text-base">Voir demo</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>

            {/* Trust Indicators - Mobile Optimized */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" />
                <span className="hidden xs:inline">Gratuit pour commencer</span>
                <span className="xs:hidden">Gratuit</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-blue-500" />
                <span className="hidden xs:inline">Aucune carte bancaire</span>
                <span className="xs:hidden">Sans CB</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-yellow-500" />
                <span className="hidden xs:inline">Operationnel en 2 minutes</span>
                <span className="xs:hidden">Rapide</span>
              </div>
            </div>
          </div>

          {/* Stats Premium - Mobile Optimized */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-8 mb-12 sm:mb-16">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 group-hover:scale-105 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
          {/* Preview Dashboard Premium */}
          <div className="relative max-w-6xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-3xl" />
            <div className="relative bg-gradient-to-b from-white/90 to-white/50 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center gap-3">
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
                    <span className="font-bold text-slate-700">Dernieres factures</span>
                    <span className="text-xs text-slate-500">Voir tout</span>
                  </div>
                  {['FACT-2024-001', 'FACT-2024-002', 'FACT-2024-003'].map((fact, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-200 last:border-0">
                      <span className="text-sm font-medium text-slate-700">{fact}</span>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Payee</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Probleme */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Vous en avez assez de perdre du temps ?
            </h2>
            <p className="text-gray-500 text-lg">
              La plupart des professionnels en Afrique utilisent encore Word ou Excel
              pour leurs factures. Resultat :
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PROBLEMS.map(({ emoji, text }) => (
              <div
                key={text}
                className="flex items-start gap-4 bg-white rounded-2xl border
                           border-gray-200 p-5"
              >
                <span className="text-2xl flex-shrink-0">{emoji}</span>
                <p className="text-gray-700 font-medium">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution - Mobile Optimized */}
      <section id="features" className="py-16 sm:py-20 px-6 safe-area-padding">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Factura regle tout ca en 2 minutes
            </h2>
            <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
              Un outil simple, rapide et professionnel pense pour le contexte africain
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group flex gap-4 bg-white rounded-2xl border border-gray-200
                           p-4 sm:p-6 hover:border-blue-200 hover:shadow-lg transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center
                                justify-center flex-shrink-0 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300">
                  <Icon size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">{title}</h3>
                  <p className="text-gray-500 text-sm sm:text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Mobile Optimized */}
      <section id="pricing" className="py-16 sm:py-20 px-6 bg-gray-50 safe-area-padding">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Tarif simple et transparent
            </h2>
            <p className="text-gray-500 text-base sm:text-lg">
              Commencez gratuitement, passez en Pro quand vous etes pret
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Free */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 hover:shadow-lg transition-all duration-300">
              <h3 className="font-bold text-gray-900 text-lg mb-1">Gratuit</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">0</span>
                <span className="text-gray-500 text-sm sm:text-base">FCFA / mois</span>
              </div>
              <div className="space-y-3 mb-6 sm:mb-8">
                {['5 factures par mois', '5 devis par mois', 'Generation PDF', 'Gestion clients'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-gray-300" />
                    <span className="text-sm">{f}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/register"
                className="block text-center border border-gray-200 text-gray-700
                           font-semibold py-2.5 px-4 sm:py-3 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Commencer gratuitement
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-blue-600 rounded-2xl p-6 sm:p-8 relative hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="absolute top-4 right-4 bg-white text-blue-600 text-xs
                              font-bold px-2.5 py-1 rounded-full animate-pulse">
                POPULAIRE
              </div>
              <h3 className="font-bold text-white text-lg mb-1">Pro</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl sm:text-4xl font-bold text-white">2 500</span>
                <span className="text-blue-200 text-sm sm:text-base">FCFA / mois</span>
              </div>
              <p className="text-blue-200 text-sm mb-6">ou 5 USD / mois</p>
              <div className="space-y-3 mb-6 sm:mb-8">
                {[
                  'Factures illimitees',
                  'Devis illimites',
                  'PDF sans watermark',
                  'Conversion devis vers facture',
                  'Support prioritaire',
                ].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-white">
                    <CheckCircle size={16} className="text-blue-300" />
                    <span className="text-sm">{f}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/register"
                className="block text-center bg-white text-blue-600 font-bold
                           py-2.5 px-4 sm:py-3 rounded-lg sm:rounded-xl hover:bg-blue-50 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-2"
              >
                Passer en Pro
              </Link>
            </div>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            Paiement via MTN Mobile Money ou Orange Money - Activation sous 24h
          </p>
        </div>
      </section>

      {/* Testimonials - Mobile Optimized */}
      <section id="testimonials" className="py-16 sm:py-20 px-6 safe-area-padding">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Ils nous font confiance
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {TESTIMONIALS.map(({ name, role, text }) => (
              <div
                key={name}
                className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-yellow-400 fill-yellow-400 group-hover:scale-110 transition-transform duration-300" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  &quot;{text}&quot;
                </p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{name}</p>
                  <p className="text-gray-400 text-xs">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final - Mobile Optimized */}
      <section className="py-16 sm:py-20 px-6 bg-blue-600 safe-area-padding">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            Pret a facturer comme un pro ?
          </h2>
          <p className="text-blue-100 text-base sm:text-lg mb-6 sm:mb-8">
            Rejoignez des centaines de freelances et PME en Afrique
            <br className="hidden sm:block" />
            qui font confiance a Factura.
          </p>
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 bg-white text-blue-600
                       font-bold text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl hover:bg-blue-50
                       transition-all duration-300 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-4"
          >
            <span className="text-sm sm:text-base">Commencer maintenant</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
          <p className="text-blue-200 text-sm mt-4">
            Aucune carte bancaire requise
          </p>
        </div>
      </section>

      {/* Contact - Mobile Optimized */}
      <section id="contact" className="py-16 sm:py-20 px-6 bg-gradient-to-br from-blue-50 to-white safe-area-padding">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
              Contactez-nous
            </h2>
            <p className="text-lg sm:text-xl text-slate-600">
              Une question ? Besoin d&apos;aide ? Notre equipe est la pour vous
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {/* WhatsApp */}
            <div className="group relative bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 hover:border-green-300 transition-all duration-300 hover:shadow-2xl hover:scale-105">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-lg sm:text-2xl font-bold transition-colors duration-300">💬</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-4 transition-colors duration-300">WhatsApp</h3>
              <p className="text-slate-600 mb-4 sm:mb-6 leading-relaxed transition-colors duration-300">
                Chat instantane pour un support rapide et efficace. Disponible 7j/7.
              </p>
              <a
                href="https://wa.me/237620187495"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-3 px-4 sm:px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 overflow-hidden focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-offset-4"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-lg sm:text-xl transition-transform duration-300">📱</span>
                  <span className="text-sm sm:text-base transition-colors duration-300">WhatsApp Direct</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>
            </div>
            
            {/* Email */}
            <div className="group relative bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-2xl hover:scale-105">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Mail size={20} className="text-white transition-colors duration-300 sm:hidden" />
                <Mail size={32} className="text-white transition-colors duration-300 hidden sm:block" />
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-4 transition-colors duration-300">Email</h3>
              <p className="text-slate-600 mb-4 sm:mb-6 leading-relaxed transition-colors duration-300">
                Pour les demandes detaillees, questions techniques ou partenariats.
              </p>
              <a
                href="mailto:kfreddypatient@gmail.com"
                className="group relative inline-flex items-center gap-3 px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 overflow-hidden focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-4"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Mail size={16} className="text-white transition-transform duration-300 sm:hidden" />
                  <Mail size={20} className="text-white transition-transform duration-300 hidden sm:block" />
                  <span className="text-sm sm:text-base transition-colors duration-300">Envoyer un email</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>
            </div>
          </div>
          
          {/* Info supplementaires - Mobile Optimized */}
          <div className="text-center bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 sm:p-8 border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Phone size={16} className="text-white sm:hidden" />
                  <Phone size={24} className="text-white hidden sm:block" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm sm:text-base">Telephone</p>
                  <p className="text-slate-600 text-sm">+237 620 187 495</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <MapPin size={16} className="text-white sm:hidden" />
                  <MapPin size={24} className="text-white hidden sm:block" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm sm:text-base">Localisation</p>
                  <p className="text-slate-600 text-sm">Douala, Cameroun</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Globe size={16} className="text-white sm:hidden" />
                  <Globe size={24} className="text-white hidden sm:block" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm sm:text-base">Disponibilite</p>
                  <p className="text-slate-600 text-sm">Lun-Sam: 8h-18h</p>
                </div>
              </div>
            </div>
            <p className="text-slate-500 text-sm">
              Temps de reponse moyen : WhatsApp (2-5 min) • Email (2-4 heures)
            </p>
          </div>
        </div>
      </section>
      <footer className="bg-gray-900 px-6 py-8 sm:py-10 safe-area-padding">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center
                        justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image 
              src="/icon-192.png" 
              alt="Factura" 
              width={24}
              height={24}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg"
              priority
            />
            <span className="text-white font-bold text-sm sm:text-base">Factura</span>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
            &copy; 2026 Factura - Devis et factures professionnels pour l&apos;Afrique francophone. Tous droits reserves.
          </p>
          <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
            <Link href="/login" className="hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 rounded px-2 py-1">
              Connexion
            </Link>
            <Link href="/register" className="hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 rounded px-2 py-1">
              Inscription
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}