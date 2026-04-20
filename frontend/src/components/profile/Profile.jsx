import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlineMail, HiOutlinePencil, HiOutlineTag, HiOutlineHeart, HiOutlineSave } from 'react-icons/hi';

/**
 * Profile Page: View and edit user profile, skills, and interests
 */
const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    interests: user?.interests?.join(', ') || ''
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        bio: formData.bio,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        interests: formData.interests.split(',').map(s => s.trim()).filter(Boolean)
      };

      const res = await API.put('/users/profile', payload);
      updateUser(res.data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
      <h1 className="section-title">My Profile</h1>

      {/* Profile Card */}
      <div className="glass-card p-8 hover:transform-none">
        {/* Avatar & Name */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-xl shadow-primary-500/20">
            <span className="text-white font-bold text-3xl">{user?.name?.charAt(0)?.toUpperCase()}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
            <p className="text-dark-400 flex items-center gap-2 mt-1">
              <HiOutlineMail className="w-4 h-4" />
              {user?.email}
            </p>
            <span className="badge-primary mt-2 capitalize">{user?.role}</span>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="ml-auto btn-secondary flex items-center gap-2"
          >
            <HiOutlinePencil className="w-4 h-4" />
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {/* Profile Fields */}
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-dark-300 mb-2">
              <HiOutlineUser className="w-4 h-4" /> Full Name
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="glass-input w-full"
              />
            ) : (
              <p className="text-white py-3 px-4 bg-white/5 rounded-xl">{user?.name}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-dark-300 mb-2">
              <HiOutlinePencil className="w-4 h-4" /> Bio
            </label>
            {editing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="glass-input w-full h-24 resize-none"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-white py-3 px-4 bg-white/5 rounded-xl min-h-[60px]">
                {user?.bio || <span className="text-dark-500 italic">No bio added yet</span>}
              </p>
            )}
          </div>

          {/* Skills */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-dark-300 mb-2">
              <HiOutlineTag className="w-4 h-4" /> Skills
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="glass-input w-full"
                placeholder="React, Python, Machine Learning (comma-separated)"
              />
            ) : (
              <div className="flex flex-wrap gap-2 py-3 px-4 bg-white/5 rounded-xl min-h-[48px]">
                {user?.skills?.length > 0 ? (
                  user.skills.map((skill, i) => (
                    <span key={i} className="badge-primary">{skill}</span>
                  ))
                ) : (
                  <span className="text-dark-500 italic text-sm">No skills added</span>
                )}
              </div>
            )}
          </div>

          {/* Interests */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-dark-300 mb-2">
              <HiOutlineHeart className="w-4 h-4" /> Research Interests
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                className="glass-input w-full"
                placeholder="AI, NLP, Blockchain (comma-separated)"
              />
            ) : (
              <div className="flex flex-wrap gap-2 py-3 px-4 bg-white/5 rounded-xl min-h-[48px]">
                {user?.interests?.length > 0 ? (
                  user.interests.map((interest, i) => (
                    <span key={i} className="badge-success">{interest}</span>
                  ))
                ) : (
                  <span className="text-dark-500 italic text-sm">No interests added</span>
                )}
              </div>
            )}
          </div>

          {/* Save Button */}
          {editing && (
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <HiOutlineSave className="w-5 h-5" />
              )}
              Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Account Info */}
      <div className="glass-card p-6 hover:transform-none">
        <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-dark-400">Role</p>
            <p className="text-white font-medium capitalize mt-1">{user?.role}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-dark-400">Member Since</p>
            <p className="text-white font-medium mt-1">
              {new Date(user?.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
