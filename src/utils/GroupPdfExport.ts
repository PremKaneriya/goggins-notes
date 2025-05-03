import jsPDF from 'jspdf';

interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  is_deleted: boolean;
}

interface GroupNote {
  _id: string;
  name: string;
  description: string;
  notes: string[]; // Array of note IDs
  noteObjects?: Note[]; // Populated note objects
  createdAt: string;
  updatedAt: string;
  is_deleted: boolean;
}

interface UserInfo {
  name: string;
  avatar?: string; // URL to the profile image
  email?: string;
  id?: string;
}

// Format date for PDF display
const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Add a base64 image to the PDF
const addProfileImage = async (pdf: jsPDF, imageUrl: string, x: number, y: number, width: number, height: number): Promise<void> => {
  if (!imageUrl) return;

  try {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imageData = canvas.toDataURL('image/jpeg');
            pdf.addImage(imageData, 'JPEG', x, y, width, height);
            resolve();
          } else {
            resolve();
          }
        } catch (error) {
          console.error('Error processing image:', error);
          resolve();
        }
      };

      img.onerror = () => {
        console.error('Failed to load image');
        resolve();
      };

      img.src = imageUrl;
    });
  } catch (error) {
    console.error('Error adding profile image:', error);
  }
};

// Helper function to write content with page breaks
const writeContentWithPageBreaks = (
  pdf: jsPDF,
  contentLines: string[],
  x: number,
  startY: number,
  pageHeight: number,
  lineHeight: number,
  marginBottom: number
): number => {
  let currentY = startY;
  let linesWritten = 0;

  while (linesWritten < contentLines.length) {
    const remainingHeight = pageHeight - currentY - marginBottom;
    const linesPerPage = Math.floor(remainingHeight / lineHeight);

    if (linesPerPage <= 0) {
      pdf.addPage();
      currentY = 20;
      continue;
    }

    const linesToWrite = Math.min(linesPerPage, contentLines.length - linesWritten);
    const currentPageLines = contentLines.slice(linesWritten, linesWritten + linesToWrite);
    pdf.text(currentPageLines, x, currentY);

    linesWritten += linesToWrite;

    if (linesWritten < contentLines.length) {
      pdf.addPage();
      currentY = 20;
    } else {
      currentY += linesToWrite * lineHeight;
    }
  }

  return currentY;
};

// Export a single group note to PDF
export const exportGroupNoteToPdf = async (groupNote: GroupNote, userInfo?: UserInfo) => {
  if (!groupNote || !groupNote.noteObjects || groupNote.noteObjects.length === 0) {
    console.warn("No notes available in this group for export");
    return false;
  }

  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 30;

  // Add header background
  pdf.setFillColor(0, 76, 153);
  pdf.rect(0, 0, pageWidth, 40, 'F');

  // Add profile image
  if (userInfo?.avatar) {
    await addProfileImage(pdf, userInfo.avatar, pageWidth - 35, 5, 20, 20);
  }

  // Add header text
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Goggins NoteBook', pageWidth / 2, 20, { align: 'center' });

  // Add username
  if (userInfo?.name) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'italic');
    pdf.text(`Prepared by: ${userInfo.name}`, pageWidth - 20, 30, { align: 'right' });
  }

  // Reset text color
  pdf.setTextColor(0, 0, 0);

  // Add group title with border
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text(groupNote.name, 20, yPosition);
  yPosition += 8;
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(0, 76, 153);
  pdf.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 8;

  // Add group description
  if (groupNote.description) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'italic');
    const descriptionLines = pdf.splitTextToSize(`Description: ${groupNote.description}`, pageWidth - 40);
    pdf.text(descriptionLines, 20, yPosition);
    yPosition += (descriptionLines.length * 6) + 5;
  }

  // Add dates
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  pdf.text(`Created: ${formatDate(groupNote.createdAt)}`, 20, yPosition);
  yPosition += 5;
  pdf.text(`Last Updated: ${formatDate(groupNote.updatedAt)}`, 20, yPosition);
  yPosition += 10;

  // Add Table of Contents
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Notes in this Group:', 20, yPosition);
  yPosition += 8;
  pdf.setLineWidth(0.3);
  pdf.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 8;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  // Add notes list/TOC
  groupNote.noteObjects.forEach((note, index) => {
    pdf.text(`${index + 1}. ${note.title}`, 25, yPosition);
    yPosition += 6;
  });

  // Add export date
  yPosition += 5;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  pdf.text(`Exported on: ${formatDate(new Date().toISOString())}`, 20, yPosition);
  yPosition += 15;

  // Add notes content
  groupNote.noteObjects.forEach((note, index) => {
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = 20;
    }

    if (index > 0) {
      pdf.setDrawColor(200);
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 10;
    }

    // Add note title with border
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(note.title, 20, yPosition);
    yPosition += 8;
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(0, 76, 153);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 8;

    // Add dates
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.text(`Created: ${formatDate(note.createdAt)}`, 20, yPosition);
    yPosition += 5;
    pdf.text(`Last Updated: ${formatDate(note.updatedAt)}`, 20, yPosition);
    yPosition += 8;

    // Add content
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const splitContent = pdf.splitTextToSize(note.content, pageWidth - 50);
    yPosition = writeContentWithPageBreaks(pdf, splitContent, 25, yPosition, pageHeight, 5, 20);

    yPosition += 15;
  });

  // Save PDF
  pdf.save(`${groupNote.name.replace(/[^a-zA-Z0-9]/g, '_')}_group.pdf`);
  return true;
};

// Fetch and export a single group note from the API
export const fetchAndExportGroupNote = async (groupId: string) => {
  try {
    if (!groupId) {
      throw new Error("Group ID is required");
    }
    
    // Get specific group note and user information
    const response = await fetch(`/api/group-pdf?groupId=${groupId}`, {
      method: "GET",
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch group note for export");
    }
    
    const data = await response.json();
    
    if (!data.groupNote || !data.groupNote.noteObjects || data.groupNote.noteObjects.length === 0) {
      console.warn("Group note not found or contains no notes");
      return false;
    }
    
    // Create user info object from the response
    const userInfo: UserInfo = {
      name: data.user?.name || '',
      avatar: data.user?.avatar || '',
      email: data.user?.email || '',
      id: data.user?.id || ''
    };
    
    await exportGroupNoteToPdf(data.groupNote, userInfo);
    return true;
  } catch (error) {
    console.error("Error exporting group note to PDF:", error);
    return false;
  }
};