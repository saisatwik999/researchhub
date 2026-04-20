import { useEffect, useState } from 'react';
import { useProjects } from '../../context/ProjectContext';
import Spinner from '../common/Spinner';
import { HiOutlineCheck, HiOutlineX, HiOutlineClock } from 'react-icons/hi';

const CollaborationRequests = () => {
  const { collaborationRequests, fetchReceivedRequests, approveRequest, rejectRequest } = useProjects();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => { await fetchReceivedRequests(); setLoading(false); };
    load();
  }, []);

  const filtered = filter === 'all' ? collaborationRequests : collaborationRequests.filter(r => r.status === filter);
  const getStatusIcon = (s) => ({ pending: <HiOutlineClock className="w-4 h-4 text-amber-400" />, approved: <HiOutlineCheck className="w-4 h-4 text-emerald-400" />, rejected: <HiOutlineX className="w-4 h-4 text-red-400" /> }[s]);
  const getStatusBadge = (s) => ({ pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' }[s]);

  if (loading) return <Spinner size="lg" text="Loading requests..." />;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-1">Collaboration Requests</h1>
        <p className="text-dark-400">Manage join requests for your projects</p>
      </div>

      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${filter === f ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30' : 'bg-white/5 text-dark-400 hover:bg-white/10'}`}>
            {f} {f !== 'all' && `(${collaborationRequests.filter(r => r.status === f).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center hover:transform-none">
          <HiOutlineClock className="w-16 h-16 text-dark-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Requests</h3>
          <p className="text-dark-400">No {filter !== 'all' ? filter : ''} collaboration requests found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(req => (
            <div key={req._id} className="glass-card p-5 hover:transform-none">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {req.userId?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-medium">{req.userId?.name}</h3>
                    <p className="text-xs text-dark-400">{req.userId?.email} • {req.userId?.role}</p>
                    <p className="text-xs text-dark-500 mt-1">For: <span className="text-primary-400">{req.ideaId?.title}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={getStatusBadge(req.status)}>{getStatusIcon(req.status)} {req.status}</span>
                  {req.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => approveRequest(req._id)} className="btn-success text-sm flex items-center gap-1">
                        <HiOutlineCheck className="w-4 h-4" /> Approve
                      </button>
                      <button onClick={() => rejectRequest(req._id)} className="btn-danger text-sm flex items-center gap-1">
                        <HiOutlineX className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {req.message && <p className="text-dark-300 text-sm mt-3 pl-13 border-t border-white/5 pt-3">{req.message}</p>}
              {req.userId?.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 pl-13">
                  {req.userId.skills.map((s, i) => <span key={i} className="text-xs bg-primary-500/10 text-primary-400 px-2 py-0.5 rounded-md">{s}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollaborationRequests;
