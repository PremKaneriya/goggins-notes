import jsPDF from 'jspdf';

interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  is_deleted: boolean;
}

interface UserInfo {
  name: string;
  avatar?: string; // URL to the profile image
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

// Export a single note to PDF
export const exportNoteToPdf = async (note: Note, userInfo?: UserInfo) => {
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

  // Add note title with border
  pdf.setFontSize(20);
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
  yPosition += 10;

  // Add content with padding
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const splitContent = pdf.splitTextToSize(note.content, pageWidth - 50);
  yPosition = writeContentWithPageBreaks(pdf, splitContent, 25, yPosition, pageHeight, 5, 20);

  // Save PDF
  pdf.save(`${note.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
};

// Export multiple notes to a single PDF
export const exportNotesToPdf = async (notes: Note[], userInfo?: UserInfo) => {
  if (!notes || notes.length === 0) return;

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

  // Add Table of Contents
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Table of Contents', 20, yPosition);
  yPosition += 8;
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(0, 76, 153);
  pdf.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 8;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  notes.forEach((note, index) => {
    pdf.text(`${index + 1}. ${note.title}`, 25, yPosition);
    yPosition += 6;
  });

  // Add export date
  yPosition += 5;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  pdf.text(`Exported on: ${formatDate(new Date().toISOString())}`, 20, yPosition);
  yPosition += 15;

  // Add notes
  notes.forEach((note, index) => {
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
  pdf.save('my_notes_collection.pdf');
};

// Export all notes from the API
export const fetchAndExportAllNotes = async () => {
  try {
    // Get all notes and user information in one request
    const response = await fetch("/api/auth/export-pdf", {
      method: "GET",
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch notes for export");
    }
    
    const data = await response.json();
    
    if (!data.notes || data.notes.length === 0) {
      console.warn("No notes available for export");
      return false;
    }
    
    // Create user info object from the response
    const userInfo: UserInfo = {
      name: data.user?.name || '',
      avatar: data.user?.avatar || ''
    };
    
    await exportNotesToPdf(data.notes, userInfo);
    return true;
  } catch (error) {
    console.error("Error exporting notes to PDF:", error);
    return false;
  }
};

// Export a single note from the API
export const fetchAndExportSingleNote = async (noteId: string) => {
  try {
    if (!noteId) {
      throw new Error("Note ID is required");
    }
    
    // Get specific note and user information in one request
    const response = await fetch(`/api/auth/export-pdf?noteId=${noteId}`, {
      method: "GET",
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch note for export");
    }
    
    const data = await response.json();
    
    if (!data.notes || data.notes.length === 0) {
      console.warn("Note not found for export");
      return false;
    }
    
    // Create user info object from the response
    const userInfo: UserInfo = {
      name: data.user?.name || '',
      avatar: data.user?.avatar || ''
    };
    
    await exportNoteToPdf(data.notes[0], userInfo);
    return true;
  } catch (error) {
    console.error("Error exporting note to PDF:", error);
    return false;
  }
};