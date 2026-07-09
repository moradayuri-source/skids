import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

const UserLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        title="SKIDS"
        userRole="Youth Member"
        userName="Juan Dela Cruz"
        role="user"
      />
      
      <div className="flex pt-16">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          role="user"
        />
        
        <main className="flex-1 p-6 lg:p-8 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
