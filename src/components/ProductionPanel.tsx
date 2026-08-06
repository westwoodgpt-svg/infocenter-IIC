import { motion } from 'motion/react';
import { ClipboardList, FileCheck2 } from 'lucide-react';
import { SubsidyProgram, KpiCheckpoint } from '../types';

interface ProductionPanelProps {
  kpiSoderzhanie: SubsidyProgram;
  kpiFinPodderzhka: SubsidyProgram;
}

function percentColor(pct: number | null) {
  if (pct === null) return { text: 'text-zinc-400', bg: 'bg-zinc-800/40', border: 'border-zinc-700/30', bar: '#52525b' };
  if (pct >= 100) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', bar: '#10b981' };
  if (pct >= 50) return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', bar: '#f59e0b' };
  return { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', bar: '#f43f5e' };
}

function ProgramCard({ program, delay }: { program: SubsidyProgram; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-[#111113] rounded-2xl border border-[#27272a] shadow-sm overflow-hidden"
    >
      <div className="p-6 border-b border-[#1f1f23]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-display">
              <ClipboardList className="w-5 h-5 text-amber-400" /> {program.title}
            </h3>
            <p className="text-xs text-[#a1a1aa] mt-1">{program.agreement}</p>
          </div>
          <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md font-mono border border-amber-500/20 whitespace-nowrap">{program.year}</span>
        </div>
      </div>

      <div className="divide-y divide-[#1f1f23]/60">
        {program.items.map((item: KpiCheckpoint) => {
          const c = percentColor(item.percent);
          const barWidth = item.percent === null ? 0 : Math.min(item.percent, 100);
          return (
            <div key={item.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm text-zinc-300 leading-relaxed flex-1">{item.title}</p>
                <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-md border whitespace-nowrap ${c.text} ${c.bg} ${c.border}`}>
                  {item.percent === null ? '—' : `${item.percent}%`}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-3 text-[11px] text-[#a1a1aa]">
                <span>План: <strong className="text-white font-mono">{item.planValue}</strong> к {item.planDate}</span>
                <span>Факт: <strong className="text-white font-mono">{item.factValue}</strong>{item.factDate ? ` (${item.factDate})` : ''}</span>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-[#27272a] mt-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: c.bar }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function ProductionPanel({ kpiSoderzhanie, kpiFinPodderzhka }: ProductionPanelProps) {
  return (
    <div id="panel-production" className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="elegant-card rounded-2xl p-5 flex items-center gap-4"
      >
        <span className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
          <FileCheck2 className="w-5 h-5" />
        </span>
        <p className="text-xs text-[#a1a1aa] leading-relaxed">
          Контрольные точки исполнения соглашений о предоставлении субсидии на инжиниринговые услуги.
          План/факт и % исполнения — по данным последнего отчёта.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ProgramCard program={kpiSoderzhanie} delay={0.1} />
        <ProgramCard program={kpiFinPodderzhka} delay={0.2} />
      </div>
    </div>
  );
}
