'use client'
import { useState } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { FlaskConical, Play, Loader, Sparkles, ShoppingCart, CheckCircle } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { useAuthStore } from '@/stores/authStore'
import { useInventory } from '@/hooks/useInventory'
import { useWallet } from '@/hooks/useWallet'
import { cn } from '@/lib/utils'
import type { SandboxResult } from '@/types'

const EXAMPLES = [
  'What if 6 guests come for dinner this weekend?',
  'What if I meal prep for the entire next week?',
  'What if my fridge breaks down for 3 days?',
  'What if I need to throw a birthday party for 15 kids?',
  'What if I go on a 2-week vacation?',
  'What if I want to eat healthy for a month?',
]

const fadeUp: Variants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } }
const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }

export default function SandboxPage() {
  const { user } = useAuthStore()
  const { items } = useInventory(user?.uid)
  const { wallet } = useWallet(user?.uid)
  const [scenario, setScenario] = useState('')
  const [simulating, setSimulating] = useState(false)
  const [result, setResult] = useState<SandboxResult | null>(null)

  const handleSimulate = async () => {
    if (!scenario.trim() || simulating) return
    setSimulating(true); setResult(null)
    try {
      const res = await fetch('/api/ai/sandbox', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario, inventory: items, wallet }),
      })
      setResult(await res.json())
    } catch (err) { console.error('Simulation failed', err) }
    finally { setSimulating(false) }
  }

  return (
    <AppShell title="Sandbox" subtitle="Life scenario simulation engine">
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5 max-w-3xl mx-auto">
        <motion.div variants={fadeUp}>
          <div className="card card-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)' }}>
                <FlaskConical className="w-4 h-4" style={{ color: '#F59E0B' }} />
              </div>
              <div>
                <p className="font-sans text-sm font-semibold" style={{ color: 'var(--text)' }}>Life Sandbox</p>
                <p className="font-sans text-xs" style={{ color: 'var(--muted)' }}>Describe a scenario and see the impact on your household</p>
              </div>
            </div>
            <textarea value={scenario} onChange={e => setScenario(e.target.value)} placeholder="What if..." className="orbit-input min-h-[80px] resize-none mb-3" rows={3} />
            <div className="flex items-center gap-2 flex-wrap mb-4">
              {EXAMPLES.map(ex => (<button key={ex} onClick={() => setScenario(ex)} className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all" style={{ background: 'var(--elevated)', color: 'var(--muted)', border: '1px solid var(--border)' }}>{ex}</button>))}
            </div>
            <button onClick={handleSimulate} disabled={!scenario.trim() || simulating} className="btn-primary w-full py-2.5 gap-2 disabled:opacity-40">
              {simulating ? <><Loader className="w-4 h-4 animate-spin" /> Simulating...</> : <><Play className="w-4 h-4" /> Run Simulation</>}
            </button>
          </div>
        </motion.div>
        {simulating && (<motion.div variants={fadeUp}><div className="card card-md text-center py-10"><Sparkles className="w-8 h-8 mx-auto mb-3 animate-pulse" style={{ color: '#F59E0B' }} /><p className="font-sans text-sm font-medium" style={{ color: 'var(--text)' }}>Running simulation...</p><p className="font-sans text-xs mt-1" style={{ color: 'var(--muted)' }}>Analyzing your inventory and scenario</p></div></motion.div>)}
        <AnimatePresence>
          {result && !simulating && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="card card-md" style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.25)' }}>
                <div className="flex items-start gap-3"><Sparkles className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#F59E0B' }} /><div><p className="font-sans text-sm font-semibold mb-1" style={{ color: '#F59E0B' }}>Impact Summary</p><p className="font-sans text-sm leading-relaxed" style={{ color: 'var(--text)' }}>{result.impactSummary}</p><span className="badge badge-accent mt-2">Confidence: {Math.round((result.confidenceScore ?? 0.8) * 100)}%</span></div></div>
              </div>
              {result.resourceGaps?.length > 0 && (<div className="card card-md"><p className="font-sans text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Resource Gaps</p><div className="space-y-2">{result.resourceGaps.map((gap, i) => (<div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)' }}><div><p className="font-sans text-sm font-medium" style={{ color: 'var(--text)' }}>{gap.item}</p><p className="font-sans text-xs" style={{ color: 'var(--dim)' }}>{gap.reason}</p></div><div className="text-right"><p className="font-sans text-sm font-semibold" style={{ color: '#D97706' }}>{gap.currentStock} to {gap.required}</p><p className="font-sans text-xs" style={{ color: 'var(--dim)' }}>needed</p></div></div>))}</div></div>)}
              {result.proxyShoppingList?.length > 0 && (<div className="card card-md"><p className="font-sans text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Shopping List</p><div className="space-y-1.5">{result.proxyShoppingList.map((item, i) => (<div key={i} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: 'var(--elevated)' }}><div className="flex items-center gap-2.5"><ShoppingCart className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} /><span className="font-sans text-sm" style={{ color: 'var(--text)' }}>{item.item}</span><span className="font-sans text-xs" style={{ color: 'var(--dim)' }}>{item.quantity}</span></div><div className="flex items-center gap-2"><span className={cn('badge', item.priority === 'high' ? 'badge-critical' : item.priority === 'medium' ? 'badge-warning' : 'badge-muted')}>{item.priority}</span><span className="font-sans text-sm font-medium" style={{ color: 'var(--text)' }}>Rs.{item.estimatedCost}</span></div></div>))}<div className="flex justify-end pt-2 border-t" style={{ borderColor: 'var(--border)' }}><span className="font-sans text-sm font-semibold" style={{ color: 'var(--text)' }}>Total: Rs.{result.proxyShoppingList.reduce((s, i) => s + i.estimatedCost, 0).toFixed(2)}</span></div></div></div>)}
              {result.recommendedActions?.length > 0 && (<div className="card card-md"><p className="font-sans text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Recommended Actions</p><div className="space-y-2">{result.recommendedActions.map((action, i) => (<div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl" style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)' }}><CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#059669' }} /><span className="font-sans text-sm" style={{ color: 'var(--text)' }}>{action}</span></div>))}</div></div>)}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AppShell>
  )
}