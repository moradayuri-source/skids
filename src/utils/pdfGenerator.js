import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateYouthProfilePDF = (profile) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Header with Logo
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 82, 130);
  doc.text('SKIDS', pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Sangguniang Kabataan Information Dissemination System', pageWidth / 2, yPos, { align: 'center' });
  yPos += 12;

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Youth Personal Information Profile', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 12;

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // I. PROFILE
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 82, 130);
  doc.text('I. PROFILE', margin, yPos);
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  const profileData = [
    ['Respondent No:', profile.respondentNo || 'N/A'],
    ['Date:', profile.date || 'N/A'],
    ['Last Name:', profile.lastName || 'N/A'],
    ['First Name:', profile.firstName || 'N/A'],
    ['Middle Name:', profile.middleName || 'N/A'],
    ['Suffix:', profile.suffix || 'N/A'],
    ['Age:', profile.age || 'N/A'],
    ['Sex:', profile.sex || 'N/A'],
    ['Birthday:', profile.birthday || 'N/A'],
    ['Email:', profile.email || 'N/A'],
    ['Contact No.:', profile.contactNo || 'N/A'],
  ];

  profileData.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), margin + 50, yPos);
    yPos += 7;
  });

  yPos += 5;

  // Location
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 82, 130);
  doc.text('Location', margin, yPos);
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  const locationData = [
    ['Region:', profile.region || 'N/A'],
    ['Province:', profile.province || 'N/A'],
    ['Municipality:', profile.municipality || 'N/A'],
    ['Barangay:', profile.barangay || 'N/A'],
    ['Purok/Zone:', profile.purokZone || 'N/A'],
  ];

  locationData.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), margin + 50, yPos);
    yPos += 7;
  });

  yPos += 5;

  // II. DEMOGRAPHIC CHARACTERISTICS
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 82, 130);
  doc.text('II. DEMOGRAPHIC CHARACTERISTICS', margin, yPos);
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  const demographicData = [
    ['Civil Status:', profile.civilStatus || 'N/A'],
    ['Youth Classification:', profile.youthClassification?.join(', ') || 'N/A'],
    ['Work Status:', profile.workStatus || 'N/A'],
    ['Youth Age Group:', profile.youthAgeGroup || 'N/A'],
    ['Educational Background:', profile.educationalBackground || 'N/A'],
  ];

  demographicData.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), margin + 60, yPos);
    yPos += 7;
  });

  yPos += 5;

  // III. VOTER INFORMATION
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 82, 130);
  doc.text('III. VOTER INFORMATION', margin, yPos);
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  const voterData = [
    ['Registered SK Voter:', profile.isSKVoter || 'N/A'],
    ['Voted last SK election:', profile.votedLastSK || 'N/A'],
    ['Registered National Voter:', profile.isNationalVoter || 'N/A'],
    ['Times Voted:', profile.timesVoted || 'N/A'],
    ['Attended KK Assembly:', profile.attendedKKAssembly || 'N/A'],
    ['If No, Why:', profile.whyNotAttend || 'N/A'],
  ];

  voterData.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), margin + 60, yPos);
    yPos += 7;
  });

  yPos += 10;

  // Footer
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150, 150, 150);
  doc.text('This document is generated from SKIDS Youth Profile System.', pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  doc.text(`© ${new Date().getFullYear()} SKIDS - Sangguniang Kabataan Information Dissemination System`, pageWidth / 2, yPos, { align: 'center' });

  // Save PDF
  doc.save(`Youth_Profile_${profile.firstName || 'User'}_${profile.lastName || 'Profile'}.pdf`);
};
