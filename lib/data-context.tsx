'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Board {
  id: string;
  title: string;
  description: string | null;
  status: string;
  visibility: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  items?: BoardItem[];
}

interface BoardItem {
  id: string;
  title: string;
  content: string | null;
  type: string;
  position: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  boardId: string;
  userId: string;
}

interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string | null;
  filePath: string | null;
  tags: string | null;
  visibility: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  gradeLevel: string | null;
  duration: number | null;
  content: string | null;
  createdAt: string;
  updatedAt: string;
  resources: Resource[];
}

interface Planner {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  items?: PlannerItem[];
}

interface PlannerItem {
  id: string;
  title: string;
  description: string | null;
  date: string;
  startTime: string | null;
  endTime: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  plannerId: string;
  lessonId: string | null;
  userId: string;
  lesson?: Lesson;
}

interface DataContextType {
  // Boards
  boards: Board[];
  currentBoard: Board | null;
  loadBoards: () => Promise<void>;
  getBoard: (id: string) => Promise<void>;
  createBoard: (data: Partial<Board>) => Promise<Board>;
  updateBoard: (id: string, data: Partial<Board>) => Promise<Board>;
  deleteBoard: (id: string) => Promise<void>;
  
  // Board Items
  boardItems: BoardItem[];
  currentBoardItem: BoardItem | null;
  loadBoardItems: (boardId: string) => Promise<void>;
  getBoardItem: (boardId: string, itemId: string) => Promise<void>;
  createBoardItem: (boardId: string, data: Partial<BoardItem>) => Promise<BoardItem>;
  updateBoardItem: (boardId: string, itemId: string, data: Partial<BoardItem>) => Promise<BoardItem>;
  deleteBoardItem: (boardId: string, itemId: string) => Promise<void>;
  
  // Resources
  resources: Resource[];
  currentResource: Resource | null;
  loadResources: () => Promise<void>;
  getResource: (id: string) => Promise<void>;
  createResource: (data: Partial<Resource>) => Promise<Resource>;
  updateResource: (id: string, data: Partial<Resource>) => Promise<Resource>;
  deleteResource: (id: string) => Promise<void>;
  
  // Lessons
  lessons: Lesson[];
  currentLesson: Lesson | null;
  loadLessons: () => Promise<void>;
  getLesson: (id: string) => Promise<void>;
  createLesson: (data: Partial<Lesson>) => Promise<Lesson>;
  updateLesson: (id: string, data: Partial<Lesson>) => Promise<Lesson>;
  deleteLesson: (id: string) => Promise<void>;
  
  // Planners
  planners: Planner[];
  currentPlanner: Planner | null;
  loadPlanners: () => Promise<void>;
  getPlanner: (id: string) => Promise<void>;
  createPlanner: (data: Partial<Planner>) => Promise<Planner>;
  updatePlanner: (id: string, data: Partial<Planner>) => Promise<Planner>;
  deletePlanner: (id: string) => Promise<void>;
  
  // Planner Items
  plannerItems: PlannerItem[];
  currentPlannerItem: PlannerItem | null;
  loadPlannerItems: (plannerId: string) => Promise<void>;
  getPlannerItem: (plannerId: string, itemId: string) => Promise<void>;
  createPlannerItem: (plannerId: string, data: Partial<PlannerItem>) => Promise<PlannerItem>;
  updatePlannerItem: (plannerId: string, itemId: string, data: Partial<PlannerItem>) => Promise<PlannerItem>;
  deletePlannerItem: (plannerId: string, itemId: string) => Promise<void>;
  
  // Loading states
  loading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  // State for boards
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  
  // State for board items
  const [boardItems, setBoardItems] = useState<BoardItem[]>([]);
  const [currentBoardItem, setCurrentBoardItem] = useState<BoardItem | null>(null);
  
