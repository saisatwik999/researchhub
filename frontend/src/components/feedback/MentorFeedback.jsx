import { useEffect, useState } from 'react';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineChatAlt2, HiOutlinePaperAirplane, HiOutlineTrash } from 'react-icons/hi';

const MentorFeedback = ({ projectId, isMentor, isCreator, isMember }) => {
  const { feedback, fetchFeedback, addFeedback, deleteFeedback } = useProjects();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [type, setType] = useState('feedback');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (projectId) fetchFeedback(projectId); }, [projectId]);

  const canPost = isMentor || isCreator || isMember || user?.role === 'admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    await addFeedback({ projectId, message, type });
    setMessage('');
    setLoading(false);
  };

  const typeStyles = {
    feedback: { badge: 'bg-primary-500/20 text-primary-300', label: '💬 Feedback' },
    update: { badge: 'bg-emerald-500/20 text-emerald-300', label: '📢 Update' },
    review: { badge: 'bg-amber-500/20 text-amber-300', label: '📝 Review' },
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <HiOutlineChatAlt2 className="w-5 h-5 text-primary-400" /> Feedback & Updates ({feedback.length})
      </h2>

      {/* Post Form */}
      {canPost && (
        <div className="glass-card p-5 hover:transform-none">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2 mb-2">
              {Object.entries(typeStyles).map(([key, val]) => (
                <button key={key} type="button" onClick={() => setType(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${type === key ? val.badge + ' border border-current/20' : 'bg-white/5 text-dark-400 hover:bg-white/10'}`}>
                  {val.label}
                </button>
              ))}
            </div>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="glass-input w-full h-24 resize-none" placeholder={isMentor ? "Share your expert feedback on this project..." : "Post an update or comment..."} required />
            <button type="submit" disabled={loading || !message.trim()} className="btn-primary text-sm flex items-center gap-1.5">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiOutlinePaperAirplane className="w-4 h-4" />}
              Post {type}
            </button>
          </form>
        </div>
      )}

      {/* Feedback List */}
      {feedback.length === 0 ? (
        <div className="glass-card p-8 text-center hover:transform-none">
          <HiOutlineChatAlt2 className="w-12 h-12 text-dark-500 mx-auto mb-3" />
          <p className="text-dark-400">No feedback yet. {isMentor ? 'Be the first to provide feedback!' : ''}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map(fb => (
            <div key={fb._id} className="glass-card p-5 hover:transform-none animate-fade-in">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {fb.userId?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{fb.userId?.name}</span>
                      <span className="text-xs text-dark-500 capitalize">({fb.userId?.role})</span>
                      <span className={`text-xs px-2 py-0.5 rounded-md ${typeStyles[fb.type]?.badge || ''}`}>{fb.type}</span>
                    </div>
                    <span className="text-xs text-dark-500">{new Date(fb.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                {(fb.userId?._id === user?._id || user?.role === 'admin') && (
                  <button onClick={() => deleteFeedback(fb._id)} className="text-dark-500 hover:text-red-400 transition-colors">
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-dark-300 text-sm mt-3 leading-relaxed whitespace-pre-wrap">{fb.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorFeedback;
