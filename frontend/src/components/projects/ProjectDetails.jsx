import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner';
import TaskManagement from '../tasks/TaskManagement';
import MentorFeedback from '../feedback/MentorFeedback';
import { HiOutlineUserGroup, HiOutlineTag, HiOutlinePencil, HiOutlineTrash, HiOutlinePaperAirplane } from 'react-icons/hi';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentProject, fetchProjectById, updateProject, deleteProject, sendCollabRequest, loading } = useProjects();
  const [tab, setTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [joinMsg, setJoinMsg] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => { fetchProjectById(id); }, [id]);

  useEffect(() => {
    if (currentProject) {
      setEditData({ title: currentProject.title, description: currentProject.description, status: currentProject.status, tags: currentProject.tags?.join(', ') || '' });
    }
  }, [currentProject]);

  if (loading || !currentProject) return <Spinner size="lg" text="Loading project..." />;

  const isCreator = currentProject.createdBy?._id === user?._id;
  const isMember = currentProject.teamMembers?.some(m => m._id === user?._id);
  const isMentor = user?.role === 'mentor';
  const isAdmin = user?.role === 'admin';

  const handleUpdate = async () => {
    await updateProject(id, { ...editData, tags: editData.tags.split(',').map(t => t.trim()).filter(Boolean) });
    setEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const success = await deleteProject(id);
      if (success) navigate('/projects');
    }
  };

  const handleJoinRequest = async () => {
    setJoinLoading(true);
    await sendCollabRequest({ ideaId: id, message: joinMsg });
    setJoinMsg('');
    setJoinLoading(false);
  };

  const getStatusColor = (s) => ({ 'open': 'badge-success', 'in-progress': 'badge-warning', 'completed': 'badge-primary' }[s] || 'badge-primary');
  const tabs = [{ id: 'overview', label: 'Overview' }, { id: 'tasks', label: 'Tasks' }, { id: 'feedback', label: 'Feedback' }];

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="glass-card p-6 mb-6 hover:transform-none">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            {editing ? (
              <input value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} className="glass-input w-full text-xl font-bold mb-2" />
            ) : (
              <h1 className="text-2xl font-bold text-white mb-2">{currentProject.title}</h1>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <span className={getStatusColor(currentProject.status)}>{currentProject.status}</span>
              <span className="text-xs text-dark-400">{currentProject.category || 'General'}</span>
              <span className="text-xs text-dark-500">Created {new Date(currentProject.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          {(isCreator || isAdmin) && (
            <div className="flex gap-2">
              <button onClick={() => editing ? handleUpdate() : setEditing(true)} className="btn-secondary flex items-center gap-1 text-sm">
                <HiOutlinePencil className="w-4 h-4" /> {editing ? 'Save' : 'Edit'}
              </button>
              <button onClick={handleDelete} className="btn-danger flex items-center gap-1 text-sm">
                <HiOutlineTrash className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>
        {editing && (
          <div className="mt-4 space-y-3">
            <select value={editData.status} onChange={(e) => setEditData({ ...editData, status: e.target.value })} className="glass-input">
              <option value="open" className="bg-dark-800">Open</option>
              <option value="in-progress" className="bg-dark-800">In Progress</option>
              <option value="completed" className="bg-dark-800">Completed</option>
            </select>
            <input value={editData.tags} onChange={(e) => setEditData({ ...editData, tags: e.target.value })} className="glass-input w-full" placeholder="Tags (comma-separated)" />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-primary-500/20 text-primary-300' : 'text-dark-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6 hover:transform-none">
              <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
              {editing ? (
                <textarea value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} className="glass-input w-full h-40 resize-none" />
              ) : (
                <p className="text-dark-300 leading-relaxed whitespace-pre-wrap">{currentProject.description}</p>
              )}
            </div>
            {currentProject.tags?.length > 0 && (
              <div className="glass-card p-6 hover:transform-none">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><HiOutlineTag className="w-5 h-5" /> Tags</h2>
                <div className="flex flex-wrap gap-2">{currentProject.tags.map((tag, i) => (<span key={i} className="badge-primary">{tag}</span>))}</div>
              </div>
            )}
            {/* Join Request (non-members only) */}
            {!isMember && !isCreator && user?.role === 'student' && currentProject.status === 'open' && (
              <div className="glass-card p-6 hover:transform-none">
                <h2 className="text-lg font-semibold text-white mb-3">Interested in joining?</h2>
                <textarea value={joinMsg} onChange={(e) => setJoinMsg(e.target.value)} className="glass-input w-full h-20 resize-none mb-3" placeholder="Why do you want to join this project?" />
                <button onClick={handleJoinRequest} disabled={joinLoading} className="btn-primary flex items-center gap-2">
                  {joinLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiOutlinePaperAirplane className="w-4 h-4" />}
                  Send Join Request
                </button>
              </div>
            )}
          </div>
          {/* Sidebar — Team */}
          <div className="space-y-6">
            <div className="glass-card p-6 hover:transform-none">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><HiOutlineUserGroup className="w-5 h-5" /> Team ({currentProject.teamMembers?.length}/{currentProject.maxTeamSize})</h2>
              <div className="space-y-3">
                {currentProject.teamMembers?.map(member => (
                  <div key={member._id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">{member.name?.charAt(0)?.toUpperCase()}</div>
                    <div>
                      <p className="text-sm font-medium text-white">{member.name}</p>
                      <p className="text-xs text-dark-400 capitalize">{member._id === currentProject.createdBy?._id ? 'Creator' : member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card p-6 hover:transform-none">
              <h2 className="text-sm font-semibold text-dark-300 mb-3">Project Info</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-dark-400">Created by</span><span className="text-white">{currentProject.createdBy?.name}</span></div>
                <div className="flex justify-between"><span className="text-dark-400">Status</span><span className={getStatusColor(currentProject.status)}>{currentProject.status}</span></div>
                <div className="flex justify-between"><span className="text-dark-400">Team Size</span><span className="text-white">{currentProject.teamMembers?.length}/{currentProject.maxTeamSize}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
      {tab === 'tasks' && <TaskManagement projectId={id} isCreator={isCreator} isMember={isMember} teamMembers={currentProject.teamMembers} />}
      {tab === 'feedback' && <MentorFeedback projectId={id} isMentor={isMentor} isCreator={isCreator} isMember={isMember} />}
    </div>
  );
};

export default ProjectDetails;
