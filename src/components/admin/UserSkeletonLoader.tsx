import { tokens } from '@/lib/design-system'

interface UserSkeletonLoaderProps {
  count?: number
}

export function UserSkeletonLoader({ count = 5 }: UserSkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <article
          key={`skeleton-${index}`}
          className="p-6 transition-all duration-200 animate-pulse"
          style={{
            backgroundColor: index % 2 === 0 ? tokens.colors.gray[50] : tokens.colors.gray[100]
          }}
          role="status"
          aria-label="Chargement des utilisateurs"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Avatar skeleton */}
              <div 
                className="w-12 h-12 rounded-full"
                style={{ backgroundColor: tokens.colors.gray[300] }}
                aria-hidden="true"
              />
              
              {/* User info skeleton */}
              <div className="space-y-2">
                <div 
                  className="h-5 w-32 rounded"
                  style={{ backgroundColor: tokens.colors.gray[300] }}
                  aria-hidden="true"
                />
                <div 
                  className="h-4 w-48 rounded"
                  style={{ backgroundColor: tokens.colors.gray[200] }}
                  aria-hidden="true"
                />
                <div 
                  className="h-3 w-40 rounded"
                  style={{ backgroundColor: tokens.colors.gray[200] }}
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Action button skeleton */}
            <div 
              className="w-24 h-8 rounded-lg"
              style={{ backgroundColor: tokens.colors.gray[300] }}
              aria-hidden="true"
            />
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3" role="group" aria-label="Statistiques en chargement">
            {Array.from({ length: 5 }).map((_, statIndex) => (
              <div
                key={`stat-${statIndex}`}
                className="flex items-center justify-between p-3 rounded-lg border"
                style={{ 
                  backgroundColor: tokens.colors.gray[50],
                  borderColor: tokens.colors.gray[200]
                }}
                aria-hidden="true"
              >
                <div className="space-y-1">
                  <div 
                    className="h-3 w-12 rounded"
                    style={{ backgroundColor: tokens.colors.gray[300] }}
                  />
                  <div 
                    className="h-4 w-8 rounded"
                    style={{ backgroundColor: tokens.colors.gray[400] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      ))}
    </>
  )
}
