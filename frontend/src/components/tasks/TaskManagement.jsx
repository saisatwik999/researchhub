import { useEffect, useState } from 'react';
import { useProjects } from '../../context/ProjectContext';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineCalendar } from 'react-icons/hi';

const TaskManagement = ({ projectId, isCreator, isMember, teamMembers = [] }) => {
  const { tasks, fetchTasks, createTask, updateTask, deleteTask } = useProjects();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', deadline: '', priority: 'medium' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (projectId) fetchTasks(projectId); }, [projectId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const task = await createTask({ ...form, projectId, assignedTo: form.assignedTo || undefined, deadline: form.deadline || undefined });
    if (task) { setForm({ title: '', description: '', assignedTo: '', deadline: '', priority: 'medium' }); setShowForm(false); }
    setLoading(false);
  };

  const handleStatusChange = async (taskId, status) => { await updateTask(taskId, { status }); };

  const statusCols = [
    { key: 'todo', label: 'To Do', color: 'border-red-500/30', bg: 'bg-red-500/5' },
    { key: 'in-progress', label: 'In Progress', color: 'border-amber-500/30', bg: 'bg-amber-500/5' },
    { key: 'done', label: 'Done', color: 'border-emerald-500/30', bg: 'bg-emerald-500/5' },
  ];

  const priorityBadge = (p) => ({ low: 'bg-blue-500/20 text-blue-300', medium: 'bg-amber-500/20 text-amber-300', high: 'bg-red-500/20 text-red-300' }[p] || '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Tasks ({tasks.length})</h2>
        {(isCreator || isMember) && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm flex items-center gap-1.5">
            <HiOutlinePlus className="w-4 h-4" /> Add Task
          </button>
        )}
      </div>

      {/* Create Task Form */}
      {showForm && (
        <div className="glass-card p-5 hover:transform-none animate-slide-down">
          <form onSubmit={handleCreate} className="space-y-4">
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="glass-input w-full" placeholder="Task title" />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="glass-input w-full h-20 resize-none" placeholder="Description (optional)" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} className="glass-input">
                <option value="" className="bg-dark-800">Unassigned</option>
                {teamMembers.map(m => (<option key={m._id} value={m._id} className="bg-dark-800">{m.name}</option>))}
              </select>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="glass-input">
                <option value="low" className="bg-dark-800">Low Priority</option>
                <option value="medium" className="bg-dark-800">Medium Priority</option>
                <option value="high" className="bg-dark-800">High Priority</option>
              </select>
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="glass-input" />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary text-sm flex items-center gap-1.5">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiOutlinePlus className="w-4 h-4" />} Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusCols.map(col => (
          <div key={col.key} className={`rounded-xl border ${col.color} ${col.bg} p-4 min-h-[200px]`}>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center justify-between">
              {col.label}
              <span className="text-xs text-dark-400 bg-white/10 px-2 py-0.5 rounded-full">{tasks.filter(t => t.status === col.key).length}</span>
            </h3>
            <div className="space-y-3">
              {tasks.filter(t => t.status === col.key).map(task => (
                <div key={task._id} className="bg-dark-800/50 backdrop-blur rounded-lg p-3 border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-white flex-1">{task.title}</h4>
                    {(isCreator || isMember) && (
                      <button onClick={() => deleteTask(task._id)} className="text-dark-500 hover:text-red-400 transition-colors ml-2">
                        <HiOutlineTrash className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {task.description && <p className="text-xs text-dark-400 mb-2 line-clamp-2">{task.description}</p>}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-md ${priorityBadge(task.priority)}`}>{task.priority}</span>
                    {task.deadline && (
                      <span className="text-xs text-dark-400 flex items-center gap-1">
                        <HiOutlineCalendar className="w-3 h-3" /> {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {task.assignedTo && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">{task.assignedTo?.name?.charAt(0)?.toUpperCase()}</div>
                      <span className="text-xs text-dark-400">{task.assignedTo?.name}</span>
                    </div>
                  )}
                  {(isCreator || isMember) && (
                    <select value={task.status} onChange={(e) => handleStatusChange(task._id, e.target.value)} className="w-full text-xs bg-white/5 border border-white/10 rounded-md px-2 py-1 text-dark-300 mt-1">
                      <option value="todo" className="bg-dark-800">To Do</option>
                      <option value="in-progress" className="bg-dark-800">In Progress</option>
                      <option value="done" className="bg-dark-800">Done</option>
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskManagement;
