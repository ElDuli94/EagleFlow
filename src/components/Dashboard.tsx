import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Menu, X, ChevronDown, ChevronUp, Settings, 
  Droplets, Zap, Wind, Gauge, Package, Plus, Loader, Users, Home, LogOut,
  User, Edit, ExternalLink, Calendar, FolderOpen
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { maleAvatar, femaleAvatar } from '../assets/avatars'
import { 
  getUserProjects, Project, createProject, 
  ProjectMember, ProjectInvitation,
  getProjectMembers, inviteUserToProject, removeProjectMember, updateProjectMemberRole,
  getProjectInvitations, cancelInvitation,
  supabase
} from '../lib/supabase'
import ProfileEdit from './ProfileEdit'

const Dashboard = () => {
  const { user, profile, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectSize, setNewProjectSize] = useState('')
  const [newProjectLocation, setNewProjectLocation] = useState('')
  const [newProjectMainContractor, setNewProjectMainContractor] = useState('')
  const [newProjectTechnicalContractor, setNewProjectTechnicalContractor] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [newProjectClient, setNewProjectClient] = useState('')
  const [newProjectAddress, setNewProjectAddress] = useState('')
  const [creatingProject, setCreatingProject] = useState(false)
  
  // Prosjektmedlemshåndtering
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member')
  const [sendingInvite, setSendingInvite] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null)
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false)
  const [removingMember, setRemovingMember] = useState(false)
  const [memberToEdit, setMemberToEdit] = useState<ProjectMember | null>(null)
  const [editRole, setEditRole] = useState<'admin' | 'member' | 'viewer'>('member')
  const [showEditRoleModal, setShowEditRoleModal] = useState(false)
  const [updatingRole, setUpdatingRole] = useState(false)
  
  // Prosjektinvitasjoner
  const [projectInvitations, setProjectInvitations] = useState<ProjectInvitation[]>([])
  const [loadingInvitations, setLoadingInvitations] = useState(false)
  const [invitationToCancel, setInvitationToCancel] = useState<ProjectInvitation | null>(null)
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)
  const [cancelingInvitation, setCancelingInvitation] = useState(false)

  const [activePage, setActivePage] = useState('projects')
  const [isLoading, setIsLoading] = useState(true)
  
  // Profilredigering
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)

  // State for prosjekter
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [projectError, setProjectError] = useState<string | null>(null)

  // Logg profil for debugging
  useEffect(() => {
    if (profile) {
      console.log('Profil lastet:', profile)
    } else if (user) {
      console.log('Bruker funnet, men ingen profil:', user)
      // Omdiriger til en side som ber brukeren om å oppdatere profilen sin
      // eller vis en melding om at profilen mangler
      // Dette er bare en midlertidig løsning til profilen blir opprettet automatisk
    }
  }, [profile, user])

  // Håndter responsivitet
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Hent prosjekter
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const projectData = await getUserProjects()
        setProjects(projectData)
        
        if (projectData.length > 0 && !selectedProject) {
          setSelectedProject(projectData[0])
        }
      } catch (error) {
        console.error('Feil ved henting av prosjekter:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchProjects()
    }
  }, [user, selectedProject])

  // Hent prosjektmedlemmer når et prosjekt er valgt
  useEffect(() => {
    const fetchProjectMembers = async () => {
      if (!selectedProject) return
      
      try {
        setLoadingMembers(true)
        const members = await getProjectMembers(selectedProject.id)
        setProjectMembers(members)
      } catch (error) {
        console.error('Feil ved henting av prosjektmedlemmer:', error)
      } finally {
        setLoadingMembers(false)
      }
    }

    fetchProjectMembers()
  }, [selectedProject])

  // Hent prosjektinvitasjoner når et prosjekt er valgt
  useEffect(() => {
    const fetchProjectInvitations = async () => {
      if (!selectedProject) return
      
      try {
        setLoadingInvitations(true)
        const invitations = await getProjectInvitations(selectedProject.id)
        setProjectInvitations(invitations)
      } catch (error) {
        console.error('Feil ved henting av prosjektinvitasjoner:', error)
      } finally {
        setLoadingInvitations(false)
      }
    }

    fetchProjectInvitations()
  }, [selectedProject])

  // Kategorier for sidebar
  const categories = [
    { id: 'sanitaer', name: 'Sanitær', icon: <Droplets size={20} /> },
    { id: 'energi', name: 'Energi', icon: <Zap size={20} /> },
    { id: 'gass', name: 'Gass og trykkluft', icon: <Gauge size={20} /> },
    { id: 'ventilasjon', name: 'Ventilasjon', icon: <Wind size={20} /> },
    { id: 'diverse', name: 'Diverse', icon: <Package size={20} /> }
  ]

  // Velg avatar basert på kjønn
  const getAvatar = () => {
    if (!profile) {
      console.log('Ingen profil funnet, bruker standard avatar');
      return 'https://ui-avatars.com/api/?name=Bruker&background=0D8ABC&color=fff';
    }
    
    if (profile.avatar_url) {
      console.log('Bruker avatar fra profil:', profile.avatar_url);
      // Legg til timestamp for å unngå caching
      return `${profile.avatar_url}?t=${new Date().getTime()}`;
    }
    
    const gender = profile.gender || 'male';
    console.log('Bruker standard avatar basert på kjønn:', gender);
    return gender === 'female' 
      ? 'https://ui-avatars.com/api/?name=F&background=FFC0CB&color=fff'
      : 'https://ui-avatars.com/api/?name=M&background=0D8ABC&color=fff';
  }

  // Opprett nytt prosjekt
  const handleCreateProject = async () => {
    if (!newProjectName) {
      setProjectError('Prosjektnavn er påkrevd');
      return;
    }
    
    setProjectError(null);
    setCreatingProject(true);
    
    try {
      console.log('Oppretter prosjekt:', { name: newProjectName, description: newProjectDescription });
      const project = await createProject(newProjectName, newProjectDescription || '');
      
      if (project) {
        console.log('Prosjekt opprettet:', project);
        setProjects(prev => [...prev, project]);
        setNewProjectName('');
        setNewProjectDescription('');
        setShowNewProjectModal(false);
      }
    } catch (error: any) {
      console.error('Feil ved opprettelse av prosjekt:', error);
      setProjectError(error.message || 'Det oppstod en feil ved opprettelse av prosjekt');
    } finally {
      setCreatingProject(false);
    }
  };

  // Inviter bruker til prosjekt
  const handleInviteUser = async () => {
    if (!selectedProject || !inviteEmail.trim()) return
    
    try {
      setSendingInvite(true)
      await inviteUserToProject(selectedProject.id, inviteEmail, inviteRole)
      
      // Oppdater invitasjonslisten
      const invitations = await getProjectInvitations(selectedProject.id)
      setProjectInvitations(invitations)
      
      // Tilbakestill skjemaet
      setInviteEmail('')
      setInviteRole('member')
      setShowInviteModal(false)
    } catch (error: any) {
      console.error('Feil ved invitasjon av bruker:', error)
      alert(error.message || 'Kunne ikke invitere bruker. Vennligst prøv igjen.')
    } finally {
      setSendingInvite(false)
    }
  }

  // Kanseller invitasjon
  const handleCancelInvitation = async () => {
    if (!invitationToCancel) return
    
    try {
      setCancelingInvitation(true)
      await cancelInvitation(invitationToCancel.id)
      
      // Oppdater invitasjonslisten
      setProjectInvitations(prev => prev.filter(inv => inv.id !== invitationToCancel.id))
      setShowCancelConfirmation(false)
      setInvitationToCancel(null)
    } catch (error) {
      console.error('Feil ved kansellering av invitasjon:', error)
    } finally {
      setCancelingInvitation(false)
    }
  }

  // Fjern medlem fra prosjekt
  const handleRemoveMember = async () => {
    if (!selectedProject || !memberToRemove) return
    
    try {
      setRemovingMember(true)
      await removeProjectMember(selectedProject.id, memberToRemove.user_id)
      
      // Oppdater medlemslisten
      setProjectMembers(prev => prev.filter(member => member.user_id !== memberToRemove.user_id))
      setShowRemoveConfirmation(false)
      setMemberToRemove(null)
    } catch (error) {
      console.error('Feil ved fjerning av medlem:', error)
    } finally {
      setRemovingMember(false)
    }
  }

  // Oppdater medlemsrolle
  const handleUpdateMemberRole = async () => {
    if (!selectedProject || !memberToEdit) return
    
    try {
      setUpdatingRole(true)
      await updateProjectMemberRole(selectedProject.id, memberToEdit.user_id, editRole)
      
      // Oppdater medlemslisten
      setProjectMembers(prev => prev.map(member => 
        member.user_id === memberToEdit.user_id 
          ? { ...member, role: editRole } 
          : member
      ))
      setShowEditRoleModal(false)
      setMemberToEdit(null)
    } catch (error: any) {
      console.error('Feil ved oppdatering av medlemsrolle:', error)
      alert(error.message || 'Kunne ikke oppdatere medlemsrolle. Vennligst prøv igjen.')
    } finally {
      setUpdatingRole(false)
    }
  }

  // Åpne prosjekt
  const handleOpenProject = (projectId: string) => {
    console.log('Åpner prosjekt:', projectId);
    // Her kan du implementere navigasjon til prosjektsiden
    // For eksempel: router.push(`/projects/${projectId}`);
  };

  // Logg ut
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Feil ved utlogging:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar - kun synlig på mobil når sidebar er lukket */}
      <div className="bg-white shadow-sm p-4 flex justify-between items-center md:hidden">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="text-gray-700 hover:text-blue-600 transition-colors"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">EagleFlow</h1>
        <div className="w-6"></div> {/* Placeholder for balanse */}
      </div>

      {/* Sidebar overlay - kun synlig på mobil når sidebar er åpen */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-30 flex flex-col"
          >
            {/* Sidebar header */}
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                <span className="text-blue-600">Eagle</span><span className="text-secondary">Flow</span>
              </h2>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="text-gray-700 hover:text-blue-600 transition-colors md:hidden"
              >
                <X size={20} />
              </button>
            </div>

            {/* Brukerinfo */}
            <div 
              className="p-4 border-b flex flex-col items-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setShowProfileEdit(true)}
            >
              <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-blue-500 bg-gray-200 relative group">
                <img
                  src={getAvatar()}
                  alt="Profilbilde"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Feil ved lasting av profilbilde:', e);
                    const target = e.target as HTMLImageElement;
                    const gender = profile?.gender || 'male';
                    target.src = gender === 'female' 
                      ? 'https://ui-avatars.com/api/?name=F&background=FFC0CB&color=fff'
                      : 'https://ui-avatars.com/api/?name=M&background=0D8ABC&color=fff';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="font-medium text-gray-800 text-center">{profile?.full_name || 'Bruker'}</h3>
              <p className="text-sm text-gray-600 text-center">{profile?.job_title || 'Stilling'}</p>
              <p className="text-sm text-gray-600 text-center">{profile?.company || 'Firma'}</p>
            </div>

            {/* Prosjektvelger */}
            <div className="p-4 border-b">
              <div className="relative mb-2">
                <button 
                  onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                  className="w-full p-2 bg-gray-100 rounded flex justify-between items-center hover:bg-gray-200 transition-colors"
                >
                  <span>{selectedProject?.name || 'Velg prosjekt'}</span>
                  {projectDropdownOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                
                {/* Prosjektdropdown */}
                {projectDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded shadow-lg z-10 max-h-48 overflow-y-auto">
                    {loading ? (
                      <div className="p-2 text-center text-gray-500">
                        <Loader size={18} className="animate-spin mx-auto mb-1" />
                        Laster prosjekter...
                      </div>
                    ) : projects.length > 0 ? (
                      projects.map(project => (
                        <button
                          key={project.id}
                          onClick={() => {
                            setSelectedProject(project)
                            setProjectDropdownOpen(false)
                          }}
                          className={`w-full p-2 text-left hover:bg-gray-100 transition-colors ${
                            selectedProject?.id === project.id ? 'bg-blue-50 text-blue-600' : ''
                          }`}
                        >
                          {project.name}
                        </button>
                      ))
                    ) : (
                      <div className="p-2 text-center text-gray-500">
                        Ingen prosjekter funnet
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Nytt prosjekt-knapp */}
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="w-full p-2 bg-blue-500 text-white rounded flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <Plus size={18} className="mr-1" />
                Nytt prosjekt
              </button>
            </div>

            {/* Kategorimeny */}
            <div className="flex-1 overflow-y-auto p-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(
                    activeCategory === category.id ? null : category.id
                  )}
                  className={`w-full p-3 rounded flex items-center mb-1 transition-colors ${
                    activeCategory === category.id 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>

            {/* Sidebar navigation */}
            <nav className="p-4 border-t">
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => setActivePage('settings')}
                    className={`w-full flex items-center p-2 rounded-md transition-colors ${activePage === 'settings' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <Settings size={18} className="mr-2" />
                    <span>Innstillinger</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setShowProfileEdit(true)}
                    className={`w-full flex items-center p-2 rounded-md transition-colors ${activePage === 'profile' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <User className="h-5 w-5 mr-2" />
                    <span>Rediger profil</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center p-2 rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut size={18} className="mr-2" />
                    <span>Logg ut</span>
                  </button>
                </li>
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hovedinnhold */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : ''}`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            {loading ? (
              <span className="flex items-center">
                <Loader size={20} className="animate-spin mr-2" />
                Laster...
              </span>
            ) : selectedProject ? (
              selectedProject.name
            ) : (
              'Velg eller opprett et prosjekt'
            )}
          </h1>
          
          {/* Innhold for valgt kategori */}
          {selectedProject ? (
            activeCategory ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {categories.find(c => c.id === activeCategory)?.name}
                </h2>
                <p className="text-gray-600">
                  Innhold for {categories.find(c => c.id === activeCategory)?.name} kommer snart.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Prosjektoversikt</h2>
                  <button
                    onClick={() => setShowMembersModal(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded flex items-center hover:bg-blue-600 transition-colors"
                  >
                    <Users size={18} className="mr-2" />
                    Administrer medlemmer
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg mb-3 pb-2 border-b">Prosjektdetaljer</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Prosjektnavn:</span> {selectedProject.name}</p>
                      <div className="mt-2 text-xs text-gray-500 space-y-1">
                        {selectedProject.description && (
                          <p className="line-clamp-2">{selectedProject.description}</p>
                        )}
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Opprettet {new Date(selectedProject.created_at).toLocaleDateString('nb-NO')}</span>
                        </div>
                      </div>
                      <p><span className="font-medium">Størrelse:</span> {selectedProject.size || 'Ikke spesifisert'}</p>
                      <p><span className="font-medium">Lokasjon:</span> {selectedProject.location || 'Ikke spesifisert'}</p>
                      <p><span className="font-medium">Adresse:</span> {selectedProject.address || 'Ikke spesifisert'}</p>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg mb-3 pb-2 border-b">Entreprenører</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Totalentreprenør:</span> {selectedProject.main_contractor || 'Ikke spesifisert'}</p>
                      <p><span className="font-medium">Teknisk entreprenør:</span> {selectedProject.technical_contractor || 'Ikke spesifisert'}</p>
                      <p><span className="font-medium">Kunde:</span> {selectedProject.client || 'Ikke spesifisert'}</p>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg mb-3 pb-2 border-b">Fremdrift</h3>
                    <div className="mb-2">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-blue-500 h-4 rounded-full" 
                          style={{ width: `${selectedProject.progress || 0}%` }}
                        ></div>
                      </div>
                      <p className="text-right mt-1">{selectedProject.progress || 0}% fullført</p>
                    </div>
                    <p><span className="font-medium">Status:</span> {selectedProject.status}</p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg mb-3 pb-2 border-b">Aktivitet</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Opprettet:</span> {new Date(selectedProject.created_at).toLocaleDateString('nb-NO')}</p>
                      <p><span className="font-medium">Antall medlemmer:</span> {loadingMembers ? 'Laster...' : projectMembers.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              {/* Prosjektliste */}
              {projects.length > 0 ? (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Dine prosjekter</h2>
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{project.name}</h3>
                            <div className="mt-2 text-xs text-gray-500 space-y-1">
                              {project.description && (
                                <p className="line-clamp-2">{project.description}</p>
                              )}
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>Opprettet {new Date(project.created_at).toLocaleDateString('nb-NO')}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => handleOpenProject(project.id)}
                          >
                            <ExternalLink className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FolderOpen className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Ingen prosjekter</h3>
                  <p className="mt-1 text-sm text-gray-500">Kom i gang ved å opprette ditt første prosjekt.</p>
                  <div className="mt-6">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => setShowNewProjectModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nytt prosjekt
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal for nytt prosjekt */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-medium">Nytt prosjekt</h2>
              <button 
                onClick={() => {
                  setShowNewProjectModal(false);
                  setProjectError(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              {projectError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {projectError}
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prosjektnavn *
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Skriv inn prosjektnavn"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Størrelse</label>
                <input
                  type="text"
                  value={newProjectSize}
                  onChange={(e) => setNewProjectSize(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="f.eks. 1000 m²"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Lokasjon</label>
                <input
                  type="text"
                  value={newProjectLocation}
                  onChange={(e) => setNewProjectLocation(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="By/sted"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Totalentreprenør</label>
                <input
                  type="text"
                  value={newProjectMainContractor}
                  onChange={(e) => setNewProjectMainContractor(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Entreprenørens navn"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Teknisk entreprenør</label>
                <input
                  type="text"
                  value={newProjectTechnicalContractor}
                  onChange={(e) => setNewProjectTechnicalContractor(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Teknisk entreprenørs navn"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Kunde</label>
                <input
                  type="text"
                  value={newProjectClient}
                  onChange={(e) => setNewProjectClient(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Kundenavn"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Adresse</label>
                <input
                  type="text"
                  value={newProjectAddress}
                  onChange={(e) => setNewProjectAddress(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Prosjektadresse"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beskrivelse
                </label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Skriv inn prosjektbeskrivelse"
                  rows={3}
                />
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowNewProjectModal(false);
                  setProjectError(null);
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm mr-2 hover:bg-gray-50"
              >
                Avbryt
              </button>
              <button
                type="button"
                onClick={handleCreateProject}
                disabled={creatingProject}
                className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {creatingProject ? (
                  <>
                    <Loader size={16} className="animate-spin mr-2" />
                    Oppretter...
                  </>
                ) : (
                  <>
                    <Plus size={16} className="mr-2" />
                    Opprett prosjekt
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for prosjektmedlemmer */}
      {showMembersModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Prosjektmedlemmer</h2>
              <button 
                onClick={() => setShowMembersModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-medium">Medlemmer</h3>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-3 py-1 bg-blue-500 text-white rounded flex items-center hover:bg-blue-600 transition-colors text-sm"
                >
                  <Plus size={16} className="mr-1" />
                  Inviter ny
                </button>
              </div>
              
              {loadingMembers ? (
                <div className="flex justify-center items-center py-8">
                  <Loader size={24} className="animate-spin text-blue-500" />
                </div>
              ) : projectMembers.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bruker</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rolle</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Handlinger</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {projectMembers.map(member => (
                        <tr key={member.user_id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                {member.profile?.avatar_url ? (
                                  <img src={member.profile.avatar_url} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <img 
                                    src={member.profile?.gender === 'female' ? femaleAvatar : maleAvatar} 
                                    alt="" 
                                    className="h-full w-full object-cover" 
                                  />
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {member.profile?.full_name || 'Ukjent bruker'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {member.profile?.email || member.invitation_email || 'Ingen e-post'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              member.role === 'owner' 
                                ? 'bg-purple-100 text-purple-800' 
                                : member.role === 'admin' 
                                ? 'bg-blue-100 text-blue-800' 
                                : member.role === 'member' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {member.role === 'owner' 
                                ? 'Eier' 
                                : member.role === 'admin' 
                                ? 'Administrator' 
                                : member.role === 'member' 
                                ? 'Medlem' 
                                : 'Observatør'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {member.role !== 'owner' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setMemberToEdit(member)
                                    setEditRole(member.role === 'owner' ? 'admin' : member.role)
                                    setShowEditRoleModal(true)
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Endre rolle
                                </button>
                                <button
                                  onClick={() => {
                                    setMemberToRemove(member)
                                    setShowRemoveConfirmation(true)
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Fjern
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Ingen medlemmer funnet
                </div>
              )}
              
              <div className="mt-6 mb-4">
                <h3 className="text-lg font-medium">Ventende invitasjoner</h3>
              </div>
              
              {loadingInvitations ? (
                <div className="flex justify-center items-center py-8">
                  <Loader size={24} className="animate-spin text-blue-500" />
                </div>
              ) : projectInvitations.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-post</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rolle</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sendt</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Handlinger</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {projectInvitations.map(invitation => (
                        <tr key={invitation.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{invitation.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              invitation.role === 'admin' 
                                ? 'bg-blue-100 text-blue-800' 
                                : invitation.role === 'member' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {invitation.role === 'admin' 
                                ? 'Administrator' 
                                : invitation.role === 'member' 
                                ? 'Medlem' 
                                : 'Observatør'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(invitation.created_at).toLocaleDateString('nb-NO')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => {
                                setInvitationToCancel(invitation)
                                setShowCancelConfirmation(true)
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              Kanseller
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Ingen ventende invitasjoner
                </div>
              )}
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => setShowMembersModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Lukk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for å invitere bruker */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Inviter bruker</h2>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">E-post *</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Skriv e-postadressen til brukeren"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Rolle</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member' | 'viewer')}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Administrator</option>
                  <option value="member">Medlem</option>
                  <option value="viewer">Observatør</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
              >
                Avbryt
              </button>
              <button
                onClick={handleInviteUser}
                disabled={!inviteEmail.trim() || sendingInvite}
                className={`px-4 py-2 bg-blue-500 text-white rounded flex items-center ${
                  !inviteEmail.trim() || sendingInvite ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                }`}
              >
                {sendingInvite && <Loader size={16} className="animate-spin mr-2" />}
                {sendingInvite ? 'Sender...' : 'Send invitasjon'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for å bekrefte fjerning av medlem */}
      {showRemoveConfirmation && memberToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Bekreft fjerning</h2>
            </div>
            <div className="p-4">
              <p className="mb-4">
                Er du sikker på at du vil fjerne <span className="font-semibold">{memberToRemove.profile?.full_name || memberToRemove.invitation_email || 'denne brukeren'}</span> fra prosjektet?
              </p>
              <p className="text-gray-500 text-sm">
                Dette vil fjerne all tilgang til prosjektet for denne brukeren.
              </p>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => {
                  setShowRemoveConfirmation(false)
                  setMemberToRemove(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
              >
                Avbryt
              </button>
              <button
                onClick={handleRemoveMember}
                disabled={removingMember}
                className={`px-4 py-2 bg-red-500 text-white rounded flex items-center ${
                  removingMember ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'
                }`}
              >
                {removingMember && <Loader size={16} className="animate-spin mr-2" />}
                {removingMember ? 'Fjerner...' : 'Fjern medlem'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for å bekrefte kansellering av invitasjon */}
      {showCancelConfirmation && invitationToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Bekreft kansellering</h2>
            </div>
            <div className="p-4">
              <p className="mb-4">
                Er du sikker på at du vil kansellere invitasjonen til <span className="font-semibold">{invitationToCancel.email}</span>?
              </p>
              <p className="text-gray-500 text-sm">
                Brukeren vil ikke lenger kunne akseptere invitasjonen.
              </p>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => {
                  setShowCancelConfirmation(false)
                  setInvitationToCancel(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
              >
                Avbryt
              </button>
              <button
                onClick={handleCancelInvitation}
                disabled={cancelingInvitation}
                className={`px-4 py-2 bg-red-500 text-white rounded flex items-center ${
                  cancelingInvitation ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'
                }`}
              >
                {cancelingInvitation && <Loader size={16} className="animate-spin mr-2" />}
                {cancelingInvitation ? 'Kansellerer...' : 'Kanseller invitasjon'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for å endre medlemsrolle */}
      {showEditRoleModal && memberToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Endre rolle</h2>
            </div>
            <div className="p-4">
              <p className="mb-4">
                Endre rolle for <span className="font-semibold">{memberToEdit.profile?.full_name || memberToEdit.invitation_email || 'denne brukeren'}</span>:
              </p>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as 'admin' | 'member' | 'viewer')}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="admin">Administrator</option>
                <option value="member">Medlem</option>
                <option value="viewer">Observatør</option>
              </select>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => {
                  setShowEditRoleModal(false)
                  setMemberToEdit(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
              >
                Avbryt
              </button>
              <button
                onClick={handleUpdateMemberRole}
                disabled={updatingRole}
                className={`px-4 py-2 bg-blue-500 text-white rounded flex items-center ${
                  updatingRole ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                }`}
              >
                {updatingRole && <Loader size={16} className="animate-spin mr-2" />}
                {updatingRole ? 'Oppdaterer...' : 'Oppdater rolle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profilredigering */}
      {showProfileEdit && (
        <ProfileEdit onClose={() => setShowProfileEdit(false)} />
      )}
    </div>
  )
}

export default Dashboard 