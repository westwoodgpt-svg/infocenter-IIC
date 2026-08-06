import { useMemo } from 'react';
import { motion } from 'motion/react';
import { PiggyBank, Receipt, Wallet2 } from 'lucide-react';
import { SmetaLine } from '../types';

interface CostsPanelProps {
  smety: SmetaLine[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(n));

export default function CostsPanel({ smety }: CostsPanelProps) {
  const rows = useMemo(
    () =>
      smety.map((s) => {
        const remainder = s.plan - s.fact;
        const factPct = s.plan > 0 ? Math.round((s.fact / s.plan) * 100) : 0;
        return { ...s, remainder, factPct };
      }),
    [smety]
  );

  const totalPlan = rows.reduce((acc, r) => acc + r.plan, 0);
  const totalFact = rows.reduce((acc, r) => acc + r.fact, 0);

  return (
    <div id="panel-costs" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[#111113] p-5 rounded-2xl border border-emerald-500/10 shadow-sm flex items-center gap-4"
        >
          <span className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <PiggyBank className="w-5 h-5" />
          </span>
          <div>
            <p className="text-xs text-[#a1a1aa] font-medium">Плановый объём (все сметы)</p>
            <h3 className="text-xl font-bold text-white font-mono">{fmt(totalPlan)} ₽</h3>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-[#111113] p-5 rounded-2xl border border-amber-500/10 shadow-sm flex items-center gap-4"
        >
          <span className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Receipt className="w-5 h-5" />
          </span>
          <div>
            <p className="text-xs text-[#a1a1aa] font-medium">Освоено (факт)</p>
            <h3 className="text-xl font-bold text-white font-mono">{fmt(totalFact)} ₽</h3>
            <p className="text-[10px] text-amber-400 font-semibold mt-0.5">
              {totalPlan > 0 ? Math.round((totalFact / totalPlan) * 100) : 0}% от плана
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-[#111113] p-5 rounded-2xl border border-zinc-500/10 shadow-sm flex items-center gap-4"
        >
          <span className="p-3 bg-zinc-800/40 text-zinc-400 rounded-xl border border-zinc-700/30">
            <Wallet2 className="w-5 h-5" />
          </span>
          <div>
            <p className="text-xs text-[#a1a1aa] font-medium">Остаток</p>
            <h3 className="text-xl font-bold text-white font-mono">{fmt(totalPlan - totalFact)} ₽</h3>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-[#111113] p-6 rounded-2xl border border-[#27272a] shadow-sm"
      >
        <h3 className="text-base font-bold text-white mb-1">Сметы ИИЦ по соглашениям</h3>
        <p className="text-xs text-[#a1a1aa] mb-4">План/факт по каждому соглашению о предоставлении субсидии</p>

        <div className="space-y-5">
          {rows.map((r, idx) => (
            <div key={idx} className="border-t border-[#1f1f23] pt-4 first:border-t-0 first:pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-semibold text-zinc-200">{r.title}</p>
                  <p className="text-[11px] text-[#71717a] mt-0.5">
                    {r.agreement} · {r.year} год · {r.asOf} · Ответственный: {r.responsible}
                  </p>
                </div>
                <span className="font-mono text-sm text-white font-bold whitespace-nowrap">
                  {fmt(r.fact)} / {fmt(r.plan)} ₽
                </span>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-[#27272a]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(r.factPct, 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.1 * idx }}
                    className="h-full rounded-full bg-emerald-500"
                  />
                </div>
                <span className="font-mono text-xs font-semibold text-[#a1a1aa] w-10 text-right">{r.factPct}%</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