  // State for resources
  const [resources, setResources] = useState<Resource[]>([]);
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);
  
  // State for lessons
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  
  // State for planners
  const [planners, setPlanners] = useState<Planner[]>([]);
  const [currentPlanner, setCurrentPlanner] = useState<Planner | null>(null);
  
  // State for planner items
  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>([]);
  const [currentPlannerItem, setCurrentPlannerItem] = useState<PlannerItem | null>(null);
  
  // Loading and error states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Board functions
  const loadBoards = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/boards');
      if (!response.ok) {
        throw new Error('Failed to load boards');
      }
      const data = await response.json();
      setBoards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error loading boards:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBoard = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/boards/${id}`);
      if (!response.ok) {
        throw new Error('Failed to load board');
      }
      const data = await response.json();
      setCurrentBoard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error loading board:', err);
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async (data: Partial<Board>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create board');
      }
      const newBoard = await response.json();
      setBoards([...boards, newBoard]);
      return newBoard;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error creating board:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBoard = async (id: string, data: Partial<Board>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/boards/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update board');
      }
      const updatedBoard = await response.json();
      setBoards(boards.map(board => board.id === id ? updatedBoard : board));
      if (currentBoard && currentBoard.id === id) {
        setCurrentBoard(updatedBoard);
      }
      return updatedBoard;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating board:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBoard = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/boards/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete board');
      }
      setBoards(boards.filter(board => board.id !== id));
      if (currentBoard && currentBoard.id === id) {
        setCurrentBoard(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting board:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Board Items functions
  const loadBoardItems = async (boardId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/boards/${boardId}/items`);
      if (!response.ok) {
        throw new Error('Failed to load board items');
      }
      const data = await response.json();
      setBoardItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error loading board items:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBoardItem = async (boardId: string, itemId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/boards/${boardId}/items/${itemId}`);
      if (!response.ok) {
        throw new Error('Failed to load board item');
      }
      const data = await response.json();
      setCurrentBoardItem(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error loading board item:', err);
    } finally {
      setLoading(false);
    }
  };

  const createBoardItem = async (boardId: string, data: Partial<BoardItem>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/boards/${boardId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create board item');
      }
      const newItem = await response.json();
      setBoardItems([...boardItems, newItem]);
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error creating board item:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBoardItem = async (boardId: string, itemId: string, data: Partial<BoardItem>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/boards/${boardId}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update board item');
      }
      const updatedItem = await response.json();
      setBoardItems(boardItems.map(item => item.id === itemId ? updatedItem : item));
      if (currentBoardItem && currentBoardItem.id === itemId) {
        setCurrentBoardItem(updatedItem);
      }
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating board item:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBoardItem = async (boardId: string, itemId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/boards/${boardId}/items/${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete board item');
      }
      setBoardItems(boardItems.filter(item => item.id !== itemId));
      if (currentBoardItem && currentBoardItem.id === itemId) {
        setCurrentBoardItem(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting board item:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Resources functions
  const loadResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/resources');
      if (!response.ok) {
        throw new Error('Failed to load resources');
      }
      const data = await response.json();
      setResources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error loading resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const getResource = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/resources/${id}`);
      if (!response.ok) {
        throw new Error('Failed to load resource');
      }
      const data = await response.json();
      setCurrentResource(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error loading resource:', err);
    } finally {
      setLoading(false);
    }
  };

  const createResource = async (data: Partial<Resource>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create resource');
      }
      const newResource = await response.json();
      setResources([...resources, newResource]);
      return newResource;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error creating resource:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateResource = async (id: string, data: Partial<Resource>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update resource');
      }
      const updatedResource = await response.json();
      setResources(resources.map(resource => resource.id === id ? updatedResource : resource));
      if (currentResource && currentResource.id === id) {
        setCurrentResource(updatedResource);
      }
      return updatedResource;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating resource:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteResource = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete resource');
      }
      setResources(resources.filter(resource => resource.id !== id));
      if (currentResource && currentResource.id === id) {
        setCurrentResource(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting resource:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Lessons functions
  const loadLessons = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/lessons');
      if (!response.ok) {
        throw new Error('Failed to load lessons');
      }
      const data = await response.json();
      setLessons(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error loading lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLesson = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/lessons/${id}`);
      if (!response.ok) {
        throw new Error('Failed to load lesson');
      }
      const data = await response.json();
      setCurrentLesson(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error loading lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const createLesson = async (data: Partial<Lesson>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create lesson');
      }
      const newLesson = await response.json();
      setLessons([...lessons, newLesson]);
      return newLesson;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error creating lesson:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLesson = async (id: string, data: Partial<Lesson>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/lessons/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update lesson');
      }
      const updatedLesson = await response.json();
      setLessons(lessons.map(lesson => lesson.id === id ? updatedLesson : lesson));
      if (currentLesson && currentLesson.id === id) {
        setCurrentLesson(updatedLesson);
      }
      return updatedLesson;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating lesson:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteLesson = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/lessons/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete lesson');
      }
      setLessons(lessons.filter(lesson => lesson.id !== id));
      if (currentLesson && currentLesson.id === id) {
        setCurrentLesson(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting lesson:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Planners functions
  const loadPlanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/planners');
      if (!response.ok) {
        throw new Error('Failed to load planners');
      }
      const data = await response.json();
      setPlanners(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error loading planners:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPlanner = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/planners/${id}`);
      if (!response.ok) {
        throw new Error('Failed to load planner');
      }
      const data = await response.json();
      setCurrentPlanner(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error loading planner:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPlanner = async (data: Partial<Planner>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/planners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create planner');
      }
      const newPlanner = await response.json();
      setPlanners([...planners, newPlanner]);
      return newPlanner;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error creating planner:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePlanner = async (id: string, data: Partial<Planner>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/planners/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update planner');
      }
      const updatedPlanner = await response.json();
      setPlanners(planners.map(planner => planner.id === id ? updatedPlanner : planner));
      if (currentPlanner && currentPlanner.id === id) {
        setCurrentPlanner(updatedPlanner);
      }
      return updatedPlanner;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating planner:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePlanner = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/planners/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete planner');
      }
      setPlanners(planners.filter(planner => planner.id !== id));
      if (currentPlanner && currentPlanner.id === id) {
        setCurrentPlanner(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting planner:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Planner Items functions
  const loadPlannerItems = async (plannerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/planners/${plannerId}/items`);
      if (!response.ok) {
        throw new Error('Failed to load planner items');
      }
      const data = await response.json();
      setPlannerItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error loading planner items:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPlannerItem = async (plannerId: string, itemId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/planners/${plannerId}/items/${itemId}`);
      if (!response.ok) {
        throw new Error('Failed to load planner item');
      }
      const data = await response.json();
      setCurrentPlannerItem(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error loading planner item:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPlannerItem = async (plannerId: string, data: Partial<PlannerItem>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/planners/${plannerId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create planner item');
      }
      const newItem = await response.json();
      setPlannerItems([...plannerItems, newItem]);
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error creating planner item:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePlannerItem = async (plannerId: string, itemId: string, data: Partial<PlannerItem>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/planners/${plannerId}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update planner item');
      }
      const updatedItem = await response.json();
      setPlannerItems(plannerItems.map(item => item.id === itemId ? updatedItem : item));
      if (currentPlannerItem && currentPlannerItem.id === itemId) {
        setCurrentPlannerItem(updatedItem);
      }
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating planner item:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePlannerItem = async (plannerId: string, itemId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/planners/${plannerId}/items/${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete planner item');
      }
      setPlannerItems(plannerItems.filter(item => item.id !== itemId));
      if (currentPlannerItem && currentPlannerItem.id === itemId) {
        setCurrentPlannerItem(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting planner item:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    // Boards
    boards,
    currentBoard,
    loadBoards,
    getBoard,
    createBoard,
    updateBoard,
    deleteBoard,
    
    // Board Items
    boardItems,
    currentBoardItem,
    loadBoardItems,
    getBoardItem,
    createBoardItem,
    updateBoardItem,
    deleteBoardItem,
    
    // Resources
    resources,
    currentResource,
    loadResources,
    getResource,
    createResource,
    updateResource,
    deleteResource,
    
    // Lessons
    lessons,
    currentLesson,
    loadLessons,
    getLesson,
    createLesson,
    updateLesson,
    deleteLesson,
    
    // Planners
    planners,
    currentPlanner,
    loadPlanners,
    getPlanner,
    createPlanner,
    updatePlanner,
    deletePlanner,
    
    // Planner Items
    plannerItems,
    currentPlannerItem,
    loadPlannerItems,
    getPlannerItem,
    createPlannerItem,
    updatePlannerItem,
    deletePlannerItem,
    
    // Loading states
    loading,
    error,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
