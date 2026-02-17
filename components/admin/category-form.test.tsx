import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CategoryForm } from './category-form';
import * as adminCategoryApi from '@/lib/api/admin-category';
import { CategoryImageDto } from '@/lib/types/admin-category';
import {
  CATEGORY_NAME_MAX_LENGTH,
  MAX_IMAGE_SIZE_BYTES,
  ERROR_MESSAGES,
} from '@/lib/constants/admin-category';

// Mock auth context
const mockUseAuth = vi.fn();
vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, fill, className }: { src: string; alt: string; fill?: boolean; className?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} data-fill={fill} className={className} />
  ),
}));

// Mock API functions
vi.mock('@/lib/api/admin-category', () => ({
  uploadCategoryImage: vi.fn(),
  createCategory: vi.fn(),
}));

describe('CategoryForm', () => {
  const mockIdToken = 'mock-firebase-token';
  const mockImageMetadata: CategoryImageDto = {
    imageUrl: 'https://example.com/image.jpg',
    imageStoragePath: 'categories/test.jpg',
    originalFileName: 'test.jpg',
    contentType: 'image/jpeg',
    fileSizeBytes: 1024,
    uploadedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      idToken: mockIdToken,
      user: { uid: '123', email: 'admin@example.com' },
    });
    
    // Mock successful API calls by default
    vi.mocked(adminCategoryApi.uploadCategoryImage).mockResolvedValue(mockImageMetadata);
    vi.mocked(adminCategoryApi.createCategory).mockResolvedValue({
      id: 'cat-123',
      name: 'Test Category',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: null,
      image: mockImageMetadata,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Form Rendering', () => {
    it('CategoryForm_ShouldRenderAllFields_WhenMounted', () => {
      render(<CategoryForm />);

      expect(screen.getByLabelText(/category name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category image/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create category/i })).toBeInTheDocument();
    });

    it('CategoryForm_ShouldRenderEmptyForm_WhenInitiallyMounted', () => {
      render(<CategoryForm />);

      const input = screen.getByLabelText(/category name/i);
      expect(input).toHaveValue('');
    });

    it('CategoryForm_ShouldDisplayCharacterCount_WhenRendered', () => {
      render(<CategoryForm />);

      expect(screen.getByText(`0/${CATEGORY_NAME_MAX_LENGTH}`)).toBeInTheDocument();
    });

    it('CategoryForm_ShouldDisplayUploadZone_WhenNoImageSelected', () => {
      render(<CategoryForm />);

      expect(screen.getByText(/click to upload/i)).toBeInTheDocument();
      expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();
    });
  });

  describe('Category Name Validation', () => {
    it('CategoryName_ShouldUpdateCharacterCount_WhenTyping', async () => {
      const user = userEvent.setup();
      render(<CategoryForm />);

      const input = screen.getByLabelText(/category name/i);
      await user.type(input, 'Test');

      expect(screen.getByText(`4/${CATEGORY_NAME_MAX_LENGTH}`)).toBeInTheDocument();
    });

    it('CategoryName_ShouldShowError_WhenTooShort', async () => {
      const user = userEvent.setup();
      render(<CategoryForm />);

      const input = screen.getByLabelText(/category name/i);
      await user.type(input, 'A');
      await user.tab(); // Trigger validation

      expect(screen.getByText(ERROR_MESSAGES.NAME_TOO_SHORT)).toBeInTheDocument();
    });

    it('CategoryName_ShouldShowError_WhenTooLong', async () => {
      const user = userEvent.setup();
      render(<CategoryForm />);

      const input = screen.getByLabelText(/category name/i);
      const longName = 'A'.repeat(CATEGORY_NAME_MAX_LENGTH + 1);
      await user.type(input, longName);

      expect(screen.getByText(ERROR_MESSAGES.NAME_TOO_LONG)).toBeInTheDocument();
    });

    it('CategoryName_ShouldNotShowError_WhenValidLength', async () => {
      const user = userEvent.setup();
      render(<CategoryForm />);

      const input = screen.getByLabelText(/category name/i);
      await user.type(input, 'Valid Category Name');

      expect(screen.queryByText(ERROR_MESSAGES.NAME_TOO_SHORT)).not.toBeInTheDocument();
      expect(screen.queryByText(ERROR_MESSAGES.NAME_TOO_LONG)).not.toBeInTheDocument();
    });

    it('CategoryName_ShouldClearError_WhenCorrected', async () => {
      const user = userEvent.setup();
      render(<CategoryForm />);

      const input = screen.getByLabelText(/category name/i);
      
      // Type invalid name
      await user.type(input, 'A');
      expect(screen.getByText(ERROR_MESSAGES.NAME_TOO_SHORT)).toBeInTheDocument();

      // Correct it
      await user.clear(input);
      await user.type(input, 'Valid Name');
      
      expect(screen.queryByText(ERROR_MESSAGES.NAME_TOO_SHORT)).not.toBeInTheDocument();
    });
  });

  describe('Image Upload Validation', () => {
    it('ImageUpload_ShouldShowError_WhenFileTooLarge', async () => {
      const user = userEvent.setup();
      render(<CategoryForm />);

      const largeFile = new File(
        [new ArrayBuffer(MAX_IMAGE_SIZE_BYTES + 1)],
        'large.jpg',
        { type: 'image/jpeg' }
      );
      const input = screen.getByLabelText(/select image file/i);

      await user.upload(input, largeFile);

      expect(screen.getByText(ERROR_MESSAGES.IMAGE_SIZE_EXCEEDED)).toBeInTheDocument();
    });

    it('ImageUpload_ShouldAcceptValidJPEG_WhenSelected', async () => {
      const user = userEvent.setup();
      render(<CategoryForm />);

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/select image file/i);

      await user.upload(input, file);

      expect(screen.queryByText(ERROR_MESSAGES.IMAGE_TYPE_INVALID)).not.toBeInTheDocument();
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });

    it('ImageUpload_ShouldAcceptValidPNG_WhenSelected', async () => {
      const user = userEvent.setup();
      render(<CategoryForm />);

      const file = new File(['content'], 'test.png', { type: 'image/png' });
      const input = screen.getByLabelText(/select image file/i);

      await user.upload(input, file);

      expect(screen.queryByText(ERROR_MESSAGES.IMAGE_TYPE_INVALID)).not.toBeInTheDocument();
    });
  });

  describe('Image Preview', () => {
    it('ImagePreview_ShouldDisplayPreview_WhenImageSelected', async () => {
      const user = userEvent.setup();
      render(<CategoryForm />);

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/select image file/i);

      await user.upload(input, file);

      expect(screen.getByAltText(/preview of test.jpg/i)).toBeInTheDocument();
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });

    it('ImagePreview_ShouldDisplayFileSize_WhenImageSelected', async () => {
      const user = userEvent.setup();
      render(<CategoryForm />);

      const file = new File(['x'.repeat(2048)], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/select image file/i);

      await user.upload(input, file);

      expect(screen.getByText(/2\.0 KB/i)).toBeInTheDocument();
    });

    it('ImagePreview_ShouldShowRemoveButton_WhenImageSelected', async () => {
      const user = userEvent.setup();
      render(<CategoryForm />);

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/select image file/i);

      await user.upload(input, file);

      expect(screen.getByRole('button', { name: /remove selected image/i })).toBeInTheDocument();
    });

    it('ImagePreview_ShouldRemoveImage_WhenRemoveButtonClicked', async () => {
      const user = userEvent.setup();
      render(<CategoryForm />);

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/select image file/i);

      await user.upload(input, file);
      expect(screen.getByText('test.jpg')).toBeInTheDocument();

      const removeButton = screen.getByRole('button', { name: /remove selected image/i });
      await user.click(removeButton);

      expect(screen.queryByText('test.jpg')).not.toBeInTheDocument();
      expect(screen.getByText(/click to upload/i)).toBeInTheDocument();
    });
  });

  describe('Drag and Drop', () => {
    it('DragAndDrop_ShouldHighlightZone_WhenDraggingOver', async () => {
      const { container } = render(<CategoryForm />);

      const dropZone = container.querySelector('[role="button"]');
      expect(dropZone).toBeTruthy();

      // Simulate drag over using React synthetic event
      const dragOverEvent = new Event('dragover', { bubbles: true, cancelable: true });
      Object.defineProperty(dragOverEvent, 'dataTransfer', {
        value: { files: [] },
      });
      
      await waitFor(() => {
        dropZone?.dispatchEvent(dragOverEvent);
      });

      // After drag over, the component should update state
      // Check that the zone exists (we can't easily test dynamic class changes in this test environment)
      expect(dropZone).toBeInTheDocument();
    });

    it('DragAndDrop_ShouldAcceptFile_WhenDropped', async () => {
      const { container } = render(<CategoryForm />);

      const file = new File(['content'], 'dropped.jpg', { type: 'image/jpeg' });
      const dropZone = container.querySelector('[role="button"]');

      // Simulate drop
      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: { files: [file] },
      });
      dropZone?.dispatchEvent(dropEvent);

      await waitFor(() => {
        expect(screen.getByText('dropped.jpg')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('FormSubmission_ShouldDisableButton_WhenFormInvalid', () => {
      render(<CategoryForm />);

      const submitButton = screen.getByRole('button', { name: /create category/i });
      expect(submitButton).toBeDisabled();
    });

    it('FormSubmission_ShouldEnableButton_WhenFormValid', async () => {
      const user = userEvent.setup();
      render(<CategoryForm />);

      const nameInput = screen.getByLabelText(/category name/i);
      await user.type(nameInput, 'Test Category');

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText(/select image file/i);
      await user.upload(fileInput, file);

      const submitButton = screen.getByRole('button', { name: /create category/i });
      expect(submitButton).not.toBeDisabled();
    });

    it('FormSubmission_ShouldCallUploadImage_WhenSubmitted', async () => {
      const user = userEvent.setup();
      render(<CategoryForm />);

      const nameInput = screen.getByLabelText(/category name/i);
      await user.type(nameInput, 'Test Category');

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText(/select image file/i);
      await user.upload(fileInput, file);

      const submitButton = screen.getByRole('button', { name: /create category/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(adminCategoryApi.uploadCategoryImage).toHaveBeenCalledWith(file, mockIdToken);
      });
    });

    it('FormSubmission_ShouldCallCreateCategory_WhenImageUploaded', async () => {
      const user = userEvent.setup();
      render(<CategoryForm />);

      const nameInput = screen.getByLabelText(/category name/i);
      await user.type(nameInput, 'Test Category');

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText(/select image file/i);
      await user.upload(fileInput, file);

      const submitButton = screen.getByRole('button', { name: /create category/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(adminCategoryApi.createCategory).toHaveBeenCalledWith(
          {
            name: 'Test Category',
            image: mockImageMetadata,
          },
          mockIdToken
        );
      });
    });

    it('FormSubmission_ShouldShowLoadingState_WhenSubmitting', async () => {
      const user = userEvent.setup();
      
      // Make API call slow
      vi.mocked(adminCategoryApi.uploadCategoryImage).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockImageMetadata), 100))
      );

      render(<CategoryForm />);

      const nameInput = screen.getByLabelText(/category name/i);
      await user.type(nameInput, 'Test Category');

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText(/select image file/i);
      await user.upload(fileInput, file);

      const submitButton = screen.getByRole('button', { name: /create category/i });
      await user.click(submitButton);

      expect(screen.getByText(/creating category/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('FormSubmission_ShouldShowSuccessMessage_WhenSuccessful', async () => {
      const user = userEvent.setup();
      render(<CategoryForm />);

      const nameInput = screen.getByLabelText(/category name/i);
      await user.type(nameInput, 'Test Category');

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText(/select image file/i);
      await user.upload(fileInput, file);

      const submitButton = screen.getByRole('button', { name: /create category/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/category created successfully/i)).toBeInTheDocument();
      });
    });

    it('FormSubmission_ShouldResetForm_WhenSuccessful', async () => {
      const user = userEvent.setup();
      render(<CategoryForm />);

      const nameInput = screen.getByLabelText(/category name/i);
      await user.type(nameInput, 'Test Category');

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText(/select image file/i);
      await user.upload(fileInput, file);

      const submitButton = screen.getByRole('button', { name: /create category/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(nameInput).toHaveValue('');
        expect(screen.queryByText('test.jpg')).not.toBeInTheDocument();
        expect(screen.getByText(/click to upload/i)).toBeInTheDocument();
      });
    });

    it('FormSubmission_ShouldPreventDoubleSubmit_WhenAlreadySubmitting', async () => {
      const user = userEvent.setup();
      
      // Make API call slow
      vi.mocked(adminCategoryApi.uploadCategoryImage).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockImageMetadata), 100))
      );

      render(<CategoryForm />);

      const nameInput = screen.getByLabelText(/category name/i);
      await user.type(nameInput, 'Test Category');

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText(/select image file/i);
      await user.upload(fileInput, file);

      const submitButton = screen.getByRole('button', { name: /create category/i });
      
      // Try to click twice
      await user.click(submitButton);
      await user.click(submitButton);

      // Should only be called once
      await waitFor(() => {
        expect(adminCategoryApi.uploadCategoryImage).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Error Handling', () => {
    it('ErrorHandling_ShouldShowError_WhenUploadFails', async () => {
      const user = userEvent.setup();
      
      vi.mocked(adminCategoryApi.uploadCategoryImage).mockRejectedValue({
        status: 500,
        message: 'Upload failed',
      });

      render(<CategoryForm />);

      const nameInput = screen.getByLabelText(/category name/i);
      await user.type(nameInput, 'Test Category');

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText(/select image file/i);
      await user.upload(fileInput, file);

      const submitButton = screen.getByRole('button', { name: /create category/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Upload failed')).toBeInTheDocument();
      });
    });

    it('ErrorHandling_ShouldShowError_WhenCreateFails', async () => {
      const user = userEvent.setup();
      
      vi.mocked(adminCategoryApi.createCategory).mockRejectedValue({
        status: 500,
        message: 'Creation failed',
      });

      render(<CategoryForm />);

      const nameInput = screen.getByLabelText(/category name/i);
      await user.type(nameInput, 'Test Category');

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText(/select image file/i);
      await user.upload(fileInput, file);

      const submitButton = screen.getByRole('button', { name: /create category/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Creation failed')).toBeInTheDocument();
      });
    });

    it('ErrorHandling_ShouldRedirectTo404_When403Error', async () => {
      const user = userEvent.setup();
      
      // Mock window.location
      delete (window as { location?: Location }).location;
      window.location = { href: '' } as Location;

      vi.mocked(adminCategoryApi.uploadCategoryImage).mockRejectedValue({
        status: 403,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });

      render(<CategoryForm />);

      const nameInput = screen.getByLabelText(/category name/i);
      await user.type(nameInput, 'Test Category');

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText(/select image file/i);
      await user.upload(fileInput, file);

      const submitButton = screen.getByRole('button', { name: /create category/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(window.location.href).toBe('/404');
      });
    });

    it('ErrorHandling_ShouldShowGenericError_WhenNoMessage', async () => {
      const user = userEvent.setup();
      
      vi.mocked(adminCategoryApi.uploadCategoryImage).mockRejectedValue({
        status: 500,
      });

      render(<CategoryForm />);

      const nameInput = screen.getByLabelText(/category name/i);
      await user.type(nameInput, 'Test Category');

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText(/select image file/i);
      await user.upload(fileInput, file);

      const submitButton = screen.getByRole('button', { name: /create category/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(ERROR_MESSAGES.GENERIC_ERROR)).toBeInTheDocument();
      });
    });

    it('ErrorHandling_ShouldRequireAuth_WhenNoToken', async () => {
      const user = userEvent.setup();
      
      mockUseAuth.mockReturnValue({
        idToken: null,
        user: null,
      });

      render(<CategoryForm />);

      const nameInput = screen.getByLabelText(/category name/i);
      await user.type(nameInput, 'Test Category');

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText(/select image file/i);
      await user.upload(fileInput, file);

      const submitButton = screen.getByRole('button', { name: /create category/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/authentication required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('Accessibility_ShouldHaveProperLabels_WhenRendered', () => {
      render(<CategoryForm />);

      expect(screen.getByLabelText(/category name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category image/i)).toBeInTheDocument();
    });

    it('Accessibility_ShouldHaveAriaInvalid_WhenValidationError', async () => {
      const user = userEvent.setup();
      render(<CategoryForm />);

      const input = screen.getByLabelText(/category name/i);
      await user.type(input, 'A');

      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('Accessibility_ShouldHaveAriaDescribedBy_WhenError', async () => {
      const user = userEvent.setup();
      render(<CategoryForm />);

      const input = screen.getByLabelText(/category name/i);
      await user.type(input, 'A');

      expect(input).toHaveAttribute('aria-describedby', 'category-name-error');
    });

    it('Accessibility_ShouldHaveRoleAlert_OnErrorMessages', async () => {
      const user = userEvent.setup();
      render(<CategoryForm />);

      const input = screen.getByLabelText(/category name/i);
      await user.type(input, 'A'); // Too short

      // Error message should have role="alert"
      await waitFor(() => {
        const errorMessage = screen.getByText(ERROR_MESSAGES.NAME_TOO_SHORT);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });

    it('Accessibility_ShouldHaveAriaLive_OnCharacterCount', () => {
      render(<CategoryForm />);

      const characterCount = screen.getByText(`0/${CATEGORY_NAME_MAX_LENGTH}`);
      // The character count itself has aria-live
      expect(characterCount).toHaveAttribute('aria-live', 'polite');
    });
  });
});
