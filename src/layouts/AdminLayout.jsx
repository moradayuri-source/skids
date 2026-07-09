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
      
      <div className="flex pt-16">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          role="admin"
        />
        
        <main className="flex-1 p-6 lg:p-8 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
