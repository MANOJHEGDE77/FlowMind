import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  ArrowRight,
  Plus,
  GitBranch,
  Layers,
  Zap,
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
  const [selectedPriority, setSelectedPriority] = useState<ConnectedTask['priority']>('high');

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

  const activeGoal = flows.find((f) => f.id === (selectedFlowFilter === 'all' ? flows[0]?.id : selectedFlowFilter)) || flows[0];
  const goalTasks = tasks.filter((t) => t.flowId === activeGoal?.id);
  const completedGoalTasks = goalTasks.filter((t) => t.completed);
  const goalProgress = goalTasks.length > 0 ? Math.round((completedGoalTasks.length / goalTasks.length) * 100) : activeGoal?.progress || 0;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const targetFlow = flows.find((f) => f.id === selectedTargetFlow) || flows[0];
    addTask({
      title: newTaskTitle.trim(),
      flowId: targetFlow.id,
      flowTitle: targetFlow.title,
      completed: false,
      priority: selectedPriority,
      dueDate: 'Today',
      estimatedMinutes: 30,
    });
    setNewTaskTitle('');
    setShowQuickAdd(false);
    soundService.playSuccess();
  };

  const priorityStyles: Record<string, { bg: string; text: string; border: string }> = {
    urgent: { bg: 'bg-[#FF5C6C]/10', text: 'text-[#FF5C6C]', border: 'border-[#FF5C6C]/30' },
    high: { bg: 'bg-[#F5B84B]/10', text: 'text-[#F5B84B]', border: 'border-[#F5B84B]/30' },
    medium: { bg: 'bg-[#7C5CFF]/10', text: 'text-[#9B84FF]', border: 'border-[#7C5CFF]/30' },
    low: { bg: 'bg-white/[0.04]', text: 'text-[#A7ACB8]', border: 'border-white/[0.08]' },
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#08090D] text-[#F4F5F7] p-6 lg:p-10 custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#45E0A8] mb-1">
              <Zap size={14} />
              <span>ACT MODE // EXECUTION PIPELINE</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
              Thought-Connected Actions
            </h1>
            <p className="text-xs text-[#A7ACB8] mt-1">
              Every action item maintains its relationship with the originating thought node. No orphan to-dos.
            </p>
          </div>

          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#45E0A8] to-[#5EE7FF] text-black font-semibold text-xs shadow-md shadow-[#45E0A8]/20 hover:opacity-95 transition-all self-start sm:self-auto"
          >
            <Plus size={14} />
            <span>New Action</span>
          </button>
        </div>

        {/* ACTIVE GOAL PROGRESS CARD (Goals ↓ Actions ↓ Progress) */}
        {activeGoal && (
          <div className="p-6 rounded-2xl bg-[#0F1118] border border-white/[0.08] space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#9B84FF]">
                  ANCHORED GOAL
                </span>
                <h2 className="text-lg font-semibold text-white">
                  {activeGoal.title}
                </h2>
              </div>
              <button
                onClick={() => onOpenCanvas(activeGoal.id)}
                className="text-xs font-medium text-[#5EE7FF] hover:underline flex items-center space-x-1"
              >
                <span>View Graph</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* PROGRESS BAR */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#686E7C]">Progress to Goal</span>
                <span className="text-[#45E0A8] font-semibold">{goalProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#7C5CFF] via-[#5EE7FF] to-[#45E0A8] transition-all duration-500"
                  style={{ width: `${goalProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#686E7C]">
                <span>{completedGoalTasks.length} of {goalTasks.length} actions executed</span>
                <span>{goalTasks.length - completedGoalTasks.length} pending</span>
              </div>
            </div>
          </div>
        )}

        {/* QUICK ADD FORM */}
        <AnimatePresence>
          {showQuickAdd && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreateTask}
              className="p-4 rounded-2xl bg-[#151823] border border-white/[0.1] space-y-3 shadow-xl"
            >
              <div className="text-xs font-semibold text-white">
                Create Action Anchored to Flow
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="What concrete action will you execute?"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#08090D] border border-white/[0.08] text-white placeholder-[#686E7C] text-xs focus:outline-none focus:border-[#7C5CFF]"
                  autoFocus
                />

                <select
                  value={selectedTargetFlow}
                  onChange={(e) => setSelectedTargetFlow(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#08090D] border border-white/[0.08] text-xs text-white focus:outline-none"
                >
                  {flows.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.title}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-[#08090D] border border-white/[0.08] text-xs text-white focus:outline-none"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#45E0A8] to-[#5EE7FF] text-black font-semibold text-xs hover:opacity-95 transition-opacity"
                >
                  Add
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* FILTER CONTROLS */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-[#0F1118] border border-white/[0.06]">
            {(['pending', 'all', 'completed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterState(st)}
                className={`px-3 py-1.5 rounded-lg transition-colors font-medium capitalize ${
                  filterState === st
                    ? 'bg-white/[0.08] text-white shadow-sm'
                    : 'text-[#686E7C] hover:text-[#A7ACB8]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[#686E7C]">Filter by Goal:</span>
            <select
              value={selectedFlowFilter}
              onChange={(e) => setSelectedFlowFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#0F1118] border border-white/[0.08] text-xs text-[#A7ACB8] focus:outline-none"
            >
              <option value="all">All Goals</option>
              {flows.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ACTIVE ACTIONS LIST */}
        <div className="space-y-2.5">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#0F1118] border border-white/[0.06] text-xs text-[#686E7C]">
              No actions in this queue. All thoughts up to date!
            </div>
          ) : (
            filteredTasks.map((task) => {
              const pStyle = priorityStyles[task.priority || 'medium'] || priorityStyles.medium;

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl bg-[#0F1118] border border-white/[0.08] hover:border-white/[0.16] hover:bg-[#151823] transition-all flex items-center justify-between gap-4 group ${
                    task.completed ? 'opacity-40' : ''
                  }`}
                >
                  {/* Left: Checkbox & Title */}
                  <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                    <button
                      onClick={() => {
                        toggleTask(task.id);
                        soundService.playSuccess();
                      }}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                        task.completed
                          ? 'bg-[#45E0A8] border-[#45E0A8] text-black'
                          : 'border-white/[0.2] hover:border-[#45E0A8] text-transparent'
                      }`}
                    >
                      <CheckCircle2 size={14} className={task.completed ? 'opacity-100' : 'opacity-0'} />
                    </button>

                    <div className="space-y-1 min-w-0">
                      <p
                        className={`text-sm font-medium leading-snug truncate ${
                          task.completed ? 'line-through text-[#686E7C]' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </p>

                      {/* Origin Provenance Link */}
                      <div className="flex items-center space-x-2 text-[11px] text-[#686E7C]">
                        <GitBranch size={11} className="text-[#7C5CFF]" />
                        <button
                          onClick={() => onOpenCanvas(task.flowId)}
                          className="hover:text-[#5EE7FF] hover:underline truncate max-w-xs"
                          title="View in parent graph"
                        >
                          {task.flowTitle}
                        </button>
                        {task.nodeTitle && (
                          <>
                            <span>/</span>
                            <span className="truncate max-w-[160px] text-[#A7ACB8]">
                              {task.nodeTitle}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Priority, Focus Trigger */}
                  <div className="flex items-center space-x-2.5 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider border ${pStyle.bg} ${pStyle.text} ${pStyle.border}`}
                    >
                      {task.priority || 'NORMAL'}
                    </span>

                    {!task.completed && (
                      <button
                        onClick={() => {
                          soundService.playClick();
                          onStartFocus(task);
                        }}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#F5B84B]/10 hover:bg-[#F5B84B]/20 border border-[#F5B84B]/30 text-[#F5B84B] text-xs font-medium transition-colors"
                        title="Start Deep Focus Sprint"
                      >
                        <Flame size={13} />
                        <span className="hidden sm:inline">Focus</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
