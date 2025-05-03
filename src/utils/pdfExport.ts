// File: /utils/pdfExport.ts

import jsPDF from 'jspdf';

interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  is_deleted: boolean;
}

// Format date for PDF display
const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Export a single note to PDF
export const exportNoteToPdf = (note: Note) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;
  
  // Add header
  pdf.setTextColor(0, 76, 153); // Blue color approximating the gradient
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text("Goggins NoteBook", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;
  
  // Reset text color
  pdf.setTextColor(0, 0, 0);
  
  // Add title
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text(note.title, 20, yPosition);
  yPosition += 10;
  
  // Add date
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "italic");
  pdf.text(`Created: ${formatDate(note.createdAt)}`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Last Updated: ${formatDate(note.updatedAt)}`, 20, yPosition);
  yPosition += 10;
  
  // Add content
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  
  // Split text into lines that fit within page width
  const splitContent = pdf.splitTextToSize(note.content, pageWidth - 40);
  
  // Write content page by page
  writeContentWithPageBreaks(pdf, splitContent, 20, yPosition);
  
  // Save PDF
  pdf.save(`${note.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
};

// Export multiple notes to a single PDF
export const exportNotesToPdf = (notes: Note[]) => {
  if (!notes || notes.length === 0) return;
  
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;
  
  // Add header
  pdf.setTextColor(0, 76, 153); // Blue color approximating the gradient
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text("Goggins NoteBook", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;
  
  // Reset text color
  pdf.setTextColor(0, 0, 0);
  
  // Add title
  pdf.setFontSize(22);
  pdf.setFont("helvetica", "bold");
  pdf.text("My Notes Collection", 20, yPosition);
  yPosition += 15;
  
  // Add date
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "italic");
  pdf.text(`Exported on: ${formatDate(new Date().toISOString())}`, 20, yPosition);
  yPosition += 15;
  
  // Process each note
  notes.forEach((note, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = 20;
    }
    
    // Add separator if not the first note
    if (index > 0) {
      pdf.setDrawColor(200);
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 10;
    }
    
    // Add note title
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text(note.title, 20, yPosition);
    yPosition += 10;
    
    // Add date
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "italic");
    pdf.text(`Created: ${formatDate(note.createdAt)}`, 20, yPosition);
    yPosition += 5;
    pdf.text(`Last Updated: ${formatDate(note.updatedAt)}`, 20, yPosition);
    yPosition += 8;
    
    // Add content
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    
    // Split text into lines that fit within page width
    const splitContent = pdf.splitTextToSize(note.content, pageWidth - 40);
    
    // Write content with proper page breaks
    yPosition = writeContentWithPageBreaks(pdf, splitContent, 20, yPosition);
    
    // Add some spacing after the note
    yPosition += 15;
  });
  
  // Save PDF
  pdf.save("my_notes_collection.pdf");
};

// Helper function to write content with proper page breaks
const writeContentWithPageBreaks = (
  pdf: jsPDF, 
  contentLines: string[], 
  x: number, 
  startY: number
): number => {
  const pageHeight = pdf.internal.pageSize.getHeight();
  const lineHeight = 5; // Approximate height of a line
  const marginBottom = 20; // Bottom margin
  
  let currentY = startY;
  let linesWritten = 0;
  
  while (linesWritten < contentLines.length) {
    // Calculate remaining space on current page
    const remainingHeight = pageHeight - currentY - marginBottom;
    const linesPerPage = Math.floor(remainingHeight / lineHeight);
    
    // If no space left, add new page
    if (linesPerPage <= 0) {
      pdf.addPage();
      currentY = 20; // Reset Y position on new page
      continue;
    }
    
    // Calculate how many lines to write on this page
    const linesToWrite = Math.min(linesPerPage, contentLines.length - linesWritten);
    
    // Get the lines for current page
    const currentPageLines = contentLines.slice(linesWritten, linesWritten + linesToWrite);
    
    // Write the lines
    pdf.text(currentPageLines, x, currentY);
    
    // Update counters
    linesWritten += linesToWrite;
    
    // If there are more lines to write, add a new page
    if (linesWritten < contentLines.length) {
      pdf.addPage();
      currentY = 20; // Reset Y position on new page
    } else {
      // Update current Y position if we're staying on the same page
      currentY += linesToWrite * lineHeight;
    }
  }
  
  return currentY;
};

// Export all notes from the API
export const fetchAndExportAllNotes = async () => {
  try {
    const response = await fetch("/api/auth/export-pdf", {
      method: "GET",
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch notes for export");
    }
    
    const data = await response.json();
    exportNotesToPdf(data.notes);
    return true;
  } catch (error) {
    console.error("Error exporting notes to PDF:", error);
    return false;
  }
};

// Export a single note from the API
export const fetchAndExportSingleNote = async (noteId: string) => {
  try {
    const response = await fetch(`/api/auth/export-pdf?noteId=${noteId}`, {
      method: "GET",
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch note for export");
    }
    
    const data = await response.json();
    if (data.notes && data.notes.length > 0) {
      exportNoteToPdf(data.notes[0]);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error exporting note to PDF:", error);
    return false;
  }
};