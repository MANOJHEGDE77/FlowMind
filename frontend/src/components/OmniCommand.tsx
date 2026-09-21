import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Network,
  Sparkles,
  CheckSquare,
  BookOpen,
  BarChart3,
  Layers,
  Home,
  ArrowRight,
  Plus,
  Flame,
} from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import { soundService } from '../services/sound';
import { AppView } from './AppNavigationRail';

interface OmniCommandProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: AppView) => void;
  onOpenFlow: (flowId: string) => void;
  onOpenAskAI: (query?: string) => void;
  onStartFocusTask?: (taskId: string) => void;
}

interface CommandItem {
  id: string;
  category: 'MODES' | 'ACTIONS' | 'FLOWS' | 'ACTIONS_QUEUE';
  title: string;
  desc?: string;
  icon: React.ElementType;
  action: () => void;
}

export const OmniCommand: React.FC<OmniCommandProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenFlow,
  onOpenAskAI,
}) => {
  const {
    flows,
    tasks,
    generateFlowFromPrompt,
    setActiveFlowId,
    setActiveFocusTask,
  } = useFlow();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const commandItems = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [
      {
        id: 'mode-flow',
        category: 'MODES',
        title: 'FLOW Mode (Canvas)',
        desc: 'Spatial knowledge graph and mental model canvas',
        icon: Network,
        action: () => onNavigate('canvas'),
      },
      {
        id: 'mode-think',
        category: 'MODES',
        title: 'THINK Mode (Reasoning)',
        desc: 'Structured reasoning pipeline: Thought → Insight → Action',
        icon: Sparkles,
        action: () => onNavigate('ai-think'),
      },
      {
        id: 'mode-act',
        category: 'MODES',
        title: 'ACT Mode (Tasks & Execution)',
        desc: 'Thought-anchored action queue and progress metrics',
        icon: CheckSquare,
        action: () => onNavigate('tasks'),
      },
      {
        id: 'nav-home',
        category: 'MODES',
        title: 'Flow Home',
        desc: 'Cognitive capture and recent flow previews',
        icon: Home,
        action: () => onNavigate('home'),
      },
      {
        id: 'nav-insights',
        category: 'MODES',
        title: 'Insights Dashboard',
        desc: 'Pattern metrics, decisions, and action conversion',
        icon: BarChart3,
        action: () => onNavigate('insights'),
      },
      {
        id: 'nav-library',
        category: 'MODES',
        title: 'Artifact Library',
        desc: 'Citations, references, and synthesized notes',
        icon: BookOpen,
        action: () => onNavigate('library'),
      },
      {
        id: 'act-ask',
        category: 'ACTIONS',
        title: 'Query Copilot',
        desc: 'Ask AI reasoning about your mental models',
        icon: Sparkles,
        action: () => onOpenAskAI(query),
      },
    ];

    flows.forEach((flow) => {
      items.push({
        id: `flow-${flow.id}`,
        category: 'FLOWS',
        title: flow.title,
        desc: `${flow.nodes.length} thoughts • ${flow.category}`,
        icon: Layers,
        action: () => {
          setActiveFlowId(flow.id);
          onNavigate('canvas');
        },
      });
    });

    tasks.filter((t) => !t.completed).slice(0, 4).forEach((task) => {
      items.push({
        id: `task-${task.id}`,
        category: 'ACTIONS_QUEUE',
        title: task.title,
        desc: `Anchored in: ${task.flowTitle}`,
        icon: Flame,
        action: () => {
          setActiveFocusTask(task);
          onNavigate('focus');
        },
      });
    });

    return items;
  }, [flows, tasks, query, onNavigate, setActiveFlowId, setActiveFocusTask, onOpenAskAI]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commandItems;
    return commandItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.desc?.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [commandItems, query]);

  const handleSelect = (item: CommandItem) => {
    soundService.playClick();
    item.action();
    onClose();
  };

  const handleKeyDownInInput = async (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(filteredItems.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(filteredItems.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems.length > 0 && selectedIndex < filteredItems.length) {
        handleSelect(filteredItems[selectedIndex]);
      } else if (query.trim()) {
        soundService.playChime();
        onClose();
        const created = await generateFlowFromPrompt(query.trim());
        if (created) {
          onNavigate('canvas');
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="w-full max-w-2xl rounded-2xl bg-[#0F1118] border border-white/[0.12] text-[#F4F5F7] shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Command Input Prompt */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] bg-[#151823]">
          <Search size={16} className="text-[#5EE7FF] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownInInput}
            placeholder="Type a command, thought concept, or jump to view..."
            className="flex-1 bg-transparent text-sm text-white placeholder-[#686E7C] focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] text-[10px] font-mono text-[#A7ACB8]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-xs text-[#A7ACB8]">
                No matching commands found. Press <strong className="text-white">Enter</strong> to synthesize a new Flow:
              </p>
              <div className="text-sm font-semibold text-[#5EE7FF] truncate">
                &quot;{query}&quot;
              </div>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#7C5CFF]/15 border border-[#7C5CFF]/40 text-white shadow-sm'
                      : 'hover:bg-white/[0.03] text-[#A7ACB8]'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#7C5CFF]/20 text-[#5EE7FF]' : 'bg-white/[0.04] text-[#686E7C]'}`}>
                      <Icon size={16} />
                    </div>

                    <div className="truncate">
                      <div className="text-xs font-semibold text-white truncate">
                        {item.title}
                      </div>
                      {item.desc && (
                        <div className="text-[11px] text-[#686E7C] truncate">
                          {item.desc}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 text-xs">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/[0.04] text-[#686E7C]">
                      {item.category.replace('_', ' ')}
                    </span>
                    {isSelected && (
                      <ArrowRight size={13} className="text-[#5EE7FF]" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-[#08090D] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#686E7C] font-mono">
          <span>Navigate: ↑ ↓ • Select: ↵</span>
          <span>FlowMind Command Engine</span>
        </div>
      </div>
    </div>
  );
};
