import { jsPDF } from 'jspdf';

const NAVY = [4, 45, 86];
const BLUE = [25, 75, 125];
const LIGHT_BLUE = [235, 244, 252];
const GRAY = [90, 100, 112];
const PAGE_WIDTH = 215.9;
const PAGE_HEIGHT = 355.6;

const clean = (value, fallback = 'Not provided') => {
  const text = String(value ?? '').trim();
  return text || fallback;
};

const imageFormat = (dataUrl) => {
  if (dataUrl?.startsWith('data:image/png')) return 'PNG';
  if (dataUrl?.startsWith('data:image/webp')) return 'WEBP';
  return 'JPEG';
};

const loadImageData = async (url) => {
  if (!url) return '';
  const response = await fetch(url);
  if (!response.ok) throw new Error('Unable to load PDF image');
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const drawSectionBar = (doc, title, x, y, width) => {
  doc.setFillColor(...NAVY);
  doc.rect(x, y, width, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(title.toUpperCase(), x + width / 2, y + 6, { align: 'center' });
};

const drawValueRow = (doc, label, value, x, y, width, height = 10) => {
  const labelWidth = 36;
  doc.setDrawColor(210, 216, 224);
  doc.setLineWidth(0.25);
  doc.rect(x, y, width, height);
  doc.line(x + labelWidth, y, x + labelWidth, y + height);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...NAVY);
  doc.text(label, x + 4, y + height / 2 + 1);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(35, 40, 48);
  const wrapped = doc.splitTextToSize(clean(value), width - labelWidth - 7);
  doc.text(wrapped.slice(0, 2), x + labelWidth + 4, y + height / 2 - (wrapped.length > 1 ? 1.4 : -1));
};

const drawDetailCell = (doc, label, value, x, y, width, height = 13) => {
  doc.setDrawColor(214, 220, 228);
  doc.setFillColor(249, 251, 253);
  doc.roundedRect(x, y, width, height, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...GRAY);
  doc.text(String(label).toUpperCase(), x + 3, y + 4.3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(35, 40, 48);
  const wrapped = doc.splitTextToSize(clean(value), width - 6);
  doc.text(wrapped.slice(0, 2), x + 3, y + 9);
};

const drawDetailsPage = (doc, profile, assets) => {
  doc.addPage([PAGE_WIDTH, PAGE_HEIGHT], 'portrait');
  const margin = 7;
  const contentX = 10;
  const contentWidth = PAGE_WIDTH - 20;
  const gap = 4;
  const halfWidth = (contentWidth - gap) / 2;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.7);
  doc.rect(margin, margin, PAGE_WIDTH - margin * 2, PAGE_HEIGHT - margin * 2);
  doc.setLineWidth(0.2);
  doc.rect(margin + 1.8, margin + 1.8, PAGE_WIDTH - (margin + 1.8) * 2, PAGE_HEIGHT - (margin + 1.8) * 2);

  if (assets.logoData) {
    doc.addImage(assets.logoData, imageFormat(assets.logoData), 13, 12, 20, 20, undefined, 'FAST');
  }
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY);
  doc.setFontSize(15);
  doc.text('YOUTH PROFILE DETAILS', PAGE_WIDTH / 2, 20, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.setFontSize(7.5);
  doc.text('Supplementary information provided through the authenticated SKIDS profile', PAGE_WIDTH / 2, 27, { align: 'center' });
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.6);
  doc.line(contentX, 36, contentX + contentWidth, 36);

  let y = 43;
  const drawPairSection = (title, rows) => {
    drawSectionBar(doc, title, contentX, y, contentWidth);
    y += 12;
    rows.forEach(([left, right]) => {
      drawDetailCell(doc, left[0], left[1], contentX, y, halfWidth);
      drawDetailCell(doc, right[0], right[1], contentX + halfWidth + gap, y, halfWidth);
      y += 15;
    });
    y += 4;
  };

  drawPairSection('Personal Information', [
    [['First Name', profile.firstName], ['Last Name', profile.lastName]],
    [['Middle Name', profile.middleName], ['Suffix', profile.suffix]],
    [['Age', profile.age], ['Sex', profile.gender]],
  ]);

  drawPairSection('Contact Details', [
    [['Email Address', profile.email], ['Contact Number', profile.contact]],
  ]);

  drawPairSection('Location Information', [
    [['Region', profile.region], ['Province', profile.province]],
    [['Municipality', profile.municipality], ['Barangay', profile.barangay]],
    [['Purok / Zone', profile.purokZone], ['Complete Address', profile.address]],
  ]);

  drawPairSection('Demographic Information', [
    [['Civil Status', profile.civilStatus], ['Work Status', profile.workStatus]],
    [['Youth Age Group', profile.youthAgeGroup], ['Educational Background', profile.educationalBackground]],
  ]);
  drawDetailCell(
    doc,
    'Youth Classification',
    Array.isArray(profile.youthClassifications) && profile.youthClassifications.length
      ? profile.youthClassifications.join(', ')
      : '',
    contentX,
    y,
    contentWidth,
    18
  );
  y += 24;

  drawPairSection('Voter and Assembly Information', [
    [['Registered SK Voter', profile.registeredSkVoter], ['Voted Last SK Election', profile.votedLastSkElection]],
    [['Registered National Voter', profile.registeredNationalVoter], ['Attended SK Assembly', profile.attendedSkAssembly]],
    [['Assembly Attendance', profile.assemblyAttendance], ['Existing Voter Status', profile.voterStatus]],
  ]);

  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.5);
  doc.line(contentX, 328, contentX + contentWidth, 328);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(...BLUE);
  doc.text(`Profile details for ${clean(profile.name, 'SKIDS Youth Member')}`, PAGE_WIDTH / 2, 335, { align: 'center' });
  doc.text('Page 2 of 2', PAGE_WIDTH / 2, 341, { align: 'center' });
};

