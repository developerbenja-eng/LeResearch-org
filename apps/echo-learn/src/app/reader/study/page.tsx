'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Plus,
  FolderOpen,
  Brain,
  MessageSquare,
  Map,
  FileText,
  Sparkles,
  ChevronRight,
  Clock,
  CheckCircle,
  Play,
  BarChart3,
  Network,
  Layers,
} from 'lucide-react';

interface Workspace {
  workspace_id: string;
  name: string;
  description: string | null;
  goal: string | null;
  status: string;
  paper_count: number;
  paper_titles: string[];
  created_at: string;
  last_accessed_at: string | null;
}

interface WorkspaceDetails {
  workspace: Workspace;
  papers: {
    paper_id: string;
    title: string;
    authors: { name: string }[];
    read_status: string;
    progress_percent: number;
    sections_completed: number;
    total_sections: number;
  }[];
  materials: {
    study_guides: number;
    concept_maps: number;
    flashcard_decks: number;
    diagrams: number;
    chats: number;
  };
}

export default function StudyRoomPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceGoal, setNewWorkspaceGoal] = useState('');
  const [activeTab, setActiveTab] = useState<'papers' | 'guides' | 'maps' | 'chat'>('papers');
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch workspaces
  useEffect(() => {
    fetchWorkspaces();
  }, []);

  async function fetchWorkspaces() {
    try {
      const response = await fetch('/api/reader/study/workspaces');
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data.workspaces);

        // Auto-select first workspace if available
        if (data.workspaces.length > 0 && !selectedWorkspace) {
          loadWorkspace(data.workspaces[0].workspace_id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadWorkspace(workspaceId: string) {
    try {
      const response = await fetch(`/api/reader/study/workspaces/${workspaceId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedWorkspace(data);
      }
    } catch (error) {
      console.error('Failed to load workspace:', error);
    }
  }

  async function createWorkspace() {
    if (!newWorkspaceName.trim()) return;

    try {
      const response = await fetch('/api/reader/study/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newWorkspaceName,
          goal: newWorkspaceGoal || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewWorkspaceName('');
        setNewWorkspaceGoal('');
        setIsCreating(false);
        fetchWorkspaces();
        loadWorkspace(data.workspace_id);
      }
    } catch (error) {
      console.error('Failed to create workspace:', error);
    }
  }

  async function generateStudyGuide(paperId: string) {
    if (!selectedWorkspace) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/reader/study/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperId,
          workspaceId: selectedWorkspace.workspace.workspace_id,
          model: 'FLASH',
          includeFlashcards: true,
        }),
      });

      if (response.ok) {
        // Refresh workspace to show new materials
        loadWorkspace(selectedWorkspace.workspace.workspace_id);
      }
    } catch (error) {
      console.error('Failed to generate study guide:', error);
    } finally {
      setIsGenerating(false);
    }
  }

  async function generateConceptMap(paperId: string) {
    if (!selectedWorkspace) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/reader/study/concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperId,
          workspaceId: selectedWorkspace.workspace.workspace_id,
          model: 'FLASH',
        }),
      });

      if (response.ok) {
        loadWorkspace(selectedWorkspace.workspace.workspace_id);
      }
    } catch (error) {
      console.error('Failed to generate concept map:', error);
    } finally {
      setIsGenerating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="animate-pulse text-neutral-400">Loading Study Room...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/reader" className="text-neutral-400 hover:text-white">
              <BookOpen className="w-5 h-5" />
            </Link>
            <ChevronRight className="w-4 h-4 text-neutral-600" />
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Study Room
            </h1>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Workspace
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Workspaces */}
          <aside className="col-span-3">
            <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4">
              <h2 className="text-sm font-medium text-neutral-400 mb-3">Workspaces</h2>

              {workspaces.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-4">
                  No workspaces yet. Create one to start studying!
                </p>
              ) : (
                <div className="space-y-2">
                  {workspaces.map((workspace) => (
                    <button
                      key={workspace.workspace_id}
                      onClick={() => loadWorkspace(workspace.workspace_id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedWorkspace?.workspace.workspace_id === workspace.workspace_id
                          ? 'bg-purple-600/20 border border-purple-500/50'
                          : 'bg-neutral-800/50 hover:bg-neutral-800 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <FolderOpen className="w-4 h-4 text-purple-400 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{workspace.name}</p>
                          <p className="text-xs text-neutral-500">
                            {workspace.paper_count} paper{workspace.paper_count !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="col-span-9">
            {!selectedWorkspace ? (
              <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-12 text-center">
                <Brain className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Welcome to Study Room</h2>
                <p className="text-neutral-400 mb-6">
                  Create a workspace to organize your papers and generate AI-powered study materials.
                </p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Workspace
                </button>
              </div>
            ) : (
              <>
                {/* Workspace Header */}
                <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 mb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{selectedWorkspace.workspace.name}</h2>
                      {selectedWorkspace.workspace.goal && (
                        <p className="text-neutral-400">{selectedWorkspace.workspace.goal}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-400">
                          {selectedWorkspace.papers.length}
                        </p>
                        <p className="text-xs text-neutral-500">Papers</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-400">
                          {selectedWorkspace.materials.study_guides +
                            selectedWorkspace.materials.concept_maps +
                            selectedWorkspace.materials.flashcard_decks}
                        </p>
                        <p className="text-xs text-neutral-500">Materials</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-5 gap-4 mt-6">
                    <div className="bg-neutral-800/50 rounded-lg p-3">
                      <FileText className="w-5 h-5 text-blue-400 mb-1" />
                      <p className="text-lg font-semibold">{selectedWorkspace.materials.study_guides}</p>
                      <p className="text-xs text-neutral-500">Study Guides</p>
                    </div>
                    <div className="bg-neutral-800/50 rounded-lg p-3">
                      <Network className="w-5 h-5 text-green-400 mb-1" />
                      <p className="text-lg font-semibold">{selectedWorkspace.materials.concept_maps}</p>
                      <p className="text-xs text-neutral-500">Concept Maps</p>
                    </div>
                    <div className="bg-neutral-800/50 rounded-lg p-3">
                      <Layers className="w-5 h-5 text-yellow-400 mb-1" />
                      <p className="text-lg font-semibold">{selectedWorkspace.materials.flashcard_decks}</p>
                      <p className="text-xs text-neutral-500">Flashcard Decks</p>
                    </div>
                    <div className="bg-neutral-800/50 rounded-lg p-3">
                      <BarChart3 className="w-5 h-5 text-orange-400 mb-1" />
                      <p className="text-lg font-semibold">{selectedWorkspace.materials.diagrams}</p>
                      <p className="text-xs text-neutral-500">Diagrams</p>
                    </div>
                    <div className="bg-neutral-800/50 rounded-lg p-3">
                      <MessageSquare className="w-5 h-5 text-purple-400 mb-1" />
                      <p className="text-lg font-semibold">{selectedWorkspace.materials.chats}</p>
                      <p className="text-xs text-neutral-500">Chat Sessions</p>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                  {[
                    { id: 'papers', label: 'Papers', icon: BookOpen },
                    { id: 'guides', label: 'Study Guides', icon: FileText },
                    { id: 'maps', label: 'Concept Maps', icon: Map },
                    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
                  {activeTab === 'papers' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Papers in Workspace</h3>
                        <Link
                          href="/reader/library"
                          className="text-sm text-purple-400 hover:text-purple-300"
                        >
                          Add from Library →
                        </Link>
                      </div>

                      {selectedWorkspace.papers.length === 0 ? (
                        <p className="text-neutral-500 text-center py-8">
                          No papers in this workspace yet. Add papers from your library to start studying.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {selectedWorkspace.papers.map((paper) => (
                            <div
                              key={paper.paper_id}
                              className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <Link
                                    href={`/reader/${paper.paper_id}`}
                                    className="font-medium hover:text-purple-400 transition-colors"
                                  >
                                    {paper.title}
                                  </Link>
                                  <p className="text-sm text-neutral-500 mt-1">
                                    {paper.authors.slice(0, 3).map((a) => a.name).join(', ')}
                                  </p>

                                  {/* Progress bar */}
                                  <div className="mt-3 flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-neutral-700 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all"
                                        style={{ width: `${paper.progress_percent}%` }}
                                      />
                                    </div>
                                    <span className="text-sm text-neutral-400">
                                      {paper.sections_completed}/{paper.total_sections} sections
                                    </span>
                                    {paper.read_status === 'read' && (
                                      <CheckCircle className="w-4 h-4 text-green-400" />
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                  <Link
                                    href={`/reader/${paper.paper_id}`}
                                    className="p-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
                                    title="Continue Reading"
                                  >
                                    <Play className="w-4 h-4" />
                                  </Link>
                                  <button
                                    onClick={() => generateStudyGuide(paper.paper_id)}
                                    disabled={isGenerating}
                                    className="p-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-colors disabled:opacity-50"
                                    title="Generate Study Guide"
                                  >
                                    <Sparkles className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => generateConceptMap(paper.paper_id)}
                                    disabled={isGenerating}
                                    className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors disabled:opacity-50"
                                    title="Generate Concept Map"
                                  >
                                    <Network className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'guides' && (
                    <div>
                      <h3 className="font-semibold mb-4">Study Guides</h3>
                      {selectedWorkspace.materials.study_guides === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                          <p className="text-neutral-500 mb-3">No study guides yet</p>
                          <p className="text-sm text-neutral-600">
                            Generate a study guide from any paper using the{' '}
                            <Sparkles className="w-4 h-4 inline text-purple-400" /> button
                          </p>
                        </div>
                      ) : (
                        <p className="text-neutral-400">
                          {selectedWorkspace.materials.study_guides} study guide(s) available
                        </p>
                      )}
                    </div>
                  )}

                  {activeTab === 'maps' && (
                    <div>
                      <h3 className="font-semibold mb-4">Concept Maps</h3>
                      {selectedWorkspace.materials.concept_maps === 0 ? (
                        <div className="text-center py-8">
                          <Network className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                          <p className="text-neutral-500 mb-3">No concept maps yet</p>
                          <p className="text-sm text-neutral-600">
                            Generate a concept map from any paper using the{' '}
                            <Network className="w-4 h-4 inline text-green-400" /> button
                          </p>
                        </div>
                      ) : (
                        <p className="text-neutral-400">
                          {selectedWorkspace.materials.concept_maps} concept map(s) available
                        </p>
                      )}
                    </div>
                  )}

                  {activeTab === 'chat' && (
                    <div>
                      <h3 className="font-semibold mb-4">AI Study Chat</h3>
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                        <p className="text-neutral-500 mb-3">
                          Ask questions about your papers and get AI-powered answers
                        </p>
                        <button
                          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors"
                          onClick={() => {
                            // Open chat modal or navigate to chat
                          }}
                        >
                          <MessageSquare className="w-4 h-4" />
                          Start New Chat
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Create Workspace Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create Study Workspace</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Workspace Name</label>
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="e.g., Machine Learning Research"
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1">Study Goal (optional)</label>
                <textarea
                  value={newWorkspaceGoal}
                  onChange={(e) => setNewWorkspaceGoal(e.target.value)}
                  placeholder="What do you want to learn from these papers?"
                  rows={3}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewWorkspaceName('');
                  setNewWorkspaceGoal('');
                }}
                className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createWorkspace}
                disabled={!newWorkspaceName.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generation Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-8 text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium">Generating with Gemini 3...</p>
            <p className="text-sm text-neutral-400 mt-1">This may take a moment</p>
          </div>
        </div>
      )}
    </div>
  );
}
