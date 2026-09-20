import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Flame,
  ArrowRight,
  Filter,
  Plus,
  GitBranch,
  Layers,
} from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import { ConnectedTask } from '../types';
import { soundService } from '../services/sound';

interface TasksPageProps {
  onStartFocus: (task: ConnectedTask) => void;
  onOpenCanvas: (flowId: string) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({
  onStartFocus,
  onOpenCanvas,
}) => {
  const { tasks, toggleTask, flows, addTask } = useFlow();
  const [filterState, setFilterState] = useState<'all' | 'pending' | 'completed'>('pending');
  const [selectedFlowFilter, setSelectedFlowFilter] = useState<string>('all');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTargetFlow, setSelectedTargetFlow] = useState(flows[0]?.id || '');

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchState =
        filterState === 'all'
          ? true
          : filterState === 'pending'
          ? !t.completed
          : t.completed;
      const matchFlow =
        selectedFlowFilter === 'all' || t.flowId === selectedFlowFilter;
      return matchState && matchFlow;
    });
  }, [tasks, filterState, selectedFlowFilter]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const targetFlow = flows.find((f) => f.id === selectedTargetFlow) || flows[0];
    addTask({
      title: newTaskTitle.trim(),
      flowId: targetFlow.id,
      flowTitle: targetFlow.title,
      completed: false,
      priority: 'high',
      dueDate: 'Today',
      estimatedMinutes: 30,
    });
    setNewTaskTitle('');
    setShowQuickAdd(false);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-gradient-to-b from-[#06080F] via-[#090C16] to-[#06080F] text-slate-100 p-6 lg:p-10 custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-violet-300">
                Action Stream
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Thought-Connected Tasks
            </h1>
            <p className="text-sm text-slate-400 mt-1 font-light">
              Every action is anchored in a larger cognitive roadmap. No orphan to-dos.
            </p>
          </div>

          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-lg shadow-violet-950/40 transition-all self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Connect Task</span>
          </button>
        </div>

        {/* QUICK ADD MODAL / ACCORDION */}
        <AnimatePresence>
          {showQuickAdd && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreateTask}
              className="p-5 rounded-2xl bg-[#0D1022] border border-violet-500/30 shadow-xl space-y-3 overflow-hidden"
            >
              <h3 className="text-xs font-mono uppercase text-violet-300">
                New Action Node
              </h3>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="What action needs to be taken?"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-400"
                autoFocus
              />
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-slate-400 font-mono">Anchor to Flow:</span>
                  <select
                    value={selectedTargetFlow}
                    onChange={(e) => setSelectedTargetFlow(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                  >
                    {flows.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setShowQuickAdd(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
                  >
                    Anchor Action
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* FILTERS */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-slate-800">
            {(['pending', 'completed', 'all'] as const).map((state) => (
              <button
                key={state}
                onClick={() => {
                  soundService.playClick();
                  setFilterState(state);
                }}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                  filterState === state
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {state}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Flow Origin:</span>
            <select
              value={selectedFlowFilter}
              onChange={(e) => setSelectedFlowFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-violet-500"
            >
              <option value="all">All Flows</option>
              {flows.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TASKS LIST */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center space-y-2 bg-[#0A0D18]/50 rounded-2xl border border-dashed border-slate-800">
              <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-400">
                No tasks in this view.
              </p>
              <p className="text-xs text-slate-500">
                All cognitive milestones are currently up to date.
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`group p-4 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-4 ${
                  task.completed
                    ? 'bg-[#090C16]/50 border-slate-800/60 opacity-60'
                    : 'bg-[#0B0F20]/90 border-slate-800 hover:border-violet-500/40 shadow-lg shadow-black/30'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 text-slate-500 hover:text-violet-400 transition-colors shrink-0"
                    title={task.completed ? 'Mark pending' : 'Mark complete'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 group-hover:text-violet-400" />
                    )}
                  </button>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold tracking-tight transition-colors ${
                        task.completed
                          ? 'line-through text-slate-500'
                          : 'text-white group-hover:text-violet-200'
                      }`}
                    >
                      {task.title}
                    </p>

                    {/* PROVENANCE: ↳ from [Flow Name] */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <button
                        onClick={() => onOpenCanvas(task.flowId)}
                        className="inline-flex items-center gap-1 font-mono text-cyan-400/90 hover:text-cyan-300 hover:underline bg-cyan-950/30 px-2 py-0.5 rounded-md border border-cyan-800/30"
                      >
                        <GitBranch size={11} />
                        <span>↳ from {task.flowTitle}</span>
                      </button>

                      {task.dueDate && (
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock size={11} /> {task.dueDate}
                        </span>
                      )}

                      {task.estimatedMinutes && (
                        <span className="text-[11px] font-mono text-slate-500">
                          ~{task.estimatedMinutes}m
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Quick Actions */}
                {!task.completed && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        soundService.playChime();
                        onStartFocus(task);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-mono flex items-center gap-1.5 transition-colors shadow-sm"
                      title="Launch distraction-free focus session"
                    >
                      <Flame size={13} className="text-amber-400" />
                      <span>Focus</span>
                    </button>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
