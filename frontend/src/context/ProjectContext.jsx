import { createContext, useContext, useState } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const ProjectContext = createContext(null);

/**
 * ProjectProvider: Manages project, task, collaboration, and feedback state
 */
export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [myProjects, setMyProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [collaborationRequests, setCollaborationRequests] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // ── Projects ──────────────────────────────────────
  const fetchProjects = async (params = {}) => {
    setLoading(true);
    try {
      const res = await API.get('/projects', { params });
      setProjects(res.data.projects);
      setPagination({ page: res.data.page, pages: res.data.pages, total: res.data.total });
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProjects = async () => {
    try {
      const res = await API.get('/projects/my');
      setMyProjects(res.data);
    } catch (error) {
      toast.error('Failed to fetch your projects');
    }
  };

  const fetchProjectById = async (id) => {
    setLoading(true);
    try {
      const res = await API.get(`/projects/${id}`);
      setCurrentProject(res.data);
      return res.data;
    } catch (error) {
      toast.error('Failed to fetch project');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData) => {
    try {
      const res = await API.post('/projects', projectData);
      setMyProjects(prev => [res.data, ...prev]);
      toast.success('Project created successfully!');
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || 'Failed to create project';
      toast.error(msg);
      return null;
    }
  };

  const updateProject = async (id, data) => {
    try {
      const res = await API.put(`/projects/${id}`, data);
      setCurrentProject(res.data);
      toast.success('Project updated!');
      return res.data;
    } catch (error) {
      toast.error('Failed to update project');
      return null;
    }
  };

  const deleteProject = async (id) => {
    try {
      await API.delete(`/projects/${id}`);
      setMyProjects(prev => prev.filter(p => p._id !== id));
      setProjects(prev => prev.filter(p => p._id !== id));
      toast.success('Project deleted');
      return true;
    } catch (error) {
      toast.error('Failed to delete project');
      return false;
    }
  };

  // ── Tasks ─────────────────────────────────────────
  const fetchTasks = async (projectId) => {
    try {
      const res = await API.get(`/tasks/project/${projectId}`);
      setTasks(res.data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    }
  };

  const createTask = async (taskData) => {
    try {
      const res = await API.post('/tasks', taskData);
      setTasks(prev => [res.data, ...prev]);
      toast.success('Task created!');
      return res.data;
    } catch (error) {
      toast.error('Failed to create task');
      return null;
    }
  };

  const updateTask = async (id, data) => {
    try {
      const res = await API.put(`/tasks/${id}`, data);
      setTasks(prev => prev.map(t => t._id === id ? res.data : t));
      toast.success('Task updated!');
      return res.data;
    } catch (error) {
      toast.error('Failed to update task');
      return null;
    }
  };

  const deleteTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  // ── Collaboration Requests ────────────────────────
  const sendCollabRequest = async (data) => {
    try {
      const res = await API.post('/collaborations', data);
      toast.success('Join request sent!');
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to send request';
      toast.error(msg);
      return null;
    }
  };

  const fetchReceivedRequests = async () => {
    try {
      const res = await API.get('/collaborations/received');
      setCollaborationRequests(res.data);
    } catch (error) {
      toast.error('Failed to fetch requests');
    }
  };

  const approveRequest = async (id) => {
    try {
      const res = await API.put(`/collaborations/${id}/approve`);
      setCollaborationRequests(prev =>
        prev.map(r => r._id === id ? { ...r, status: 'approved' } : r)
      );
      toast.success('Request approved!');
      return res.data;
    } catch (error) {
      toast.error('Failed to approve request');
      return null;
    }
  };

  const rejectRequest = async (id) => {
    try {
      const res = await API.put(`/collaborations/${id}/reject`);
      setCollaborationRequests(prev =>
        prev.map(r => r._id === id ? { ...r, status: 'rejected' } : r)
      );
      toast.success('Request rejected');
      return res.data;
    } catch (error) {
      toast.error('Failed to reject request');
      return null;
    }
  };

  // ── Feedback ──────────────────────────────────────
  const fetchFeedback = async (projectId) => {
    try {
      const res = await API.get(`/feedback/project/${projectId}`);
      setFeedback(res.data);
    } catch (error) {
      toast.error('Failed to fetch feedback');
    }
  };

  const addFeedback = async (data) => {
    try {
      const res = await API.post('/feedback', data);
      setFeedback(prev => [res.data, ...prev]);
      toast.success('Feedback submitted!');
      return res.data;
    } catch (error) {
      toast.error('Failed to add feedback');
      return null;
    }
  };

  const deleteFeedback = async (id) => {
    try {
      await API.delete(`/feedback/${id}`);
      setFeedback(prev => prev.filter(f => f._id !== id));
      toast.success('Feedback deleted');
    } catch (error) {
      toast.error('Failed to delete feedback');
    }
  };

  return (
    <ProjectContext.Provider value={{
      projects, myProjects, currentProject, tasks, collaborationRequests, feedback,
      loading, pagination,
      fetchProjects, fetchMyProjects, fetchProjectById, createProject, updateProject, deleteProject,
      fetchTasks, createTask, updateTask, deleteTask,
      sendCollabRequest, fetchReceivedRequests, approveRequest, rejectRequest,
      fetchFeedback, addFeedback, deleteFeedback,
      setCurrentProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

export default ProjectContext;
