import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Award,
  Clock,
  CheckCircle2,
  TrendingUp,
  PiggyBank,
  Users2,
  Info,
} from 'lucide-react';

import { TabId } from './types';
import { IIC_DATA } from './data';

import SecurityPanel from './components/SecurityPanel';
import QualityPanel from './components/QualityPanel';
import ProductionPanel from './components/ProductionPanel';
import CostsPanel from './components/CostsPanel';
import PersonnelPanel from './components/PersonnelPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('production');
  const data = IIC_DATA;

  const formattedToday = useMemo(() => {
    return new Date().toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const tabs = [
    { id: 'security', label: 'Безопасность', color: 'bg-red-500', shadowColor: 'rgba(239, 68, 68, 0.15)', hoverBg: 'hover:bg-red-500/5', activeText: 'text-red-400 bg-red-500/10 border-red-500/20', icon: ShieldCheck },
    { id: 'quality', label: 'Качество', color: 'bg-blue-500', shadowColor: 'rgba(59, 130, 246, 0.15)', hoverBg: 'hover:bg-blue-500/5', activeText: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: Award },
    { id: 'production', label: 'Производство', color: 'bg-amber-500', shadowColor: 'rgba(245, 158, 11, 0.15)', hoverBg: 'hover:bg-amber-500/5', activeText: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: TrendingUp },
    { id: 'costs', label: 'Затраты', color: 'bg-emerald-500', shadowColor: 'rgba(16, 185, 129, 0.15)', hoverBg: 'hover:bg-emerald-500/5', activeText: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: PiggyBank },
    { id: 'personnel', label: 'Персонал', color: 'bg-indigo-500', shadowColor: 'rgba(99, 102, 241, 0.15)', hoverBg: 'hover:bg-indigo-500/5', activeText: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', icon: Users2 },
  ] as const;

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] py-8 px-4 md:px-8 font-sans antialiased">
      <div className="max-w-7xl mx-auto space-y-8">

        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="elegant-card rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="h-4 w-1 bg-amber-500 rounded-full shadow-[0_0_8px_#f59e0b]" />
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400 font-display">Инновационный инжиниринговый центр</p>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-display flex flex-wrap items-center gap-x-3 gap-y-1.5">
              Инфоцентр
              <span className="font-mono font-black tracking-tighter flex items-center text-lg md:text-2xl select-none px-2.5 py-0.5 bg-zinc-900 rounded-xl border border-[#27272a] shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                <span className="text-amber-400">&lt;</span>
                <span className="text-white">|</span>
                <span className="text-amber-400">&gt;</span>
                <span className="text-white ml-1">ИИЦ</span>
              </span>
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#a1a1aa] pt-1.5">
              <span className="flex items-center gap-1.5 bg-[#161619] px-3 py-1 rounded-full border border-[#27272a]">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Данные обновлены: <strong className="text-white">{new Date(data.updated).toLocaleDateString('ru-RU')}</strong>
                </span>
              </span>
              <span className="flex items-center gap-1.5 bg-[#161619] px-3 py-1 rounded-full border border-[#27272a]">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Сегодня: <span className="text-white">{formattedToday}</span></span>
              </span>
            </div>
          </div>

          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800/60 text-zinc-400 text-xs font-medium rounded-full border border-zinc-700/60">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_6px_#f59e0b]" />
            Данные из документов ИИЦ (без живой интеграции)
          </span>
        </motion.header>

        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="elegant-card rounded-3xl p-2"
        >
          <div className="flex flex-wrap md:flex-nowrap gap-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={`relative flex-1 min-w-[120px] md:min-w-0 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 border border-transparent font-display ${
                    isActive ? `${tab.activeText}` : `text-[#a1a1aa] hover:text-white ${tab.hoverBg}`
                  }`}
                  style={isActive ? { boxShadow: `0 0 15px ${tab.shadowColor}` } : {}}
                >
                  <Icon className={`w-4 h-4 transition-all duration-300 ${isActive ? 'scale-110 opacity-100' : 'opacity-60'}`} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className={`absolute bottom-0 left-4 right-4 h-0.5 ${tab.color} rounded-full`}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.nav>

        <main className="min-h-[400px]">
          <AnimatePresence>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === 'security' && <SecurityPanel taskDiscipline={data.taskDiscipline} />}
              {activeTab === 'quality' && <QualityPanel engagement={data.engagement} efficiencyFactors={data.efficiencyFactors} />}
              {activeTab === 'production' && <ProductionPanel kpiSoderzhanie={data.kpiSoderzhanie} kpiFinPodderzhka={data.kpiFinPodderzhka} />}
              {activeTab === 'costs' && <CostsPanel smety={data.smety} />}
              {activeTab === 'personnel' && <PersonnelPanel responsible={data.responsible} />}
            </motion.div>
          </AnimatePresence>
        </main>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="elegant-card rounded-3xl p-6 flex items-start gap-4"
        >
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl flex-shrink-0 border border-amber-500/20">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 text-xs text-[#a1a1aa] leading-relaxed">
            <h4 className="font-bold text-white">Источник данных</h4>
            <p>
              Показатели перенесены из документов «Инфоцентра» — KPI по соглашениям о субсидии, сметы «Содержание» и
              «Финансовая поддержка инжиниринг», диаграмма вовлечённости из документа «Качество. Инжиниринг».
              Живой интеграции со Списками Битрикс24 (как в дашборде РЦК) пока нет — константы прописаны в{' '}
              <code className="bg-[#1c1c1f] px-1.5 py-0.5 rounded text-amber-400 border border-[#2d2d34] font-mono">/src/data.ts</code>.
            </p>
          </div>
        </motion.footer>

      </div>
    </div>
  );
}
