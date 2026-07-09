// Mock data for SKIDS system
// All data is stored locally for frontend development
// Future API calls will replace these with backend data

export const mockYouthProfiles = [
  {
    id: 1,
    name: 'Juan Dela Cruz',
    age: 18,
    barangay: 'Masagui',
    contact: '09123456789',
    email: 'juan.delacruz@email.com',
    gender: 'Male',
    civilStatus: 'Single',
    voterStatus: 'Registered',
    workStatus: 'Student'
  },
  {
    id: 2,
    name: 'Maria Santos',
    age: 20,
    barangay: 'Masagui',
    contact: '09123456790',
    email: 'maria.santos@email.com',
    gender: 'Female',
    civilStatus: 'Single',
    voterStatus: 'Registered',
    workStatus: 'Student'
  },
  {
    id: 3,
    name: 'Pedro Reyes',
    age: 22,
    barangay: 'Masagui',
    contact: '09123456791',
    email: 'pedro.reyes@email.com',
    gender: 'Male',
    civilStatus: 'Single',
    voterStatus: 'Registered',
    workStatus: 'Employed'
  },
  {
    id: 4,
    name: 'Ana Martinez',
    age: 19,
    barangay: 'Masagui',
    contact: '09123456792',
    email: 'ana.martinez@email.com',
    gender: 'Female',
    civilStatus: 'Single',
    voterStatus: 'Registered',
    workStatus: 'Student'
  }
];

export const mockAnnouncements = [
  {
    id: 1,
    title: 'SK Budget Hearing 2024',
    content: 'The Sangguniang Kabataan will be conducting a budget hearing for the fiscal year 2024. All youth members are encouraged to attend.',
    date: '2024-01-15',
    priority: 'High',
    author: 'SK Chairwoman'
  },
  {
    id: 2,
    title: 'Youth Leadership Summit',
    content: 'Join us for the annual Youth Leadership Summit on February 10-12, 2024. Registration is now open!',
    date: '2024-01-10',
    priority: 'Medium',
    author: 'SK Secretary'
  },
  {
    id: 3,
    title: 'Barangay Clean-up Drive',
    content: 'The SK will be organizing a community clean-up drive this Saturday. Please bring your own cleaning materials.',
    date: '2024-01-08',
    priority: 'Low',
    author: 'SK Councilor'
  }
];

export const mockEvents = [
  {
    id: 1,
    title: 'SK Regular Session',
    date: '2024-01-20',
    time: '09:00 AM',
    location: 'Barangay Hall',
    description: 'Monthly regular session of the SK Council to discuss youth programs and projects.'
  },
  {
    id: 2,
    title: 'Youth Sports Fest',
    date: '2024-01-25',
    time: '07:00 AM',
    location: 'Barangay Covered Court',
    description: 'Inter-barangay sports competition for the youth. Registration is ongoing.'
  },
  {
    id: 3,
    title: 'SK Budget Hearing',
    date: '2024-01-30',
    time: '02:00 PM',
    location: 'Barangay Hall',
    description: 'Public hearing for the SK Annual Budget 2024.'
  }
];

export const mockBudgetReports = [
  {
    id: 1,
    title: 'Q1 2024 Budget Report',
    amount: '₱150,000.00',
    date: '2024-01-31',
    status: 'Approved',
    category: 'Operations'
  },
  {
    id: 2,
    title: 'Youth Programs Fund',
    amount: '₱75,000.00',
    date: '2024-01-15',
    status: 'Pending',
    category: 'Programs'
  },
  {
    id: 3,
    title: 'Infrastructure Projects',
    amount: '₱200,000.00',
    date: '2023-12-20',
    status: 'Approved',
    category: 'Infrastructure'
  }
];

export const mockDocuments = [
  {
    id: 1,
    title: 'SK Resolution No. 2024-001',
    type: 'Resolution',
    date: '2024-01-15',
    fileSize: '2.5 MB',
    status: 'Approved'
  },
  {
    id: 2,
    title: 'Annual Budget Report 2023',
    type: 'Report',
    date: '2023-12-30',
    fileSize: '4.2 MB',
    status: 'Filed'
  },
  {
    id: 3,
    title: 'Youth Programs Action Plan',
    type: 'Plan',
    date: '2024-01-05',
    fileSize: '1.8 MB',
    status: 'Draft'
  }
];

export const mockMessages = [
  {
    id: 1,
    sender: 'Juan Dela Cruz',
    subject: 'Suggestion for Youth Programs',
    message: 'I would like to suggest more sports activities for the youth in our barangay.',
    date: '2024-01-14',
    status: 'unread'
  },
  {
    id: 2,
    sender: 'Maria Santos',
    subject: 'Inquiry about Scholarship',
    message: 'Good day! Are there any scholarships available for SK members? I would like to apply.',
    date: '2024-01-12',
    status: 'read'
  },
  {
    id: 3,
    sender: 'Pedro Reyes',
    subject: 'Concern about Budget',
    message: 'I would like to know how the SK budget is being utilized for youth programs.',
    date: '2024-01-10',
    status: 'read'
  }
];

export const mockActivityLog = [
  {
    id: 1,
    user: 'SK Chairwoman',
    action: 'Posted announcement',
    details: 'SK Budget Hearing 2024',
    date: '2024-01-15 10:30 AM'
  },
  {
    id: 2,
    user: 'SK Secretary',
    action: 'Updated youth profile',
    details: 'Updated information for Juan Dela Cruz',
    date: '2024-01-15 09:15 AM'
  },
  {
    id: 3,
    user: 'SK Treasurer',
    action: 'Uploaded document',
    details: 'Q1 2024 Budget Report',
    date: '2024-01-14 04:45 PM'
  },
  {
    id: 4,
    user: 'SK Councilor',
    action: 'Created event',
    details: 'Youth Sports Fest',
    date: '2024-01-14 02:30 PM'
  },
  {
    id: 5,
    user: 'SK Chairwoman',
    action: 'Responded to message',
    details: 'Reply to Juan Dela Cruz',
    date: '2024-01-14 11:20 AM'
  }
];

// Dashboard statistics
export const getDashboardStats = () => ({
  totalYouth: 245,
  totalAnnouncements: 12,
  totalEvents: 8,
  totalMessages: 5,
  unreadMessages: 2,
  recentActivities: mockActivityLog.slice(0, 5)
});

// Helper functions (will be replaced with API calls)
export const getYouthProfiles = () => mockYouthProfiles;
export const getAnnouncements = () => mockAnnouncements;
export const getEvents = () => mockEvents;
export const getBudgetReports = () => mockBudgetReports;
export const getDocuments = () => mockDocuments;
export const getMessages = () => mockMessages;
export const getActivityLog = () => mockActivityLog;