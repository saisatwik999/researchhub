import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../../context/ProjectContext';
import Spinner from '../common/Spinner';
import { HiOutlineSearch, HiOutlineFilter, HiOutlineLightBulb, HiOutlineUserGroup } from 'react-icons/hi';

const ProjectList = () => {
  const { projects, loading, pagination, fetchProjects } = useProjects();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [searchTimer, setSearchTimer] = useState(null);

  useEffect(() => { fetchProjects({ search, status: statusFilter, page }); }, [search, statusFilter, page]);

  const handleSearch = (value) => {
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => { setSearch(value); setPage(1); }, 400));
  };

  const getStatusBadge = (s) => ({ 'open': 'badge-success', 'in-progress': 'badge-warning', 'completed': 'badge-primary' }[s] || 'badge-primary');

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-1">Research Ideas</h1>
          <p className="text-dark-400">{pagination.total} projects available</p>
        </div>
        <Link to="/projects/create" className="btn-primary flex items-center gap-2 w-fit">
          <HiOutlineLightBulb className="w-5 h-5" /> Post Idea
        </Link>
      </div>

      <div className="glass-card p-4 mb-6 hover:transform-none flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
          <input id="search-projects" type="text" onChange={(e) => handleSearch(e.target.value)} className="glass-input w-full pl-12" placeholder="Search projects..." />
        </div>
        <select id="filter-status" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="glass-input min-w-[160px]">
          <option value="" className="bg-dark-800">All Status</option>
          <option value="open" className="bg-dark-800">Open</option>
          <option value="in-progress" className="bg-dark-800">In Progress</option>
          <option value="completed" className="bg-dark-800">Completed</option>
        </select>
      </div>

      {loading ? <Spinner size="lg" text="Loading projects..." /> : projects.length === 0 ? (
        <div className="glass-card p-12 text-center hover:transform-none">
          <HiOutlineLightBulb className="w-16 h-16 text-dark-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Projects Found</h3>
          <p className="text-dark-400">Try adjusting your search or post a new idea!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map(project => (
              <Link key={project._id} to={`/projects/${project._id}`} className="glass-card p-6 flex flex-col group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-dark-400 bg-white/5 px-2.5 py-1 rounded-lg">{project.category || 'General'}</span>
                  <span className={getStatusBadge(project.status)}>{project.status}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-300 transition-colors line-clamp-2">{project.title}</h3>
                <p className="text-dark-400 text-sm flex-1 line-clamp-3 mb-4">{project.description}</p>
                {project.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.tags.slice(0, 3).map((tag, i) => (<span key={i} className="text-xs bg-primary-500/10 text-primary-400 px-2 py-0.5 rounded-md">{tag}</span>))}
                    {project.tags.length > 3 && <span className="text-xs text-dark-500">+{project.tags.length - 3}</span>}
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">{project.createdBy?.name?.charAt(0)?.toUpperCase()}</div>
                    <span className="text-xs text-dark-400">{project.createdBy?.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-dark-400">
                    <HiOutlineUserGroup className="w-4 h-4" />
                    <span className="text-xs">{project.teamMembers?.length || 0}/{project.maxTeamSize || 5}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-4 py-2 text-sm disabled:opacity-30">Previous</button>
              <span className="text-dark-400 text-sm px-4">Page {pagination.page} of {pagination.pages}</span>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="btn-secondary px-4 py-2 text-sm disabled:opacity-30">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectList;
