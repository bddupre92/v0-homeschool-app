"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define types for our data context
type Board = {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
};

type BoardItem = {
  id: string;
  boardId: string;
  title: string;
  content?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

type Resource = {
  id: string;
  title: string;
  description?: string;
  url?: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
};

type Planner = {
  id: string;
  title: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
};

type PlannerItem = {
  id: string;
  plannerId: string;
  title: string;
  description?: string;
  date?: Date;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type DataContextType = {
  // Boards
  boards: Board[];
  loadingBoards: boolean;
  errorBoards: string | null;
  fetchBoards: () => Promise<void>;
  createBoard: (data: { title: string; description?: string }) => Promise<Board>;
  updateBoard: (id: string, data: { title?: string; description?: string }) => Promise<Board>;
  deleteBoard: (id: string) => Promise<void>;
  
  // Board Items
  boardItems: Record<string, BoardItem[]>;
  loadingBoardItems: boolean;
  errorBoardItems: string | null;
  fetchBoardItems: (boardId: string) => Promise<void>;
  createBoardItem: (boardId: string, data: { title: string; content?: string; status: string }) => Promise<BoardItem>;
  updateBoardItem: (boardId: string, itemId: string, data: { title?: string; content?: string; status?: string }) => Promise<BoardItem>;
  deleteBoardItem: (boardId: string, itemId: string) => Promise<void>;
  
  // Resources
  resources: Resource[];
  loadingResources: boolean;
  errorResources: string | null;
  fetchResources: () => Promise<void>;
  createResource: (data: { title: string; description?: string; url?: string; category: string }) => Promise<Resource>;
  updateResource: (id: string, data: { title?: string; description?: string; url?: string; category?: string }) => Promise<Resource>;
  deleteResource: (id: string) => Promise<void>;
  
  // Planners
  planners: Planner[];
  loadingPlanners: boolean;
  errorPlanners: string | null;
  fetchPlanners: () => Promise<void>;
  createPlanner: (data: { title: string; description?: string; startDate?: Date; endDate?: Date }) => Promise<Planner>;
  updatePlanner: (id: string, data: { title?: string; description?: string; startDate?: Date; endDate?: Date }) => Promise<Planner>;
  deletePlanner: (id: string) => Promise<void>;
  
  // Planner Items
  plannerItems: Record<string, PlannerItem[]>;
  loadingPlannerItems: boolean;
  errorPlannerItems: string | null;
  fetchPlannerItems: (plannerId: string) => Promise<void>;
  createPlannerItem: (plannerId: string, data: { title: string; description?: string; date?: Date; completed?: boolean }) => Promise<PlannerItem>;
  updatePlannerItem: (plannerId: string, itemId: string, data: { title?: string; description?: string; date?: Date; completed?: boolean }) => Promise<PlannerItem>;
  deletePlannerItem: (plannerId: string, itemId: string) => Promise<void>;
};

// Create the context with default values
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider component
export function DataProvider({ children }: { children: ReactNode }) {
  // Boards state
  const [boards, setBoards] = useState<Board[]>([]);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [errorBoards, setErrorBoards] = useState<string | null>(null);

  // Board Items state
  const [boardItems, setBoardItems] = useState<Record<string, BoardItem[]>>({});
  const [loadingBoardItems, setLoadingBoardItems] = useState(false);
  const [errorBoardItems, setErrorBoardItems] = useState<string | null>(null);

  // Resources state
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [errorResources, setErrorResources] = useState<string | null>(null);

  // Planners state
  const [planners, setPlanners] = useState<Planner[]>([]);
  const [loadingPlanners, setLoadingPlanners] = useState(false);
  const [errorPlanners, setErrorPlanners] = useState<string | null>(null);

  // Planner Items state
  const [plannerItems, setPlannerItems] = useState<Record<string, PlannerItem[]>>({});
  const [loadingPlannerItems, setLoadingPlannerItems] = useState(false);
  const [errorPlannerItems, setErrorPlannerItems] = useState<string | null>(null);

  // Boards functions
  const fetchBoards = async () => {
    setLoadingBoards(true);
    setErrorBoards(null);
    try {
      const response = await fetch('/api/boards');
      if (!response.ok) {
        throw new Error('Failed to fetch boards');
      }
      const data = await response.json();
      setBoards(data);
    } catch (error) {
      setErrorBoards(error instanceof Error ? error.message : 'An error occurred');
      console.error('Error fetching boards:', error);
    } finally {
      setLoadingBoards(false);
    }
  };

  const createBoard = async (data: { title: string; description?: string }): Promise<Board> => {
    const response = await fetch('/api/boards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create board');
    }
    
    const newBoard = await response.json();
    setBoards(prev => [...prev, newBoard]);
    return newBoard;
  };

  const updateBoard = async (id: string, data: { title?: string; description?: string }): Promise<Board> => {
    const response = await fetch(`/api/boards/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update board');
    }
    
    const updatedBoard = await response.json();
    setBoards(prev => prev.map(board => board.id === id ? updatedBoard : board));
    return updatedBoard;
  };

  const deleteBoard = async (id: string): Promise<void> => {
    const response = await fetch(`/api/boards/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete board');
    }
    
    setBoards(prev => prev.filter(board => board.id !== id));
    // Also remove board items for this board
    setBoardItems(prev => {
      const newBoardItems = { ...prev };
      delete newBoardItems[id];
      return newBoardItems;
    });
  };

  // Board Items functions
  const fetchBoardItems = async (boardId: string) => {
    setLoadingBoardItems(true);
    setErrorBoardItems(null);
    try {
      const response = await fetch(`/api/boards/${boardId}/items`);
      if (!response.ok) {
        throw new Error('Failed to fetch board items');
      }
      const data = await response.json();
      setBoardItems(prev => ({
        ...prev,
        [boardId]: data,
      }));
    } catch (error) {
      setErrorBoardItems(error instanceof Error ? error.message : 'An error occurred');
      console.error('Error fetching board items:', error);
    } finally {
      setLoadingBoardItems(false);
    }
  };

  const createBoardItem = async (boardId: string, data: { title: string; content?: string; status: string }): Promise<BoardItem> => {
    const response = await fetch(`/api/boards/${boardId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create board item');
    }
    
    const newItem = await response.json();
    setBoardItems(prev => ({
      ...prev,
      [boardId]: [...(prev[boardId] || []), newItem],
    }));
    return newItem;
  };

  const updateBoardItem = async (boardId: string, itemId: string, data: { title?: string; content?: string; status?: string }): Promise<BoardItem> => {
    const response = await fetch(`/api/boards/${boardId}/items/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update board item');
    }
    
    const updatedItem = await response.json();
    setBoardItems(prev => ({
      ...prev,
      [boardId]: prev[boardId]?.map(item => item.id === itemId ? updatedItem : item) || [],
    }));
    return updatedItem;
  };

  const deleteBoardItem = async (boardId: string, itemId: string): Promise<void> => {
    const response = await fetch(`/api/boards/${boardId}/items/${itemId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete board item');
    }
    
    setBoardItems(prev => ({
      ...prev,
      [boardId]: prev[boardId]?.filter(item => item.id !== itemId) || [],
    }));
  };

  // Resources functions
  const fetchResources = async () => {
    setLoadingResources(true);
    setErrorResources(null);
    try {
      const response = await fetch('/api/resources');
      if (!response.ok) {
        throw new Error('Failed to fetch resources');
      }
      const data = await response.json();
      setResources(data);
    } catch (error) {
      setErrorResources(error instanceof Error ? error.message : 'An error occurred');
      console.error('Error fetching resources:', error);
    } finally {
      setLoadingResources(false);
    }
  };

  const createResource = async (data: { title: string; description?: string; url?: string; category: string }): Promise<Resource> => {
    const response = await fetch('/api/resources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create resource');
    }
    
    const newResource = await response.json();
    setResources(prev => [...prev, newResource]);
    return newResource;
  };

  const updateResource = async (id: string, data: { title?: string; description?: string; url?: string; category?: string }): Promise<Resource> => {
    const response = await fetch(`/api/resources/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update resource');
    }
    
    const updatedResource = await response.json();
    setResources(prev => prev.map(resource => resource.id === id ? updatedResource : resource));
    return updatedResource;
  };

  const deleteResource = async (id: string): Promise<void> => {
    const response = await fetch(`/api/resources/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete resource');
    }
    
    setResources(prev => prev.filter(resource => resource.id !== id));
  };

  // Planners functions
  const fetchPlanners = async () => {
    setLoadingPlanners(true);
    setErrorPlanners(null);
    try {
      const response = await fetch('/api/planners');
      if (!response.ok) {
        throw new Error('Failed to fetch planners');
      }
      const data = await response.json();
      setPlanners(data);
    } catch (error) {
      setErrorPlanners(error instanceof Error ? error.message : 'An error occurred');
      console.error('Error fetching planners:', error);
    } finally {
      setLoadingPlanners(false);
    }
  };

  const createPlanner = async (data: { title: string; description?: string; startDate?: Date; endDate?: Date }): Promise<Planner> => {
    const response = await fetch('/api/planners', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create planner');
    }
    
    const newPlanner = await response.json();
    setPlanners(prev => [...prev, newPlanner]);
    return newPlanner;
  };

  const updatePlanner = async (id: string, data: { title?: string; description?: string; startDate?: Date; endDate?: Date }): Promise<Planner> => {
    const response = await fetch(`/api/planners/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update planner');
    }
    
    const updatedPlanner = await response.json();
    setPlanners(prev => prev.map(planner => planner.id === id ? updatedPlanner : planner));
    return updatedPlanner;
  };

  const deletePlanner = async (id: string): Promise<void> => {
    const response = await fetch(`/api/planners/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete planner');
    }
    
    setPlanners(prev => prev.filter(planner => planner.id !== id));
    // Also remove planner items for this planner
    setPlannerItems(prev => {
      const newPlannerItems = { ...prev };
      delete newPlannerItems[id];
      return newPlannerItems;
    });
  };

  // Planner Items functions
  const fetchPlannerItems = async (plannerId: string) => {
    setLoadingPlannerItems(true);
    setErrorPlannerItems(null);
    try {
      const response = await fetch(`/api/planners/${plannerId}/items`);
      if (!response.ok) {
        throw new Error('Failed to fetch planner items');
      }
      const data = await response.json();
      setPlannerItems(prev => ({
        ...prev,
        [plannerId]: data,
      }));
    } catch (error) {
      setErrorPlannerItems(error instanceof Error ? error.message : 'An error occurred');
      console.error('Error fetching planner items:', error);
    } finally {
      setLoadingPlannerItems(false);
    }
  };

  const createPlannerItem = async (plannerId: string, data: { title: string; description?: string; date?: Date; completed?: boolean }): Promise<PlannerItem> => {
    const response = await fetch(`/api/planners/${plannerId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create planner item');
    }
    
    const newItem = await response.json();
    setPlannerItems(prev => ({
      ...prev,
      [plannerId]: [...(prev[plannerId] || []), newItem],
    }));
    return newItem;
  };

  const updatePlannerItem = async (plannerId: string, itemId: string, data: { title?: string; description?: string; date?: Date; completed?: boolean }): Promise<PlannerItem> => {
    const response = await fetch(`/api/planners/${plannerId}/items/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update planner item');
    }
    
    const updatedItem = await response.json();
    setPlannerItems(prev => ({
      ...prev,
      [plannerId]: prev[plannerId]?.map(item => item.id === itemId ? updatedItem : item) || [],
    }));
    return updatedItem;
  };

  const deletePlannerItem = async (plannerId: string, itemId: string): Promise<void> => {
    const response = await fetch(`/api/planners/${plannerId}/items/${itemId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete planner item');
    }
    
    setPlannerItems(prev => ({
      ...prev,
      [plannerId]: prev[plannerId]?.filter(item => item.id !== itemId) || [],
    }));
  };

  const value = {
    // Boards
    boards,
    loadingBoards,
    errorBoards,
    fetchBoards,
    createBoard,
    updateBoard,
    deleteBoard,
    
    // Board Items
    boardItems,
    loadingBoardItems,
    errorBoardItems,
    fetchBoardItems,
    createBoardItem,
    updateBoardItem,
    deleteBoardItem,
    
    // Resources
    resources,
    loadingResources,
    errorResources,
    fetchResources,
    createResource,
    updateResource,
    deleteResource,
    
    // Planners
    planners,
    loadingPlanners,
    errorPlanners,
    fetchPlanners,
    createPlanner,
    updatePlanner,
    deletePlanner,
    
    // Planner Items
    plannerItems,
    loadingPlannerItems,
    errorPlannerItems,
    fetchPlannerItems,
    createPlannerItem,
    updatePlannerItem,
    deletePlannerItem,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// Custom hook to use the data context
export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
