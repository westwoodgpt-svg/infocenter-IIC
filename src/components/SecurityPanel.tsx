import { motion } from 'motion/react';
import { ShieldCheck, Clock3, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { TaskDisciplineStatus } from '../types';

interface SecurityPanelProps {
  taskDiscipline: TaskDisciplineStatus;
}

export default function SecurityPanel({ taskDiscipline }: SecurityPanelProps) {
  return (
    <div id="panel-security" className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111113] p-6 rounded-2xl border border-red-500/10 shadow-sm flex items-start gap-4"
      >
        <span className="p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 flex-shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </span>
        <div>
          <h3 className="text-base font-bold text-white font-display">Отсутствие просроченных задач</h3>
          <p className="text-xs text-[#a1a1aa] mt-1">
            Еженедельный контроль исполнительской дисциплины по задачам ИИЦ в системе постановки задач.
            Раздел заполняется по факту еженедельного обзора — отчёт за текущую неделю ещё не внесён.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#111113] p-6 rounded-2xl border border-[#27272a] shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Анализ за месяц по исполнению задач</h3>
          <span className="flex items-center gap-1.5 text-[11px] text-[#a1a1aa] bg-[#161619] px-2.5 py-1 rounded-full border border-[#27272a]">
            <Clock3 className="w-3.5 h-3.5 text-red-400" />
            {taskDiscipline.periodicity}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#161619] p-4 rounded-xl border border-[#27272a]/60">
            <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mb-2">
              <ArrowUpCircle className="w-4 h-4" /> Мы тянем вниз
            </p>
            {taskDiscipline.causesInside.length === 0 ? (
              <p className="text-xs text-[#71717a]">Причин не зафиксировано</p>
            ) : (
              <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside">
                {taskDiscipline.causesInside.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-[#161619] p-4 rounded-xl border border-[#27272a]/60">
            <p className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 mb-2">
              <ArrowDownCircle className="w-4 h-4" /> Нас тянут вниз (внутри / снаружи)
            </p>
            {taskDiscipline.causesOutside.length === 0 ? (
              <p className="text-xs text-[#71717a]">Причин не зафиксировано</p>
            ) : (
              <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside">
                {taskDiscipline.causesOutside.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <p className="text-[11px] text-[#71717a] mt-4 border-t border-[#1f1f23] pt-3">
          Ответственный: <span className="text-zinc-300">{taskDiscipline.responsible}</span>
          {taskDiscipline.lastReviewed && <> · Последний обзор: <span className="text-zinc-300">{taskDiscipline.lastReviewed}</span></>}
        </p>
      </motion.div>
    </div>
  );
}
