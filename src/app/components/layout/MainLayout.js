// src/components/layout/MainLayout.jsx
import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Menu,
} from 'lucide-react';

const MainLayout = ({ children }) => {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Sidebar Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-2 top-2 z-50 md:hidden"
        onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Left Sidebar */}
      <div
        className={`w-80 border-r bg-background transition-all duration-300 ${
          leftSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:relative md:translate-x-0 h-full z-40`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="text-xl font-bold">Pattern Creator</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-4rem)] p-4">
          {/* Left sidebar content slots */}
          {children.leftSidebar}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto">
          {children.main}
        </main>
      </div>

      {/* Right Sidebar */}
      <div
        className={`w-80 border-l bg-background transition-all duration-300 ${
          rightSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } fixed right-0 md:relative md:translate-x-0 h-full z-40`}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute -left-10 top-2 md:hidden"
          onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
        >
          {rightSidebarOpen ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
        <div className="overflow-y-auto h-full p-4">
          {/* Right sidebar content slots */}
          {children.rightSidebar}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;