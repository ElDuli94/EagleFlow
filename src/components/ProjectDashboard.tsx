import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getProject } from '../lib/supabase'
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  BarChart2, 
  FileText, 
  Settings, 
  Briefcase,
  MapPin,
  Building,
  Wrench,
  User
} from 'lucide-react'

interface ProjectDashboardProps {
  projectId: string | null
}

export default function ProjectDashboard({ projectId }: ProjectDashboardProps) {
  const { user } = useAuth()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setError('Prosjekt-ID mangler')
        setLoading(false)
        return
      }

      try {
        const { data, error } = await getProject(projectId)
        
        if (error) {
          throw error
        }
        
        if (data) {
          setProject(data)
        } else {
          setError('Prosjektet ble ikke funnet')
        }
      } catch (err: any) {
        console.error('Feil ved henting av prosjekt:', err)
        setError(err.message || 'Kunne ikke laste prosjektet')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [projectId])

  const handleGoBack = () => {
    // Sett flagg for å nullstille valgt prosjekt
    sessionStorage.setItem('resetProject', 'true');
    window.location.hash = 'dashboard';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Feil ved lasting av prosjekt</h2>
            <p className="text-gray-600 mb-4">{error || 'Prosjektet ble ikke funnet'}</p>
            <button
              onClick={handleGoBack}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Tilbake til dashbord
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topplinje */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={handleGoBack}
                className="mr-4 text-gray-500 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <a 
                href="#dashboard" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  // Naviger til dashboard og nullstill valgt prosjekt
                  window.location.hash = 'dashboard'; 
                  // Legg til en parameter i URL-en som indikerer at ingen prosjekt skal velges
                  sessionStorage.setItem('resetProject', 'true');
                }} 
                className="text-xl font-bold text-primary mr-4"
              >
                Eagle<span className="text-secondary">Flow</span>
              </a>
              <h1 className="text-xl font-semibold text-gray-900 truncate max-w-md">
                {project.name}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                Rediger prosjekt
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hovedinnhold */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Prosjektinformasjon */}
        <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
          <div className="md:flex">
            <div 
              className="md:w-1/3 h-48 md:h-auto bg-gray-200 relative"
              style={{ 
                backgroundImage: `url(${project.image_url || '/default-project.jpg'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            ></div>
            <div className="p-6 md:w-2/3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{project.name}</h2>
                  {project.description && (
                    <p className="text-gray-600 mb-4">{project.description}</p>
                  )}
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar size={16} className="mr-2" />
                    <span>Opprettet {new Date(project.created_at).toLocaleDateString('nb-NO')}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {project.client && (
                    <div className="flex items-start">
                      <Briefcase size={16} className="mr-2 mt-1 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Kunde</p>
                        <p className="text-sm">{project.client}</p>
                      </div>
                    </div>
                  )}
                  {project.location && (
                    <div className="flex items-start">
                      <MapPin size={16} className="mr-2 mt-1 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Lokasjon</p>
                        <p className="text-sm">{project.location}</p>
                      </div>
                    </div>
                  )}
                  {project.main_contractor && (
                    <div className="flex items-start">
                      <Building size={16} className="mr-2 mt-1 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Hovedentreprenør</p>
                        <p className="text-sm">{project.main_contractor}</p>
                      </div>
                    </div>
                  )}
                  {project.technical_contractor && (
                    <div className="flex items-start">
                      <Wrench size={16} className="mr-2 mt-1 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Teknisk entreprenør</p>
                        <p className="text-sm">{project.technical_contractor}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Faner */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Oversikt
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'tasks'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Oppgaver
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'documents'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Dokumenter
              </button>
              <button
                onClick={() => setActiveTab('team')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'team'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Team
              </button>
            </nav>
          </div>
          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Prosjektoversikt</h3>
                <p className="text-gray-600">
                  Dette er oversiktssiden for prosjektet. Her vil du kunne se viktig informasjon og statistikk.
                </p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Fremdrift</h4>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${project.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{project.progress || 0}%</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Status</h4>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {project.status === 'active' ? 'Aktiv' : project.status}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Størrelse</h4>
                    <span className="text-sm">{project.size || 'Ikke spesifisert'}</span>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'tasks' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Oppgaver</h3>
                <p className="text-gray-600">
                  Her vil du kunne administrere oppgaver for dette prosjektet.
                </p>
                <div className="mt-6 text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500">Ingen oppgaver er opprettet ennå.</p>
                  <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    Opprett første oppgave
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'documents' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Dokumenter</h3>
                <p className="text-gray-600">
                  Her vil du kunne administrere dokumenter for dette prosjektet.
                </p>
                <div className="mt-6 text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500">Ingen dokumenter er lastet opp ennå.</p>
                  <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    Last opp første dokument
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'team' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Prosjektteam</h3>
                <p className="text-gray-600">
                  Her vil du kunne administrere teammedlemmer for dette prosjektet.
                </p>
                <div className="mt-6 text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500">Ingen teammedlemmer er lagt til ennå.</p>
                  <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    Legg til teammedlem
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 