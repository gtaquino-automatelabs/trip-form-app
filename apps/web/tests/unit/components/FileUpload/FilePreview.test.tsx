import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilePreview } from '@/components/form/FilePreview';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />
}));

describe('FilePreview', () => {
  const defaultProps = {
    fileName: 'test-document.pdf',
    fileUrl: 'http://example.com/test-document.pdf',
    fileSize: 1024 * 1024, // 1MB
    fileType: 'application/pdf'
  };

  it('renders file information correctly', () => {
    render(<FilePreview {...defaultProps} />);
    
    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    expect(screen.getByText(/PDF.*1 MB/)).toBeInTheDocument();
  });

  it('displays image preview for image files', () => {
    const imageProps = {
      ...defaultProps,
      fileName: 'test-image.jpg',
      fileUrl: 'http://example.com/test-image.jpg',
      fileType: 'image/jpeg'
    };
    
    render(<FilePreview {...imageProps} />);
    
    const image = screen.getByAltText('test-image.jpg');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'http://example.com/test-image.jpg');
  });

  it('displays PDF icon for PDF files', () => {
    render(<FilePreview {...defaultProps} />);
    
    // Check for PDF icon (FilePdf component renders with specific classes)
    const icon = document.querySelector('.text-red-500');
    expect(icon).toBeInTheDocument();
  });

  it('displays Word icon for Word documents', () => {
    const wordProps = {
      ...defaultProps,
      fileName: 'document.docx',
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    
    render(<FilePreview {...wordProps} />);
    
    // Check for Word icon (FileDoc component renders with specific classes)
    const icon = document.querySelector('.text-blue-600');
    expect(icon).toBeInTheDocument();
  });

  it('formats file size correctly', () => {
    const testCases = [
      { size: 500, expected: '500 Bytes' },
      { size: 1024, expected: '1 KB' },
      { size: 1024 * 1024, expected: '1 MB' },
      { size: 1.5 * 1024 * 1024, expected: '1.5 MB' }
    ];

    testCases.forEach(({ size, expected }) => {
      const { rerender } = render(
        <FilePreview {...defaultProps} fileSize={size} />
      );
      
      expect(screen.getByText(new RegExp(expected))).toBeInTheDocument();
      rerender(<div />); // Clean up for next iteration
    });
  });

  it('calls onRemove when remove button is clicked', () => {
    const onRemove = vi.fn();
    render(<FilePreview {...defaultProps} onRemove={onRemove} />);
    
    const removeButton = screen.getByRole('button');
    fireEvent.click(removeButton);
    
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('does not show remove button when onRemove is not provided', () => {
    render(<FilePreview {...defaultProps} />);
    
    const buttons = screen.queryAllByRole('button');
    // Should only have view/download buttons, not remove
    expect(buttons.length).toBeLessThan(3);
  });

  it('shows view button for images', () => {
    const imageProps = {
      ...defaultProps,
      fileName: 'test-image.jpg',
      fileUrl: 'http://example.com/test-image.jpg',
      fileType: 'image/jpeg'
    };
    
    render(<FilePreview {...imageProps} />);
    
    const viewButton = screen.getByText('Visualizar');
    expect(viewButton).toBeInTheDocument();
  });

  it('opens full preview modal when view button is clicked', () => {
    const imageProps = {
      ...defaultProps,
      fileName: 'test-image.jpg',
      fileUrl: 'http://example.com/test-image.jpg',
      fileType: 'image/jpeg'
    };
    
    render(<FilePreview {...imageProps} />);
    
    const viewButton = screen.getByText('Visualizar');
    fireEvent.click(viewButton);
    
    // Check if modal is opened (full-size image is displayed)
    const fullImages = screen.getAllByAltText('test-image.jpg');
    // Should have 2 images: thumbnail and full preview
    expect(fullImages).toHaveLength(2);
    // The second one is the full preview with max-w-full class
    expect(fullImages[1]).toHaveClass('max-w-full');
  });

  it('closes preview modal when clicked outside', () => {
    const imageProps = {
      ...defaultProps,
      fileName: 'test-image.jpg',
      fileUrl: 'http://example.com/test-image.jpg',
      fileType: 'image/jpeg'
    };
    
    render(<FilePreview {...imageProps} />);
    
    // Open modal
    const viewButton = screen.getByText('Visualizar');
    fireEvent.click(viewButton);
    
    // Verify modal is open (2 images)
    expect(screen.getAllByAltText('test-image.jpg')).toHaveLength(2);
    
    // Click on backdrop
    const backdrop = document.querySelector('.fixed.inset-0');
    expect(backdrop).toBeInTheDocument();
    fireEvent.click(backdrop!);
    
    // Modal should be closed (only 1 image - the thumbnail)
    expect(screen.getAllByAltText('test-image.jpg')).toHaveLength(1);
  });

  it('shows download button with correct link', () => {
    render(<FilePreview {...defaultProps} />);
    
    const downloadLink = screen.getByText('Baixar').closest('a');
    expect(downloadLink).toHaveAttribute('href', 'http://example.com/test-document.pdf');
    expect(downloadLink).toHaveAttribute('download', 'test-document.pdf');
  });

  it('hides actions when showActions is false', () => {
    render(<FilePreview {...defaultProps} showActions={false} />);
    
    expect(screen.queryByText('Visualizar')).not.toBeInTheDocument();
    expect(screen.queryByText('Baixar')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <FilePreview {...defaultProps} className="custom-class" />
    );
    
    const preview = container.firstChild;
    expect(preview).toHaveClass('custom-class');
  });

  it('gets correct file extension', () => {
    const testCases = [
      { fileName: 'document.pdf', expected: 'PDF' },
      { fileName: 'image.jpg', expected: 'JPG' },
      { fileName: 'file.docx', expected: 'DOCX' },
      { fileName: 'noextension', expected: 'FILE' }
    ];

    testCases.forEach(({ fileName, expected }) => {
      const { rerender } = render(
        <FilePreview {...defaultProps} fileName={fileName} />
      );
      
      expect(screen.getByText(new RegExp(expected))).toBeInTheDocument();
      rerender(<div />); // Clean up for next iteration
    });
  });
});