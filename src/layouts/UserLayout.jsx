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
    <div className="min-h-screen bg-[#f4f8fc]">
      <Navbar 
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        title="SKIDS"
        userRole="Youth Member"
        userName="Juan Dela Cruz"
        role="user"
      />
      
      <div className="pt-16">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          role="user"
        />
        
        <main className="min-h-[calc(100vh-4rem)] px-4 py-5 sm:px-6 lg:ml-64 lg:px-8 lg:py-7">
          <div className="mx-auto w-full max-w-[1500px]"><Outlet /></div>
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
