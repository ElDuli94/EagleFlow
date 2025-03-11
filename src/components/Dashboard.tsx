import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Menu, X, ChevronDown, ChevronUp, Settings, 
  Droplets, Zap, Wind, Gauge, Package, Plus, Loader, LogOut,
  User, Edit, Trash2, Upload, Image, MapPin, FolderPlus
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { maleAvatar, femaleAvatar } from '../assets/avatars'
import { 
  getUserProjects, createProject, updateProject, deleteProject,
  getProjectMembers, inviteUserToProject, removeProjectMember, updateProjectMemberRole,
  getProjectInvitations, cancelInvitation, uploadProjectImage
} from '../lib/supabase'
import type { Project, ProjectMember, ProjectInvitation } from '../types'
import ProfileEdit from './ProfileEdit'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../lib/supabase'
import React from 'react'

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
  const [projectError, setProjectError] = useState<string | null>(null)
  
  // Redigering av prosjekt
  const [showEditProjectModal, setShowEditProjectModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editProjectName, setEditProjectName] = useState('')
  const [editProjectDescription, setEditProjectDescription] = useState('')
  const [editProjectSize, setEditProjectSize] = useState('')
  const [editProjectLocation, setEditProjectLocation] = useState('')
  const [editProjectMainContractor, setEditProjectMainContractor] = useState('')
  const [editProjectTechnicalContractor, setEditProjectTechnicalContractor] = useState('')
  const [editProjectClient, setEditProjectClient] = useState('')
  const [editProjectAddress, setEditProjectAddress] = useState('')
  const [updatingProject, setUpdatingProject] = useState(false)
  
  // Sletting av prosjekt
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [deletingProject, setDeletingProject] = useState(false)
  
  // Prosjektbilde
  const [projectImageFile, setProjectImageFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Standardbilde for prosjekter
  const defaultProjectImage = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
  
  // Prosjektmedlemshåndtering
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
  const [sendingInvite, setSendingInvite] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null)
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false)
  const [removingMember, setRemovingMember] = useState(false)
  const [memberToEdit, setMemberToEdit] = useState<ProjectMember | null>(null)
  const [editRole, setEditRole] = useState<'admin' | 'member'>('member')
  const [showEditRoleModal, setShowEditRoleModal] = useState(false)
  const [updatingRole, setUpdatingRole] = useState(false)
  
  // Prosjektinvitasjoner
  const [projectInvitations, setProjectInvitations] = useState<ProjectInvitation[]>([])
  const [loadingInvitations, setLoadingInvitations] = useState(false)
  const [invitationToCancel, setInvitationToCancel] = useState<ProjectInvitation | null>(null)
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)
  const [cancelingInvitation, setCancelingInvitation] = useState(false)

  const [activePage, setActivePage] = useState('projects')
  
  // Profilredigering
  const [showProfileEdit, setShowProfileEdit] = useState(false)

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

  // Sjekk om vi skal nullstille valgt prosjekt
  useEffect(() => {
    const resetProject = sessionStorage.getItem('resetProject');
    if (resetProject === 'true') {
      setSelectedProject(null);
      setActiveCategory(null);
      setActivePage('projects');
      // Fjern flagget fra sessionStorage
      sessionStorage.removeItem('resetProject');
    }
  }, []);

  // Hent prosjekter
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const projectData = await getUserProjects()
        setProjects(projectData)
        
        // Fjern automatisk valg av første prosjekt
        // Brukeren skal se prosjektoversikten først
      } catch (error) {
        console.error('Feil ved henting av prosjekter:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchProjects()
    }
  }, [user])

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
    { id: 'dashboard', name: 'Prosjekt Dashboard', icon: <Gauge size={20} /> },
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
    if (!newProjectName.trim()) {
      setProjectError('Prosjektnavn er påkrevd');
      return;
    }

    setProjectError(null);
    setCreatingProject(true);

    try {
      const projectData = {
        name: newProjectName,
        description: newProjectDescription,
        size: newProjectSize,
        location: newProjectLocation,
        main_contractor: newProjectMainContractor,
        technical_contractor: newProjectTechnicalContractor,
        client: newProjectClient,
        address: newProjectAddress,
        status: 'active',
        owner_id: user?.id,
      };

      const { data: project, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (error) {
        setProjectError(error.message);
        return;
      }

      // Last opp bilde hvis valgt
      let imageUrl = null;
      if (projectImageFile) {
        imageUrl = await handleImageUpload(project.id, projectImageFile);
      }

      const newProject = { ...project, image_url: imageUrl };
      setProjects([...projects, newProject]);

      // Tilbakestill form og lukk modal
      setNewProjectName('');
      setNewProjectDescription('');
      setNewProjectSize('');
      setNewProjectLocation('');
      setNewProjectMainContractor('');
      setNewProjectTechnicalContractor('');
      setNewProjectClient('');
      setNewProjectAddress('');
      setProjectImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setShowNewProjectModal(false);
    } catch (error) {
      console.error('Feil ved opprettelse av prosjekt:', error);
      setProjectError('Noe gikk galt ved opprettelse av prosjektet');
    } finally {
      setCreatingProject(false);
    }
  };

  // Åpne redigeringsmodal for prosjekt
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setEditProjectName(project.name);
    setEditProjectDescription(project.description || '');
    setEditProjectSize(project.size || '');
    setEditProjectLocation(project.location || '');
    setEditProjectMainContractor(project.main_contractor || '');
    setEditProjectTechnicalContractor(project.technical_contractor || '');
    setEditProjectClient(project.client || '');
    setEditProjectAddress(project.address || '');
    setShowEditProjectModal(true);
  };

  // Funksjon for å håndtere oppdatering av prosjekt
  const handleUpdateProject = async () => {
    if (!editProjectName.trim()) {
      setProjectError('Prosjektnavn er påkrevd');
      return;
    }

    try {
      const projectData = {
        name: editProjectName,
        description: editProjectDescription,
        size: editProjectSize,
        location: editProjectLocation,
        main_contractor: editProjectMainContractor,
        technical_contractor: editProjectTechnicalContractor,
        client: editProjectClient,
        address: editProjectAddress,
      };

      const { error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', editingProject?.id);

      if (error) {
        setProjectError(error.message);
        return;
      }

      // Håndter opplasting av bilde hvis et nytt bilde er valgt
      let imageUrl = editingProject?.image_url;
      if (projectImageFile && editingProject) {
        const uploadedImageUrl = await handleImageUpload(editingProject.id, projectImageFile);
        if (uploadedImageUrl) {
          imageUrl = uploadedImageUrl;
        }
      }

      // Oppdater prosjektet i lokal state
      setProjects(projects.map(p => 
        p.id === editingProject?.id 
          ? { ...p, ...projectData, image_url: imageUrl } 
          : p
      ));

      // Oppdater valgt prosjekt hvis det er det som redigeres
      if (selectedProject && selectedProject.id === editingProject?.id) {
        setSelectedProject({ ...selectedProject, ...projectData, image_url: imageUrl });
      }

      // Tilbakestill og lukk modal
      setShowEditProjectModal(false);
      setProjectError(null);
      setProjectImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Feil ved oppdatering av prosjekt:', error);
      setProjectError('Noe gikk galt ved oppdatering av prosjektet');
    }
  };

  // Åpne bekreftelsesdialog for sletting
  const handleConfirmDelete = (project: Project) => {
    setProjectToDelete(project);
    setShowDeleteConfirmation(true);
  };

  // Slett prosjekt
  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    setDeletingProject(true);
    
    try {
      await deleteProject(projectToDelete.id);
      
      console.log('Prosjekt slettet:', projectToDelete.id);
      
      // Fjern prosjektet fra listen
      setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
      
      // Hvis det slettede prosjektet var det valgte, nullstill valgt prosjekt
      if (selectedProject && selectedProject.id === projectToDelete.id) {
        setSelectedProject(null);
        setActiveCategory(null);
      }
      
      setShowDeleteConfirmation(false);
    } catch (error: any) {
      console.error('Feil ved sletting av prosjekt:', error);
      setProjectError(error.message || 'Det oppstod en feil ved sletting av prosjekt');
    } finally {
      setDeletingProject(false);
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
    // Naviger til prosjektsiden
    window.location.hash = `project/${projectId}`;
  };

  // Logg ut
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Feil ved utlogging:', error);
    }
  };

  // Funksjon for å håndtere opplasting av bilde
  const handleImageUpload = async (projectId: string, file: File) => {
    try {
      const { data, error } = await supabase.storage
        .from('project-images')
        .upload(`${projectId}/${uuidv4()}`, file);

      if (error) {
        console.error('Feil ved opplasting av bilde:', error);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('project-images')
        .getPublicUrl(data.path);

      // Oppdater prosjektet med bilde-URL
      const { error: updateError } = await supabase
        .from('projects')
        .update({ image_url: urlData.publicUrl })
        .eq('id', projectId);

      if (updateError) {
        console.error('Feil ved oppdatering av prosjekt med bilde:', updateError);
        return null;
      }

      // Vis suksessmelding
      alert('Prosjektbilde ble lastet opp');
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Feil ved opplasting av bilde:', error);
      return null;
    }
  };

  // Håndter valg av bildefil
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProjectImageFile(e.target.files[0]);
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
        <h1 
          className="text-xl font-semibold text-gray-800 cursor-pointer"
          onClick={() => {
            setSelectedProject(null);
            setActiveCategory(null);
            setActivePage('projects');
          }}
        >
          <span className="text-blue-600">Eagle</span><span className="text-secondary">Flow</span>
        </h1>
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
            <div className="p-3 flex justify-between items-center border-b">
              <h2 
                className="text-lg font-semibold text-gray-800 cursor-pointer"
                onClick={() => {
                  setSelectedProject(null);
                  setActiveCategory(null);
                  setActivePage('projects');
                }}
              >
                <span className="text-blue-600">Eagle</span><span className="text-secondary">Flow</span>
              </h2>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="text-gray-700 hover:text-blue-600 transition-colors md:hidden"
              >
                <X size={18} />
              </button>
            </div>

            {/* Brukerinfo */}
            <div 
              className="p-3 border-b flex items-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setShowProfileEdit(true)}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500 bg-gray-200 relative group flex-shrink-0">
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
                  <Edit className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="ml-3 overflow-hidden">
                <h3 className="font-medium text-gray-800 text-sm truncate">{profile?.full_name || 'Bruker'}</h3>
                <p className="text-xs text-gray-600 truncate">{profile?.job_title || 'Stilling'}</p>
                <p className="text-xs text-gray-600 truncate">{profile?.company || 'Firma'}</p>
              </div>
            </div>

            {/* Prosjektvelger */}
            <div className="p-3 border-b">
              <div className="relative mb-2">
                <button 
                  onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                  className="w-full p-2 bg-gray-100 rounded flex justify-between items-center hover:bg-gray-200 transition-colors"
                >
                  <span className="text-sm truncate">{selectedProject?.name || 'Velg prosjekt'}</span>
                  {projectDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {/* Prosjektdropdown */}
                {projectDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded shadow-lg z-10 max-h-48 overflow-y-auto">
                    {loading ? (
                      <div className="p-2 text-center text-gray-500">
                        <Loader size={16} className="animate-spin mx-auto mb-1" />
                        <span className="text-xs">Laster prosjekter...</span>
                      </div>
                    ) : projects.length > 0 ? (
                      projects.map(project => (
                        <button
                          key={project.id}
                          onClick={() => {
                            setSelectedProject(project)
                            setProjectDropdownOpen(false)
                          }}
                          className={`w-full p-2 text-left hover:bg-gray-100 transition-colors text-sm ${
                            selectedProject?.id === project.id ? 'bg-blue-50 text-blue-600' : ''
                          }`}
                        >
                          {project.name}
                        </button>
                      ))
                    ) : (
                      <div className="p-2 text-center text-gray-500 text-xs">
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
                <Plus size={16} className="mr-1" />
                <span className="text-sm">Nytt prosjekt</span>
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
                  className={`w-full p-2 rounded flex items-center mb-1 transition-colors ${
                    activeCategory === category.id 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{React.cloneElement(category.icon, { size: 16 })}</span>
                  <span className="text-sm">{category.name}</span>
                </button>
              ))}
            </div>

            {/* Sidebar navigation */}
            <nav className="p-3 border-t">
              <ul className="space-y-1">
                <li>
                  <button 
                    onClick={() => setActivePage('settings')}
                    className={`w-full flex items-center p-2 rounded-md transition-colors ${activePage === 'settings' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <Settings size={16} className="mr-2" />
                    <span className="text-sm">Innstillinger</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setShowProfileEdit(true)}
                    className={`w-full flex items-center p-2 rounded-md transition-colors ${activePage === 'profile' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span className="text-sm">Rediger profil</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center p-2 rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut size={16} className="mr-2" />
                    <span className="text-sm">Logg ut</span>
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
          <div className="flex-1 overflow-y-auto">
            {selectedProject ? (
              <div className="p-6">
                {activeCategory ? (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      {categories.find(c => c.id === activeCategory)?.name}
                    </h2>
                    <p className="text-gray-600">
                      Innhold for {categories.find(c => c.id === activeCategory)?.name} kommer snart.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-4 border">
                        <h4 className="text-sm font-medium mb-3 text-gray-700 flex items-center">
                          <Wind className="h-4 w-4 mr-1.5 text-blue-600" />
                          Ventilasjonssystemer
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium text-sm">Ikke definert</p>
                              <p className="text-xs text-gray-500">Ingen ventilasjonssystemer er definert</p>
                            </div>
                            <button className="text-xs text-blue-600 hover:text-blue-800">
                              Legg til
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border">
                        <h4 className="text-sm font-medium mb-3 text-gray-700 flex items-center">
                          <Droplets className="h-4 w-4 mr-1.5 text-green-600" />
                          Sanitærsystemer
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium text-sm">Ikke definert</p>
                              <p className="text-xs text-gray-500">Ingen sanitærsystemer er definert</p>
                            </div>
                            <button className="text-xs text-blue-600 hover:text-blue-800">
                              Legg til
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border">
                        <h4 className="text-sm font-medium mb-3 text-gray-700 flex items-center">
                          <Zap className="h-4 w-4 mr-1.5 text-yellow-600" />
                          Energisystemer
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium text-sm">Ikke definert</p>
                              <p className="text-xs text-gray-500">Ingen energisystemer er definert</p>
                            </div>
                            <button className="text-xs text-blue-600 hover:text-blue-800">
                              Legg til
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border">
                        <h4 className="text-sm font-medium mb-3 text-gray-700 flex items-center">
                          <Gauge className="h-4 w-4 mr-1.5 text-purple-600" />
                          Gass og trykkluft
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium text-sm">Ikke definert</p>
                              <p className="text-xs text-gray-500">Ingen gass- eller trykkluftsystemer er definert</p>
                            </div>
                            <button className="text-xs text-blue-600 hover:text-blue-800">
                              Legg til
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div 
                      className="h-40 bg-gray-200 rounded-t-lg relative"
                      style={{
                        backgroundImage: `url(${project.image_url || '/default-project.jpg'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                    <div className="p-4">
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-500">Prosjektnavn:</span>
                          <h3 className="text-lg font-semibold">{project.name}</h3>
                        </div>
                        
                        {project.client && (
                          <div>
                            <span className="text-sm text-gray-500">Kunde:</span>
                            <p className="text-sm">{project.client}</p>
                          </div>
                        )}

                        {project.description && (
                          <div>
                            <span className="text-sm text-gray-500">Beskrivelse:</span>
                            <p className="text-sm line-clamp-2">{project.description}</p>
                          </div>
                        )}

                        <div className="pt-4 flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin size={14} className="mr-1" />
                            <span>{project.location || 'Ingen lokasjon'}</span>
                          </div>
                          <button
                            onClick={() => setSelectedProject(project)}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                          >
                            Åpne prosjekt
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 px-4">
                    <FolderPlus size={48} className="text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen prosjekter ennå</h3>
                    <p className="text-gray-500 text-center mb-4">
                      Du har ikke opprettet noen prosjekter ennå. Kom i gang ved å opprette ditt første prosjekt.
                    </p>
                    <button
                      onClick={() => setShowNewProjectModal(true)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                    >
                      <Plus size={20} className="mr-2" />
                      Opprett nytt prosjekt
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for nytt prosjekt */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="p-3 border-b flex justify-between items-center">
              <h2 className="text-base font-medium">Nytt prosjekt</h2>
              <button 
                onClick={() => {
                  setShowNewProjectModal(false);
                  setProjectError(null);
                  setProjectImageFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <h2 className="text-lg font-medium mb-4">Nytt prosjekt</h2>
              
              <div className="mb-3">
                <label className="block text-xs text-gray-700 mb-1">Prosjektnavn</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Skriv inn prosjektnavn"
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-xs text-gray-700 mb-1">Størrelse</label>
                <input
                  type="text"
                  value={newProjectSize}
                  onChange={(e) => setNewProjectSize(e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="f.eks. 1000 m²"
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-xs text-gray-700 mb-1">Lokasjon</label>
                <input
                  type="text"
                  value={newProjectLocation}
                  onChange={(e) => setNewProjectLocation(e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="By/sted"
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-xs text-gray-700 mb-1">Totalentreprenør</label>
                <input
                  type="text"
                  value={newProjectMainContractor}
                  onChange={(e) => setNewProjectMainContractor(e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Entreprenørens navn"
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-xs text-gray-700 mb-1">Teknisk entreprenør</label>
                <input
                  type="text"
                  value={newProjectTechnicalContractor}
                  onChange={(e) => setNewProjectTechnicalContractor(e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Teknisk entreprenørs navn"
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-xs text-gray-700 mb-1">Kunde</label>
                <input
                  type="text"
                  value={newProjectClient}
                  onChange={(e) => setNewProjectClient(e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Kundenavn"
                />
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => {
                    setShowNewProjectModal(false);
                    setProjectError(null);
                    setProjectImageFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                >
                  Avbryt
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim()}
                  className={`px-3 py-1.5 text-sm text-white rounded ${
                    newProjectName.trim() ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Opprett prosjekt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for redigering av prosjekt */}
      {showEditProjectModal && editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="p-3 border-b flex justify-between items-center">
              <h2 className="text-base font-medium">Rediger prosjekt</h2>
              <button 
                onClick={() => {
                  setShowEditProjectModal(false);
                  setProjectError(null);
                  setProjectImageFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-3 overflow-y-auto flex-grow">
              {projectError && (
                <div className="mb-3 p-2 bg-red-100 text-red-700 rounded-md text-sm">
                  {projectError}
                </div>
              )}
              
              {/* Prosjektbilde */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Prosjektbilde
                </label>
                <div className="mt-1 flex items-center">
                  <div 
                    className="h-24 w-24 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-300"
                    style={projectImageFile ? {
                      backgroundImage: `url(${URL.createObjectURL(projectImageFile)})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    } : editingProject?.image_url ? {
                      backgroundImage: `url(${editingProject.image_url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    } : undefined}
                  >
                    {!projectImageFile && !editingProject?.image_url && <Image className="h-10 w-10 text-gray-400" />}
                  </div>
                  <div className="ml-3">
                    <label htmlFor="edit-project-image-upload" className="cursor-pointer px-2 py-1 bg-white border border-gray-300 rounded-md shadow-sm text-xs leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                      Velg bilde
                    </label>
                    <input
                      id="edit-project-image-upload"
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG, GIF opptil 10MB
                    </p>
                    {projectImageFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setProjectImageFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="mt-1 text-xs text-red-600 hover:text-red-800"
                      >
                        Fjern bilde
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Prosjektnavn *
                  </label>
                  <input
                    type="text"
                    value={editProjectName}
                    onChange={(e) => setEditProjectName(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Skriv inn prosjektnavn"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-xs text-gray-700 mb-1">Størrelse</label>
                  <input
                    type="text"
                    value={editProjectSize}
                    onChange={(e) => setEditProjectSize(e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="f.eks. 1000 m²"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-xs text-gray-700 mb-1">Lokasjon</label>
                  <input
                    type="text"
                    value={editProjectLocation}
                    onChange={(e) => setEditProjectLocation(e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="By/sted"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-xs text-gray-700 mb-1">Totalentreprenør</label>
                  <input
                    type="text"
                    value={editProjectMainContractor}
                    onChange={(e) => setEditProjectMainContractor(e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Entreprenørens navn"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-xs text-gray-700 mb-1">Teknisk entreprenør</label>
                  <input
                    type="text"
                    value={editProjectTechnicalContractor}
                    onChange={(e) => setEditProjectTechnicalContractor(e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Teknisk entreprenørs navn"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-xs text-gray-700 mb-1">Kunde</label>
                  <input
                    type="text"
                    value={editProjectClient}
                    onChange={(e) => setEditProjectClient(e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Kundenavn"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-xs text-gray-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    value={editProjectAddress}
                    onChange={(e) => setEditProjectAddress(e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Prosjektadresse"
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Beskrivelse
                </label>
                <textarea
                  value={editProjectDescription}
                  onChange={(e) => setEditProjectDescription(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Skriv inn prosjektbeskrivelse"
                  rows={2}
                />
              </div>
            </div>
            <div className="p-3 border-t bg-gray-50 flex justify-end sticky bottom-0">
              <button
                type="button"
                onClick={() => {
                  setShowEditProjectModal(false);
                  setProjectError(null);
                }}
                className="px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm mr-2 hover:bg-gray-50"
              >
                Avbryt
              </button>
              <button
                type="button"
                onClick={handleUpdateProject}
                disabled={updatingProject}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {updatingProject ? (
                  <>
                    <Loader size={14} className="animate-spin mr-1" />
                    Oppdaterer...
                  </>
                ) : (
                  <>
                    <Edit size={14} className="mr-1" />
                    Oppdater prosjekt
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
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {member.role === 'owner' 
                                ? 'Eier' 
                                : member.role === 'admin' 
                                ? 'Administrator' 
                                : 'Medlem'}
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
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {invitation.role === 'admin' 
                                ? 'Administrator' 
                                : 'Medlem'}
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
                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Administrator</option>
                  <option value="member">Medlem</option>
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
                onChange={(e) => setEditRole(e.target.value as 'admin' | 'member')}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="admin">Administrator</option>
                <option value="member">Medlem</option>
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

      {/* Modal for å bekrefte sletting av prosjekt */}
      {showDeleteConfirmation && projectToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Bekreft sletting</h2>
            </div>
            <div className="p-4">
              <p className="mb-4">
                Er du sikker på at du vil slette <span className="font-semibold">{projectToDelete.name}</span>?
              </p>
              <p className="text-gray-500 text-sm">
                Dette vil fjerne prosjektet permanent.
              </p>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false)
                  setProjectToDelete(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
              >
                Avbryt
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={deletingProject}
                className={`px-4 py-2 bg-red-500 text-white rounded flex items-center ${
                  deletingProject ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'
                }`}
              >
                {deletingProject && <Loader size={16} className="animate-spin mr-2" />}
                {deletingProject ? 'Sletter...' : 'Slett prosjekt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skjult filinput for bildeopplasting */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {/* Vis opplastingsknapp hvis en fil er valgt */}
      {projectImageFile && editingProject && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => handleImageUpload(editingProject.id, projectImageFile)}
            disabled={uploadingImage}
            className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-lg hover:bg-blue-700 flex items-center"
          >
            {uploadingImage ? (
              <>
                <Loader size={18} className="animate-spin mr-2" />
                Laster opp...
              </>
            ) : (
              <>
                <Upload size={18} className="mr-2" />
                Last opp bilde for {editingProject.name}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default Dashboard 