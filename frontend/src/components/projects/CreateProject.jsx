import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../context/ProjectContext';
import { HiOutlineLightBulb, HiOutlineTag, HiOutlineUserGroup } from 'react-icons/hi';

/**
 * CreateProject: Form to publish a new research idea / project
 */
const CreateProject = () => {
  const { createProject } = useProjects();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    category: 'General',
    maxTeamSize: 5
  });

  const categories = ['General', 'AI/ML', 'Web Development', 'Data Science', 'Cybersecurity', 'IoT', 'Blockchain', 'Cloud Computing', 'Mobile Development', 'Research'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const project = await createProject({
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    });
    if (project) {
      navigate(`/projects/${project._id}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Publish Your Idea</h1>
        <p className="text-dark-400">Share your research idea and find collaborators</p>
      </div>

      <div className="glass-card p-8 hover:transform-none">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-dark-300 mb-2">
              <HiOutlineLightBulb className="w-4 h-4 text-primary-400" /> Project Title
            </label>
            <input
              id="project-title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="glass-input w-full"
              placeholder="e.g., AI-Powered Mental Health Assessment Tool"
              minLength={3}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-dark-300 mb-2 block">Description</label>
            <textarea
              id="project-description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="glass-input w-full h-40 resize-none"
              placeholder="Describe your research idea, goals, methodology, and what kind of collaborators you're looking for..."
              minLength={10}
            />
          </div>

          {/* Category & Team Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-dark-300 mb-2 block">Category</label>
              <select
                id="project-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="glass-input w-full"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-dark-800">{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-dark-300 mb-2">
                <HiOutlineUserGroup className="w-4 h-4" /> Max Team Size
              </label>
              <input
                id="project-teamsize"
                type="number"
                min="1"
                max="20"
                value={formData.maxTeamSize}
                onChange={(e) => setFormData({ ...formData, maxTeamSize: parseInt(e.target.value) })}
                className="glass-input w-full"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-dark-300 mb-2">
              <HiOutlineTag className="w-4 h-4 text-primary-400" /> Tags
            </label>
            <input
              id="project-tags"
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="glass-input w-full"
              placeholder="react, ai, machine-learning (comma-separated)"
            />
            {formData.tags && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.split(',').filter(t => t.trim()).map((tag, i) => (
                  <span key={i} className="badge-primary">{tag.trim()}</span>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              id="project-submit"
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <HiOutlineLightBulb className="w-5 h-5" />
                  Publish Idea
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
