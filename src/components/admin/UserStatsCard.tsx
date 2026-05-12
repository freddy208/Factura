import { LucideIcon } from 'lucide-react'

interface UserStatsCardProps {
  title: string
  value: string
  subtitle: string
  icon: LucideIcon
  color: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'slate'
}

const colorClasses = {
  blue: 'bg-blue-50 border-blue-200 text-blue-600',
  green: 'bg-green-50 border-green-200 text-green-600',
  red: 'bg-red-50 border-red-200 text-red-600',
  amber: 'bg-amber-50 border-amber-200 text-amber-600',
  purple: 'bg-purple-50 border-purple-200 text-purple-600',
  slate: 'bg-slate-50 border-slate-200 text-slate-600'
}

export function UserStatsCard({ title, value, subtitle, icon: Icon, color }: UserStatsCardProps) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2">
        <Icon size={14} />
        <span className="text-xs font-medium">{title}</span>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold">{value}</div>
        <div className="text-xs opacity-75">{subtitle}</div>
      </div>
    </div>
  )
}
