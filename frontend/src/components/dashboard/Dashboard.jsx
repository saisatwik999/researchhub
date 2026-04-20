import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import API from '../../utils/api';
import Spinner from '../common/Spinner';
import { HiOutlineLightBulb, HiOutlineUserGroup, HiOutlineClipboardList, HiOutlineChatAlt2, HiOutlinePlus, HiOutlineArrowRight } from 'react-icons/hi';

/**
 * Dashboard: Main hub showing overview stats, recent projects, and quick actions
 */
const Dashboard = () => {
  const { user } = useAuth();
  const { myProjects, fetchMyProjects } = useProjects();
  const [myTasks, setMyTasks] = useState([]);
  const [joinedProjects, setJoinedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchMyProjects();
        const [tasksRes, joinedRes] = await Promise.all([
          API.get('/tasks/my'),
          API.get('/projects/joined')
        ]);
        setMyTasks(tasksRes.data);
        setJoinedProjects(joinedRes.data);
      } catch (error) {
        console.error('Dashboard load error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <Spinner size="lg" text="Loading dashboard..." />;

  const stats = [
    { label: 'My Projects', value: myProjects.length, icon: HiOutlineLightBulb, color: 'from-primary-500 to-indigo-600', bg: 'bg-primary-500/10' },
    { label: 'Joined Teams', value: joinedProjects.length, icon: HiOutlineUserGroup, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-500/10' },
    { label: 'My Tasks', value: myTasks.length, icon: HiOutlineClipboardList, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-500/10' },
    { label: 'Pending Tasks', value: myTasks.filter(t => t.status !== 'done').length, icon: HiOutlineChatAlt2, color: 'from-rose-500 to-pink-600', bg: 'bg-rose-500/10' },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      'open': 'badge-success',
      'in-progress': 'badge-warning',
      'completed': 'badge-primary',
      'todo': 'badge-danger',
      'done': 'badge-success',
    };
    return styles[status] || 'badge-primary';
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, <span className="gradient-text">{user?.name}</span>
          </h1>
          <p className="text-dark-400 mt-1">Here's what's happening with your research today.</p>
        </div>
        <Link to="/projects/create" className="btn-primary flex items-center gap-2 w-fit">
          <HiOutlinePlus className="w-5 h-5" />
          New Idea
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-5 group">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text`} style={{ color: 'inherit' }} />
              </div>
              <span className="text-3xl font-bold text-white">{stat.value}</span>
            </div>
            <p className="text-dark-400 text-sm font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Projects */}
        <div className="glass-card p-6 hover:transform-none">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white">My Projects</h2>
            <Link to="/projects" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1">
              View All <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {myProjects.length === 0 ? (
            <div className="text-center py-8">
              <HiOutlineLightBulb className="w-12 h-12 text-dark-500 mx-auto mb-3" />
              <p className="text-dark-400 text-sm">No projects yet. Start by posting your first idea!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myProjects.slice(0, 4).map(project => (
                <Link
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className="block p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200 border border-white/5 hover:border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white truncate">{project.title}</h3>
                      <p className="text-xs text-dark-400 mt-1">{project.teamMembers?.length || 0} members</p>
                    </div>
                    <span className={getStatusBadge(project.status)}>{project.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* My Tasks */}
        <div className="glass-card p-6 hover:transform-none">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white">My Tasks</h2>
            <span className="text-xs text-dark-400">{myTasks.filter(t => t.status !== 'done').length} pending</span>
          </div>
          {myTasks.length === 0 ? (
            <div className="text-center py-8">
              <HiOutlineClipboardList className="w-12 h-12 text-dark-500 mx-auto mb-3" />
              <p className="text-dark-400 text-sm">No tasks assigned to you yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myTasks.slice(0, 5).map(task => (
                <div
                  key={task._id}
                  className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">{task.title}</h3>
                    <p className="text-xs text-dark-400 mt-1">{task.projectId?.title || 'Project'}</p>
                  </div>
                  <span className={getStatusBadge(task.status)}>{task.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-6 hover:transform-none">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link to="/projects/create" className="p-4 bg-primary-500/10 rounded-xl border border-primary-500/20 hover:bg-primary-500/20 transition-all text-center group">
            <HiOutlineLightBulb className="w-8 h-8 text-primary-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-primary-300">Post New Idea</span>
          </Link>
          <Link to="/projects" className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-center group">
            <HiOutlineUserGroup className="w-8 h-8 text-emerald-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-emerald-300">Browse Projects</span>
          </Link>
          <Link to="/collaborations" className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 hover:bg-amber-500/20 transition-all text-center group">
            <HiOutlineChatAlt2 className="w-8 h-8 text-amber-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-amber-300">Collaboration Requests</span>
          </Link>
          <Link to="/profile" className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/20 hover:bg-rose-500/20 transition-all text-center group">
            <HiOutlineClipboardList className="w-8 h-8 text-rose-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-rose-300">Update Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
