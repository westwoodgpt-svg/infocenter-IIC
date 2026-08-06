import { motion } from 'motion/react';
import { UserRound, Cake, Layers } from 'lucide-react';
import { ResponsiblePerson } from '../types';

interface PersonnelPanelProps {
  responsible: ResponsiblePerson[];
}

export default function PersonnelPanel({ responsible }: PersonnelPanelProps) {
  return (
    <div id="panel-personnel" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {responsible.map((p, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="bg-[#111113] p-6 rounded-2xl border border-[#27272a] shadow-sm flex flex-col gap-4"
          >
            <div className="flex items-start gap-4">
              <span className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 flex-shrink-0">
                <UserRound className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white font-display">{p.name}</h3>
                <p className="text-xs text-indigo-400 font-medium mt-0.5">{p.role}</p>
              </div>
            </div>

            <div className="space-y-2 border-t border-[#1f1f23] pt-4">
              <p className="text-[10px] text-[#71717a] uppercase tracking-wider font-semibold font-display flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Направления
              </p>
              <div className="flex flex-wrap gap-2">
                {p.areas.map((a, i) => (
                  <span key={i} className="text-xs text-zinc-300 bg-[#161619] px-2.5 py-1 rounded-lg border border-[#27272a]/60">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {p.birthday && (
              <div className="flex items-center gap-2 text-xs text-amber-400 font-medium bg-amber-500/5 p-2.5 rounded-lg border border-amber-500/10">
                <Cake className="w-4 h-4" />
                <span>День рождения: <strong className="text-white">{p.birthday}</strong></span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="elegant-card rounded-2xl p-5 text-xs text-[#a1a1aa] leading-relaxed"
      >
        Штатное расписание, график отпусков и полный список дней рождения команды ИИЦ ведутся в кадровых
        документах организации и пока не подключены к дашборду.
      </motion.div>
    </div>
  );
}
