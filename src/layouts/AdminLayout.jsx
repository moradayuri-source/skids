import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        title="SKIDS Admin"
        userRole="Admin"
        userName="SK Chairwoman"
        role="admin"
      />
      
      <div className="pt-16">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          role="admin"
        />
        
        <main className="min-h-[calc(100vh-4rem)] p-6 lg:ml-64 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
