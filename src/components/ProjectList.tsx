import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createProject, getUserProjects, uploadProjectImage } from '../lib/supabase';
import type { Project } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function ProjectList() {
  const { } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectSize, setProjectSize] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [projectMainContractor, setProjectMainContractor] = useState('');
  const [projectTechnicalContractor, setProjectTechnicalContractor] = useState('');
  const [projectClient, setProjectClient] = useState('');
  const [projectImage, setProjectImage] = useState<File | null>(null);
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
        size: projectSize.trim() || undefined,
        location: projectLocation.trim() || undefined,
        main_contractor: projectMainContractor.trim() || undefined,
        technical_contractor: projectTechnicalContractor.trim() || undefined,
        client: projectClient.trim() || undefined,
        status: 'active',
        progress: 0
      });

      if (error) {
        console.error('Feil ved oppretting av prosjekt:', error);
        toast.error(error.message || 'Kunne ikke opprette prosjekt');
        return;
      }

      if (project) {
        if (projectImage) {
          const { url, error: uploadError } = await uploadProjectImage(project.id, projectImage);
          if (uploadError) {
            console.error('Feil ved opplasting av bilde:', uploadError);
            toast.error('Kunne ikke laste opp bilde');
          }
        }

        toast.success('Prosjekt opprettet');
        setProjects(prev => [...prev, project]);
        setShowForm(false);
        setProjectName('');
        setProjectDescription('');
        setProjectSize('');
        setProjectLocation('');
        setProjectMainContractor('');
        setProjectTechnicalContractor('');
        setProjectClient('');
        setProjectImage(null);
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
        <form onSubmit={handleCreateProject} className="space-y-4 p-4 border rounded max-w-2xl mx-auto bg-white">
          <h2 className="text-xl font-semibold mb-4">Nytt prosjekt</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Prosjektnavn *
              </label>
              <input
                type="text"
                id="name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                disabled={creating}
              />
            </div>

            <div>
              <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                Størrelse
              </label>
              <input
                type="text"
                id="size"
                value={projectSize}
                onChange={(e) => setProjectSize(e.target.value)}
                placeholder="f.eks. 1000 m²"
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={creating}
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Lokasjon
              </label>
              <input
                type="text"
                id="location"
                value={projectLocation}
                onChange={(e) => setProjectLocation(e.target.value)}
                placeholder="By/sted"
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={creating}
              />
            </div>

            <div>
              <label htmlFor="client" className="block text-sm font-medium text-gray-700">
                Kunde
              </label>
              <input
                type="text"
                id="client"
                value={projectClient}
                onChange={(e) => setProjectClient(e.target.value)}
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={creating}
              />
            </div>

            <div>
              <label htmlFor="mainContractor" className="block text-sm font-medium text-gray-700">
                Totalentreprenør
              </label>
              <input
                type="text"
                id="mainContractor"
                value={projectMainContractor}
                onChange={(e) => setProjectMainContractor(e.target.value)}
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={creating}
              />
            </div>

            <div>
              <label htmlFor="technicalContractor" className="block text-sm font-medium text-gray-700">
                Teknisk entreprenør
              </label>
              <input
                type="text"
                id="technicalContractor"
                value={projectTechnicalContractor}
                onChange={(e) => setProjectTechnicalContractor(e.target.value)}
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={creating}
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Beskrivelse
            </label>
            <textarea
              id="description"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              disabled={creating}
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
              Prosjektbilde
            </label>
            <div className="mt-1 flex items-center">
              <div className="space-y-1 text-center">
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="image"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Last opp et bilde</span>
                    <input
                      type="file"
                      id="image"
                      name="image"
                      accept="image/*"
                      onChange={(e) => setProjectImage(e.target.files?.[0] || null)}
                      className="sr-only"
                      disabled={creating}
                    />
                  </label>
                  <p className="pl-1">eller dra og slipp</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF opptil 10MB</p>
              </div>
            </div>
            {projectImage && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(projectImage)}
                  alt="Forhåndsvisning"
                  className="h-32 w-auto object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => setProjectImage(null)}
                  className="mt-2 text-sm text-red-600 hover:text-red-500"
                >
                  Fjern bilde
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              disabled={creating}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {creating ? 'Oppretter...' : 'Opprett prosjekt'}
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