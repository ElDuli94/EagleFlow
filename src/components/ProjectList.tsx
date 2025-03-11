import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createProject, getUserProjects } from '../lib/supabase';
import type { Project } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function ProjectList() {
  const { } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const result = await getUserProjects();
      if ('error' in result && result.error) {
        console.error('Feil ved lasting av prosjekter:', result.error);
        toast.error('Kunne ikke laste prosjekter');
        return;
      }
      setProjects(result || []);
    } catch (error) {
      console.error('Uventet feil ved lasting av prosjekter:', error);
      toast.error('En feil oppstod ved lasting av prosjekter');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!projectName.trim()) {
      toast.error('Prosjektnavn er påkrevd');
      return;
    }

    setCreating(true);
    try {
      const { project, error } = await createProject({
        name: projectName.trim(),
        description: projectDescription.trim() || undefined,
        status: 'active',
        progress: 0
      });

      if (error) {
        console.error('Feil ved oppretting av prosjekt:', error);
        toast.error(error.message || 'Kunne ikke opprette prosjekt');
        return;
      }

      if (project) {
        toast.success('Prosjekt opprettet');
        setProjects(prev => [...prev, project]);
        setShowForm(false);
        setProjectName('');
        setProjectDescription('');
      }
    } catch (error) {
      console.error('Uventet feil:', error);
      toast.error('En uventet feil oppstod');
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return <div>Laster prosjekter...</div>;
  }

  return (
    <div className="space-y-4">
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Nytt prosjekt
        </button>
      )}

      {showForm && (
        <form onSubmit={handleCreateProject} className="space-y-4 p-4 border rounded">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Prosjektnavn *
            </label>
            <input
              type="text"
              id="name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="mt-1 block w-full rounded border p-2"
              required
              disabled={creating}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium">
              Beskrivelse
            </label>
            <textarea
              id="description"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="mt-1 block w-full rounded border p-2"
              rows={3}
              disabled={creating}
            />
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {creating ? 'Oppretter...' : 'Opprett prosjekt'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              disabled={creating}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Avbryt
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div key={project.id} className="p-4 border rounded shadow">
            <h3 className="text-lg font-semibold">{project.name}</h3>
            {project.description && (
              <p className="text-gray-600 mt-2">{project.description}</p>
            )}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Fremdrift: {project.progress}%</span>
                <span>Status: {project.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && !showForm && (
        <p className="text-gray-500">Ingen prosjekter funnet. Opprett et nytt prosjekt for å komme i gang.</p>
      )}
    </div>
  );
}

export default ProjectList; 