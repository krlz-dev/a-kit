import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProjects, createProject, deleteProject, renameProject } from '../../../shared/lib/projectsApi';
import { fetchSubscription, canCreateProject } from '../../../shared/lib/subscriptionApi';
import ProjectCard from './ProjectCard';
import NewProjectModal from './NewProjectModal';

export default function ProjectsTab() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [p, s] = await Promise.all([fetchProjects(), fetchSubscription()]);
    setProjects(p);
    setSubscription(s);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (name, type) => {
    setError('');
    const defaultData = type === 'arch'
      ? { version: 1, name, nodes: [], connections: [] }
      : { tasks: [], settings: {} };
    const { data, error: err } = await createProject(name, type, defaultData);
    if (err) {
      setError(err.message);
      return;
    }
    navigate(`/${type}/${data.id}`);
  };

  const handleDelete = async (id) => {
    await deleteProject(id);
    setProjects(p => p.filter(proj => proj.id !== id));
  };

  const handleRename = async (id, name) => {
    await renameProject(id, name);
    setProjects(p => p.map(proj => proj.id === id ? { ...proj, name } : proj));
  };

  const allowNew = canCreateProject(subscription, projects.length);

  if (loading) {
    return <div style={{ color: '#b0c4b0', padding: 20 }}>Loading projects…</div>;
  }

  return (
    <div>
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
          color: '#ef4444', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      <div className="projects-grid">
        {projects.map(p => (
          <ProjectCard key={p.id} project={p} onRename={handleRename} onDelete={handleDelete} />
        ))}
        <div
          className={`new-project-card ${!allowNew ? 'disabled' : ''}`}
          onClick={() => allowNew ? setShowModal(true) : null}
        >
          <span className="new-project-plus">+</span>
          {allowNew ? 'New project' : 'Upgrade to create more'}
        </div>
      </div>

      {showModal && (
        <NewProjectModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
