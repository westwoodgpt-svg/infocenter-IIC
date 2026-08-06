import { useMemo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Sparkles } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { EngagementPoint } from '../types';

interface QualityPanelProps {
  engagement: EngagementPoint[];
  efficiencyFactors: string[];
}

export default function QualityPanel({ engagement, efficiencyFactors }: QualityPanelProps) {
  const chartData = useMemo(
    () =>
      engagement.map((p) => ({
        name: p.year,
        'Участники семинаров': p.seminarParticipants ?? undefined,
        'Получатели поддержки': p.supportRecipients ?? undefined,
      })),
    [engagement]
  );

  const totalParticipants = engagement.reduce((acc, p) => acc + (p.seminarParticipants ?? 0), 0);
  const totalRecipients = engagement.reduce((acc, p) => acc + (p.supportRecipients ?? 0), 0);

  return (
    <div id="panel-quality" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[#111113] p-5 rounded-2xl border border-blue-500/10 shadow-sm flex items-center gap-4"
        >
          <span className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/25">
            <Sparkles className="w-6 h-6" />
          </span>
          <div>
            <p className="text-xs text-[#a1a1aa] font-medium font-display">Участников семинаров всего (с 2023)</p>
            <h3 className="text-2xl font-extrabold text-white font-mono mt-0.5">{totalParticipants}</h3>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-[#111113] p-5 rounded-2xl border border-emerald-500/10 shadow-sm flex items-center gap-4"
        >
          <span className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/25">
            <TrendingUp className="w-6 h-6" />
          </span>
          <div>
            <p className="text-xs text-[#a1a1aa] font-medium font-display">Получателей инжиниринговой поддержки всего (с 2020)</p>
            <h3 className="text-2xl font-extrabold text-white font-mono mt-0.5">{totalRecipients}</h3>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="bg-[#111113] p-6 rounded-2xl border border-[#27272a] shadow-sm flex flex-col min-h-[340px]"
      >
        <div className="mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 font-display">
            <TrendingUp className="w-5 h-5 text-blue-400" /> Вовлечённость по годам
          </h3>
          <p className="text-xs text-[#a1a1aa] mt-1">Уникальные участники семинаров и получатели инжиниринговой поддержки</p>
        </div>
        <div className="flex-1 w-full h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f1f23" />
              <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#161619] text-[#fafafa] p-3 text-xs rounded-xl shadow-lg border border-[#27272a] space-y-1.5">
                        <p className="font-semibold text-white">{payload[0].payload.name}</p>
                        <div className="space-y-1 border-t border-[#1f1f23] pt-1.5 mt-1">
                          {payload.map((p, i) => (
                            <div key={i} className="flex items-center gap-4 justify-between">
                              <span className="flex items-center gap-1.5 text-[#a1a1aa]">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                {p.name}:
                              </span>
                              <span className="font-bold font-mono text-white">{p.value ?? '—'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 10, color: '#fafafa' }} />
              <Bar dataKey="Участники семинаров" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="Получатели поддержки" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="bg-[#111113] p-6 rounded-2xl border border-[#27272a] shadow-sm"
      >
        <h3 className="text-base font-bold text-white mb-1">Факторы экономической эффективности</h3>
        <p className="text-xs text-[#a1a1aa] mb-4">Предпосылки экономического эффекта от инжиниринговых проектов ИИЦ</p>
        <div className="flex flex-wrap gap-2">
          {efficiencyFactors.map((f, idx) => (
            <span
              key={idx}
              className="text-xs font-medium text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20"
            >
              {f}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
