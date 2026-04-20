import { useEffect, useState } from 'react';
import API from '../../utils/api';
import Spinner from '../common/Spinner';
import toast from 'react-hot-toast';
import { HiOutlineUsers, HiOutlineLightBulb, HiOutlineTrash, HiOutlineShieldCheck } from 'react-icons/hi';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [projectStats, setProjectStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [usRes, psRes, uListRes, pListRes] = await Promise.all([
          API.get('/users/stats/overview'),
          API.get('/projects/stats/overview'),
          API.get('/users'),
          API.get('/projects'),
        ]);
        setUserStats(usRes.data);
        setProjectStats(psRes.data);
        setUsers(uListRes.data);
        setProjects(pListRes.data.projects || []);
      } catch (err) { toast.error('Failed to load admin data'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      const res = await API.put(`/users/${userId}/role`, { role });
      setUsers(prev => prev.map(u => u._id === userId ? res.data : u));
      toast.success('Role updated');
    } catch { toast.error('Failed to update role'); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await API.delete(`/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete user'); }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await API.delete(`/projects/${projectId}`);
      setProjects(prev => prev.filter(p => p._id !== projectId));
      toast.success('Project deleted');
    } catch { toast.error('Failed to delete project'); }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  if (loading) return <Spinner size="lg" text="Loading admin dashboard..." />;

  const stats = [
    { label: 'Total Users', value: userStats.totalUsers, icon: HiOutlineUsers, color: 'from-primary-500 to-indigo-600' },
    { label: 'Students', value: userStats.students, icon: HiOutlineUsers, color: 'from-emerald-500 to-teal-600' },
    { label: 'Mentors', value: userStats.mentors, icon: HiOutlineShieldCheck, color: 'from-amber-500 to-orange-600' },
    { label: 'Total Projects', value: projectStats.totalProjects, icon: HiOutlineLightBulb, color: 'from-rose-500 to-pink-600' },
    { label: 'Open Projects', value: projectStats.openProjects, icon: HiOutlineLightBulb, color: 'from-cyan-500 to-blue-600' },
    { label: 'Completed', value: projectStats.completed, icon: HiOutlineLightBulb, color: 'from-violet-500 to-purple-600' },
  ];

  const tabs = [{ id: 'overview', label: 'Overview' }, { id: 'users', label: 'Users' }, { id: 'projects', label: 'Projects' }];

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold gradient-text mb-6">Admin Dashboard</h1>

      <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-primary-500/20 text-primary-300' : 'text-dark-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="glass-card p-6 hover:transform-none">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl bg-gradient-to-r ${s.color} bg-opacity-10`}>
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-white">{s.value || 0}</span>
              </div>
              <p className="text-dark-400 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="text" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="glass-input flex-1" placeholder="Search users..." />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="glass-input min-w-[140px]">
              <option value="" className="bg-dark-800">All Roles</option>
              <option value="student" className="bg-dark-800">Student</option>
              <option value="mentor" className="bg-dark-800">Mentor</option>
              <option value="admin" className="bg-dark-800">Admin</option>
            </select>
          </div>
          <div className="glass-card hover:transform-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3 text-dark-400 font-medium">User</th>
                  <th className="text-left px-5 py-3 text-dark-400 font-medium">Email</th>
                  <th className="text-left px-5 py-3 text-dark-400 font-medium">Role</th>
                  <th className="text-left px-5 py-3 text-dark-400 font-medium">Joined</th>
                  <th className="text-right px-5 py-3 text-dark-400 font-medium">Actions</th>
                </tr></thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">{u.name?.charAt(0)?.toUpperCase()}</div>
                          <span className="text-white font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-dark-400">{u.email}</td>
                      <td className="px-5 py-3">
                        <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)} className="text-xs bg-white/5 border border-white/10 rounded-md px-2 py-1 text-dark-300">
                          <option value="student" className="bg-dark-800">student</option>
                          <option value="mentor" className="bg-dark-800">mentor</option>
                          <option value="admin" className="bg-dark-800">admin</option>
                        </select>
                      </td>
                      <td className="px-5 py-3 text-dark-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => handleDeleteUser(u._id)} className="text-dark-500 hover:text-red-400 transition-colors"><HiOutlineTrash className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'projects' && (
        <div className="space-y-4">
          {projects.map(p => (
            <div key={p._id} className="glass-card p-5 hover:transform-none flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">{p.title}</h3>
                <p className="text-xs text-dark-400 mt-1">By {p.createdBy?.name} • {p.teamMembers?.length} members • {p.status}</p>
              </div>
              <button onClick={() => handleDeleteProject(p._id)} className="text-dark-500 hover:text-red-400 transition-colors"><HiOutlineTrash className="w-5 h-5" /></button>
            </div>
          ))}
          {projects.length === 0 && <div className="glass-card p-8 text-center hover:transform-none"><p className="text-dark-400">No projects found.</p></div>}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