export const createYouthProfilePDF = (profile, assets = {}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [PAGE_WIDTH, PAGE_HEIGHT],
    compress: true,
  });
  const margin = 7;
  const contentX = 10;
  const contentWidth = PAGE_WIDTH - 20;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.7);
  doc.rect(margin, margin, PAGE_WIDTH - margin * 2, PAGE_HEIGHT - margin * 2);
  doc.setLineWidth(0.2);
  doc.rect(margin + 1.8, margin + 1.8, PAGE_WIDTH - (margin + 1.8) * 2, PAGE_HEIGHT - (margin + 1.8) * 2);

  if (assets.logoData) {
    doc.addImage(assets.logoData, imageFormat(assets.logoData), 13, 12, 28, 28, undefined, 'FAST');
  }

  doc.setTextColor(...BLUE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('SANGGUNIANG KABATAAN', 103, 17, { align: 'center' });
  doc.setTextColor(...NAVY);
  doc.setFontSize(19);
  doc.text('PROFILE INFORMATION FORM', 103, 27, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text('Sangguniang Kabataan Information Dissemination System', 103, 34, { align: 'center' });

  doc.setDrawColor(185, 194, 205);
  doc.rect(172, 11, 34, 26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...NAVY);
  doc.text('DATE:', 176, 17);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(45, 50, 58);
  doc.text(new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  }), 176, 24, { maxWidth: 27 });

  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.8);
  doc.line(contentX, 43, contentX + contentWidth, 43);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(65, 70, 80);
  doc.text(
    'This form contains the registered personal and contact information of the SKIDS youth member.',
    PAGE_WIDTH / 2,
    49,
    { align: 'center' }
  );

  const leftX = contentX;
  const leftWidth = 78;
  const rightX = 91;
  const rightWidth = contentX + contentWidth - rightX;
  const panelY = 55;
  drawSectionBar(doc, 'Youth Member Profile', leftX, panelY, leftWidth);
  drawSectionBar(doc, 'Personal Information', rightX, panelY, rightWidth);
  doc.setDrawColor(210, 216, 224);
  doc.rect(leftX, panelY + 9, leftWidth, 98);

  const portrait = assets.avatarData || assets.logoData;
  if (portrait) {
    doc.setFillColor(...LIGHT_BLUE);
    doc.roundedRect(leftX + 20, panelY + 17, 38, 38, 3, 3, 'F');
    doc.addImage(portrait, imageFormat(portrait), leftX + 22, panelY + 19, 34, 34, undefined, 'FAST');
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 35, 42);
  const memberName = doc.splitTextToSize(clean(profile.name, 'Youth Member'), leftWidth - 12);
  doc.text(memberName.slice(0, 2), leftX + leftWidth / 2, panelY + 66, { align: 'center' });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...BLUE);
  doc.text('Registered Youth Member', leftX + leftWidth / 2, panelY + 77, { align: 'center' });
  doc.setDrawColor(220, 224, 230);
  doc.line(leftX + 9, panelY + 83, leftX + leftWidth - 9, panelY + 83);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.setFontSize(7.5);
  doc.text(`Barangay ${clean(profile.barangay, 'Masagui')}`, leftX + leftWidth / 2, panelY + 91, { align: 'center' });

  [
    ['Full Name', profile.name],
    ['Age', profile.age],
    ['Gender', profile.gender],
    ['Barangay', profile.barangay],
    ['Email', profile.email],
    ['Contact Number', profile.contact],
    ['Civil Status', profile.civilStatus],
    ['Voter Status', profile.voterStatus],
    ['Work Status', profile.workStatus],
  ].forEach(([label, value], index) => {
    drawValueRow(doc, label, value, rightX, panelY + 9 + index * 10.9, rightWidth, 10.9);
  });

  const addressY = 164;
  drawSectionBar(doc, 'Address Information', contentX, addressY, contentWidth);
  doc.setDrawColor(210, 216, 224);
  doc.rect(contentX, addressY + 9, contentWidth, 28);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.text('Address', contentX + 6, addressY + 22);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(45, 50, 58);
  const addressLines = doc.splitTextToSize(
    clean(profile.address, `Barangay ${clean(profile.barangay, 'Masagui')}`),
    contentWidth - 50
  );
  doc.text(addressLines.slice(0, 2), contentX + 38, addressY + 18);
  doc.setDrawColor(140, 150, 162);
  doc.line(contentX + 38, addressY + 25, contentX + contentWidth - 7, addressY + 25);

  const certificationY = 206;
  drawSectionBar(doc, 'Certification', contentX, certificationY, contentWidth);
  doc.setDrawColor(210, 216, 224);
  doc.rect(contentX, certificationY + 9, contentWidth, 48);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(45, 50, 58);
  doc.text(
    'I hereby certify that the information provided in this form is true, correct, and complete',
    PAGE_WIDTH / 2,
    certificationY + 21,
    { align: 'center' }
  );
  doc.text('to the best of my knowledge.', PAGE_WIDTH / 2, certificationY + 27, { align: 'center' });
  doc.setDrawColor(110, 120, 132);
  doc.line(contentX + 15, certificationY + 45, contentX + 78, certificationY + 45);
  doc.line(contentX + 118, certificationY + 45, contentX + 180, certificationY + 45);
  doc.setFontSize(7);
  doc.text('Signature over Printed Name', contentX + 46.5, certificationY + 51, { align: 'center' });
  doc.text('Date', contentX + 149, certificationY + 51, { align: 'center' });

  const officeY = 270;
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.6);
  doc.line(contentX, officeY, contentX + contentWidth, officeY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.text('FOR SK OFFICE USE ONLY', PAGE_WIDTH / 2, officeY + 7, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(45, 50, 58);
  [
    ['Received By:', contentX + 5, officeY + 18, contentX + 82],
    ['Date Received:', contentX + 105, officeY + 18, contentX + 188],
    ['Verified By:', contentX + 5, officeY + 30, contentX + 82],
    ['Date Verified:', contentX + 105, officeY + 30, contentX + 188],
    ['Remarks:', contentX + 5, officeY + 42, contentX + 188],
  ].forEach(([label, x, y, lineEnd]) => {
    doc.text(label, x, y);
    doc.setDrawColor(180, 187, 198);
    doc.line(x + 24, y + 1, lineEnd, y + 1);
  });

  doc.setDrawColor(...NAVY);
  doc.line(contentX, 325, contentX + contentWidth, 325);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(...BLUE);
  doc.text('SKIDS - Sangguniang Kabataan Information Dissemination System', PAGE_WIDTH / 2, 332, { align: 'center' });
  doc.text('"Serving the Youth, Building the Future."', PAGE_WIDTH / 2, 338, { align: 'center' });

  drawDetailsPage(doc, profile, assets);

  return doc;
};

export const generateYouthProfilePDF = async (profile) => {
  const [logoData, avatarData] = await Promise.all([
    loadImageData('/sk.jpg').catch(() => ''),
    loadImageData(profile.avatar).catch(() => ''),
  ]);
  const doc = createYouthProfilePDF(profile, { logoData, avatarData });
  const safeName = clean(profile.name, 'Youth_Member').replace(/[^a-zA-Z0-9_-]+/g, '_');
  doc.save(`SKIDS_Profile_${safeName}.pdf`);
};
