import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Award,
  Clock,
  CheckCircle2,
  TrendingUp,
  PiggyBank,
  Users2,
  Info,
  Pencil,
  Eye,
  Settings,
  Download,
  Upload,
  RotateCcw,
  Eraser,
} from 'lucide-react';

import { TabId, DashboardState, AnyCard } from './types';
import { useDashboardStore } from './store';
import TabBoard from './components/TabBoard';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('production');
  const [editMode, setEditMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { state, addCard, updateCard, deleteCard, moveCard, resetToSeed, clearAll, replaceAll } = useDashboardStore();

  const formattedToday = useMemo(() => {
    return new Date().toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
  }, []);

  const tabs = [
    { id: 'security', label: 'Безопасность', color: 'bg-red-500', shadowColor: 'rgba(239, 68, 68, 0.15)', hoverBg: 'hover:bg-red-500/5', activeText: 'text-red-400 bg-red-500/10 border-red-500/20', icon: ShieldCheck },
    { id: 'quality', label: 'Качество', color: 'bg-blue-500', shadowColor: 'rgba(59, 130, 246, 0.15)', hoverBg: 'hover:bg-blue-500/5', activeText: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: Award },
    { id: 'production', label: 'Производство', color: 'bg-amber-500', shadowColor: 'rgba(245, 158, 11, 0.15)', hoverBg: 'hover:bg-amber-500/5', activeText: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: TrendingUp },
    { id: 'costs', label: 'Затраты', color: 'bg-emerald-500', shadowColor: 'rgba(16, 185, 129, 0.15)', hoverBg: 'hover:bg-emerald-500/5', activeText: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: PiggyBank },
    { id: 'personnel', label: 'Персонал', color: 'bg-indigo-500', shadowColor: 'rgba(99, 102, 241, 0.15)', hoverBg: 'hover:bg-indigo-500/5', activeText: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', icon: Users2 },
  ] as const;

  const totalCards = (Object.values(state) as AnyCard[][]).reduce((acc, list) => acc + list.length, 0);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `infocenter-iic-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMenuOpen(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as DashboardState;
        const validKeys: TabId[] = ['security', 'quality', 'production', 'costs', 'personnel'];
        const isValid = validKeys.every((k) => Array.isArray(parsed[k]));
        if (!isValid) throw new Error('bad shape');
        replaceAll(parsed);
        setMenuOpen(false);
      } catch {
        alert('Не удалось прочитать файл — это должен быть JSON, экспортированный из этого дашборда.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (confirm('Восстановить пример ИИЦ? Текущие карточки на всех вкладках будут заменены.')) {
      resetToSeed();
      setMenuOpen(false);
    }
  };

  const handleClear = () => {
    if (confirm('Очистить все вкладки? Это удалит все карточки без возможности отмены (кроме экспортированного JSON).')) {
      clearAll();
      setMenuOpen(false);
    }
  };

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
                <span>Сегодня: <span className="text-white">{formattedToday}</span></span>
              </span>
              <span className="flex items-center gap-1.5 bg-[#161619] px-3 py-1 rounded-full border border-[#27272a]">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Карточек всего: <span className="text-white">{totalCards}</span></span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditMode((v) => !v)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                editMode
                  ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                  : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-300 hover:text-white'
              }`}
            >
              {editMode ? <Pencil className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {editMode ? 'Режим редактирования' : 'Режим просмотра'}
            </button>

            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="p-2.5 rounded-xl bg-zinc-800/60 border border-zinc-700/60 text-zinc-300 hover:text-white transition-colors"
                title="Настройки данных"
              >
                <Settings className="w-4 h-4" />
              </button>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-64 bg-[#161619] border border-[#27272a] rounded-xl shadow-2xl overflow-hidden z-20"
                >
                  <button onClick={handleExport} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-zinc-200 hover:bg-zinc-800/60 transition-colors">
                    <Download className="w-4 h-4 text-emerald-400" /> Экспортировать JSON
                  </button>
                  <button onClick={handleImportClick} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-zinc-200 hover:bg-zinc-800/60 transition-colors">
                    <Upload className="w-4 h-4 text-blue-400" /> Импортировать JSON
                  </button>
                  <button onClick={handleReset} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-zinc-200 hover:bg-zinc-800/60 transition-colors border-t border-[#1f1f23]">
                    <RotateCcw className="w-4 h-4 text-amber-400" /> Сбросить к примеру ИИЦ
                  </button>
                  <button onClick={handleClear} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-rose-300 hover:bg-rose-500/10 transition-colors border-t border-[#1f1f23]">
                    <Eraser className="w-4 h-4" /> Очистить всё (пустой инфоцентр)
                  </button>
                </motion.div>
              )}
              <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
            </div>
          </div>
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
                  <span className="text-[10px] font-mono text-[#71717a]">{state[tab.id as TabId].length}</span>
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
          <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <TabBoard
              tab={activeTab}
              cards={state[activeTab]}
              editMode={editMode}
              onAdd={addCard}
              onUpdate={updateCard}
              onDelete={deleteCard}
              onMove={moveCard}
            />
          </motion.div>
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
            <h4 className="font-bold text-white">Как это работает</h4>
            <p>
              Включите «Режим редактирования», чтобы добавлять, изменять и удалять карточки на любой вкладке —
              KPI, графики (столбчатые, линейные, с областями, круговые), сметы, списки и карточки ответственных.
              Все изменения сохраняются прямо в этом браузере. Чтобы не потерять данные или перенести их на другое
              устройство — экспортируйте JSON через значок настроек.
            </p>
          </div>
        </motion.footer>

      </div>
    </div>
  );
}
