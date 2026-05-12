'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Users, Building2, Mail, Phone, Check, X } from 'lucide-react'

type Client = {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
}

type ClientSearchProps = {
  selectedClient: string
  onClientSelect: (clientId: string) => void
  placeholder?: string
  className?: string
}

export default function ClientSearch({ 
  selectedClient, 
  onClientSelect, 
  placeholder = "Rechercher un client...",
  className = ""
}: ClientSearchProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedClientData, setSelectedClientData] = useState<Client | null>(null)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Charger tous les clients au montage
  useEffect(() => {
    async function loadClients() {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('clients')
          .select('id, name, company, email, phone')
          .order('name')
        setClients((data as Client[]) || [])
        setFilteredClients((data as Client[]) || [])
      } catch (error) {
        console.error('Erreur chargement clients:', error)
      } finally {
        setLoading(false)
      }
    }
    loadClients()
  }, [])

  // Filtrer les clients selon la recherche
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredClients(clients)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = clients.filter(client => 
        client.name.toLowerCase().includes(query) ||
        (client.company && client.company.toLowerCase().includes(query)) ||
        (client.email && client.email.toLowerCase().includes(query)) ||
        (client.phone && client.phone.includes(query))
      )
      setFilteredClients(filtered)
    }
  }, [searchQuery, clients])

  // Mettre à jour le client sélectionné quand l'ID change
  useEffect(() => {
    if (selectedClient) {
      const client = clients.find(c => c.id === selectedClient)
      setSelectedClientData(client || null)
      if (client) {
        setSearchQuery(client.name)
      }
    } else {
      setSelectedClientData(null)
      setSearchQuery('')
    }
  }, [selectedClient, clients])

  // Gérer le clic hors du dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setSearchQuery(value)
    setIsOpen(true)
    
    // Si on efface le champ, désélectionner le client
    if (!value.trim()) {
      onClientSelect('')
      setSelectedClientData(null)
    }
  }

  function handleClientSelect(client: Client) {
    setSearchQuery(client.name)
    setSelectedClientData(client)
    onClientSelect(client.id)
    setIsOpen(false)
    inputRef.current?.blur()
  }

  function handleClearSelection() {
    setSearchQuery('')
    setSelectedClientData(null)
    onClientSelect('')
    setIsOpen(false)
    inputRef.current?.focus()
  }

  function highlightMatch(text: string, query: string): React.ReactNode[] {
    if (!query.trim()) return [text]
    
    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part: string, index: number) => 
      regex.test(part) ? (
        <span key={index} className="font-semibold text-indigo-600 bg-indigo-50 px-0.5 rounded">
          {part}
        </span>
      ) : (
        <span key={index}>{part}</span>
      )
    )
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Label */}
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        Client
      </label>
      
      {/* Champ de recherche */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {loading ? (
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Search size={18} className="text-slate-400" />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full pl-12 pr-12 py-3 rounded-3xl border border-slate-200 text-slate-900
                     placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                     focus:border-indigo-500 transition-all bg-gradient-to-b from-white to-slate-50
                     ${selectedClientData ? 'bg-indigo-50 border-indigo-200' : ''}`}
        />
        
        {/* Bouton pour effacer la sélection */}
        {selectedClientData && (
          <button
            onClick={handleClearSelection}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-red-500 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Dropdown de résultats */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-3xl border border-indigo-200/50 shadow-lg max-h-80 overflow-hidden">
          {filteredClients.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm">
                {searchQuery.trim() ? 'Aucun client trouvé' : 'Aucun client disponible'}
              </p>
              {searchQuery.trim() && (
                <p className="text-slate-400 text-xs mt-1">
                  Essayez une autre recherche
                </p>
              )}
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => handleClientSelect(client)}
                  className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 
                             transition-all duration-200 border-b border-slate-50 last:border-b-0
                             ${selectedClientData?.id === client.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''}`}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Infos client */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-900 truncate">
                        {highlightMatch(client.name, searchQuery)}
                      </p>
                      {selectedClientData?.id === client.id && (
                        <Check size={16} className="text-indigo-600 flex-shrink-0" />
                      )}
                    </div>
                    
                    {client.company && (
                      <div className="flex items-center gap-1 mb-1">
                        <Building2 size={12} className="text-slate-400" />
                        <p className="text-xs text-slate-600 truncate">
                          {highlightMatch(client.company, searchQuery)}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {client.email && (
                        <div className="flex items-center gap-1">
                          <Mail size={10} />
                          <span className="truncate max-w-32">
                            {highlightMatch(client.email, searchQuery)}
                          </span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-1">
                          <Phone size={10} />
                          <span>{highlightMatch(client.phone, searchQuery)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lien pour créer un nouveau client */}
      <div className="mt-2 text-xs">
        <span className="text-slate-500">Pas trouvé ? </span>
        <a
          href="/clients/nouveau"
          className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1 transition-colors"
        >
          Créer un nouveau client
        </a>
      </div>
    </div>
  )
}
