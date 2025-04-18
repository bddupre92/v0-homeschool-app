'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useData } from '@/lib/data-context';
import { useEffect } from 'react';

export default function Dashboard() {
  const { data: session } = useSession();
  const { 
    boards, 
    loadBoards, 
    resources, 
    loadResources,
    planners,
    loadPlanners,
    lessons,
    loadLessons,
    loading,
    error
  } = useData();

  useEffect(() => {
    loadBoards();
    loadResources();
    loadPlanners();
    loadLessons();
  }, [loadBoards, loadResources, loadPlanners, loadLessons]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome, {session?.user?.name || 'User'}</h1>
      
      {loading && <p className="text-gray-500">Loading your data...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Boards</h2>
          {boards.length > 0 ? (
            <ul className="space-y-2">
              {boards.slice(0, 5).map((board) => (
                <li key={board.id} className="border-b pb-2">
                  <Link href={`/boards/${board.id}`} className="text-blue-600 hover:underline">
                    {board.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No boards yet</p>
          )}
          <div className="mt-4">
            <Link href="/boards">
              <Button variant="outline" className="w-full">View All Boards</Button>
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Resources</h2>
          {resources.length > 0 ? (
            <ul className="space-y-2">
              {resources.slice(0, 5).map((resource) => (
                <li key={resource.id} className="border-b pb-2">
                  <Link href={`/resources/${resource.id}`} className="text-blue-600 hover:underline">
                    {resource.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No resources yet</p>
          )}
          <div className="mt-4">
            <Link href="/resources">
              <Button variant="outline" className="w-full">View All Resources</Button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Planners</h2>
          {planners.length > 0 ? (
            <ul className="space-y-2">
              {planners.slice(0, 5).map((planner) => (
                <li key={planner.id} className="border-b pb-2">
                  <Link href={`/planners/${planner.id}`} className="text-blue-600 hover:underline">
                    {planner.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No planners yet</p>
          )}
          <div className="mt-4">
            <Link href="/planners">
              <Button variant="outline" className="w-full">View All Planners</Button>
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Lessons</h2>
          {lessons.length > 0 ? (
            <ul className="space-y-2">
              {lessons.slice(0, 5).map((lesson) => (
                <li key={lesson.id} className="border-b pb-2">
                  <Link href={`/lessons/${lesson.id}`} className="text-blue-600 hover:underline">
                    {lesson.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No lessons yet</p>
          )}
          <div className="mt-4">
            <Link href="/lessons">
              <Button variant="outline" className="w-full">View All Lessons</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
