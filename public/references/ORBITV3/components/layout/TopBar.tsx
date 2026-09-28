'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Bell, ChevronDown, LogOut, Settings } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { SmartCard } from '@/components/ui/SmartCard'
import { formatCredits } from '@/lib/utils'
import type { SmartCardData } from '@/types'

interface TopBarProps {
  title?: string
  subtitle?: string
  smartCards?: SmartCardData[]
  onDismissCard?: (id: string) => void
}

export function TopBar({ title, subtitle, smartCards = [], onDismissCard }: TopBarProps) {
  const router = useRouter()
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const { profile, signOut } = useAuthStore()
  const unread = smartCards.filter(c => !c.read).length
  const firstNameRaw = profile?.displayName?.trim().split(/\s+/)[0] ?? ''
  const firstName = firstNameRaw
    ? `${firstNameRaw.charAt(0).toUpperCase()}${firstNameRaw.slice(1)}`
    : ''
  const initials = profile?.displayName
    ? profile.displayName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  const handleSignOut = async () => {
    setNotifOpen(false)
    setUserOpen(false)
    await signOut()
    router.push('/auth?mode=login')
  }

  return (
    <div className="topbar">
      <div className="flex-1 min-w-0 pl-10 md:pl-0">
        {title && <p className="topbar-title">{title}</p>}
        {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {profile && (
          <div className="topbar-credits hidden sm:flex">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {formatCredits(profile.creditBalance)}
          </div>
        )}

        <div className="relative">
          <button className="topbar-btn relative" onClick={() => { setNotifOpen(v => !v); setUserOpen(false) }}>
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          <AnimatePresence>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="topbar-dropdown absolute right-0 top-12 w-80 z-40 max-h-96 overflow-y-auto"
                >
                  <p className="section-label mb-3">Notifications</p>
                  {smartCards.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-orbit-dim" />
                      <p className="font-sans text-sm text-orbit-muted">All clear</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {smartCards.slice(0, 5).map(card => (
                        <SmartCard key={card.id} card={card} onDismiss={onDismissCard} compact />
                      ))}
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button className="topbar-user" onClick={() => { setUserOpen(v => !v); setNotifOpen(false) }}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, hsl(231 84% 67%), hsl(221 83% 53%))' }}
            >
              {initials}
            </div>
            <span className="hidden sm:block font-sans text-sm font-medium max-w-[80px] truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {firstName}
            </span>
            <ChevronDown className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.45)' }} />
          </button>
          <AnimatePresence>
            {userOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setUserOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="topbar-dropdown absolute right-0 top-12 w-52 z-40"
                >
                  {profile && (
                    <div className="px-3 py-2.5 mb-1 border-b border-orbit-border">
                      <p className="font-sans text-sm font-semibold text-orbit-text">{profile.displayName}</p>
                      <p className="font-sans text-xs text-orbit-dim mt-0.5 truncate">{profile.email}</p>
                    </div>
                  )}
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-orbit-muted hover:text-orbit-text hover:bg-orbit-elevated transition-colors mt-1">
                    <Settings className="w-3.5 h-3.5" /> Settings
                  </button>
                  <button onClick={handleSignOut} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-orbit-critical hover:bg-orbit-critical/8 transition-colors">
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
