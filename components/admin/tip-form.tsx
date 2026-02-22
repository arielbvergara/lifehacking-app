'use client';

import { useState, useCallback, ChangeEvent, FormEvent, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { uploadTipImage, createTip, updateTip, fetchCategories } from '@/lib/api/admin-tip';
import { generateTipContentFromVideo, validateVideoUrl } from '@/lib/services/gemini';
import {
  GeminiTipContent,
  TipValidationErrors,
  CategoryResponse,
  TipDetailResponse,
} from '@/lib/types/admin-tip';
import {
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_IMAGE_TYPES,
  ERROR_MESSAGES,
} from '@/lib/constants/admin-tip';

interface FormState {
  // Video URL step
  videoUrl: string;
  isProcessingVideo: boolean;
  
  // Gemini content
  geminiContent: GeminiTipContent | null;
  contentJson: string;
  
  // Form fields
  selectedCategoryId: string;
  selectedFile: File | null;
  previewUrl: string | null;
  
  // Categories
  categories: CategoryResponse[];
  isLoadingCategories: boolean;
  
  // Submission
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;
  validationErrors: TipValidationErrors;
  
  // Drag and drop
  isDragOver: boolean;
}

interface TipFormCreateProps {
  mode: 'create';
  initialData?: never;
  tipId?: never;
}

interface TipFormEditProps {
  mode: 'edit';
  initialData: TipDetailResponse;
  tipId: string;
}

type TipFormProps = TipFormCreateProps | TipFormEditProps;

export function TipForm(props: TipFormProps) {
  // Type guard and validation
  if (props.mode === 'edit' && !props.tipId) {
    throw new Error('tipId is required when mode is "edit"');
  }
  
  if (props.mode === 'edit' && !props.initialData) {
    throw new Error('initialData is required when mode is "edit"');
  }

  const { mode, initialData, tipId } = props;
  const router = useRouter();
  const { idToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formState, setFormState] = useState<FormState>({
    videoUrl: initialData?.videoUrl || '',
    isProcessingVideo: false,
    geminiContent: null,
    contentJson: '',
    selectedCategoryId: initialData?.categoryId || '',
    selectedFile: null,
    previewUrl: initialData?.image?.imageUrl || null,
    categories: [],
    isLoadingCategories: false,
    isSubmitting: false,
    error: null,
    successMessage: null,
    validationErrors: {},
    isDragOver: false,
  });

  // Load categories on mount and pre-populate form in edit mode
  useEffect(() => {
    loadCategories();
    
    // Pre-populate form fields when in edit mode
    if (mode === 'edit' && initialData) {
      const geminiContent: GeminiTipContent = {
        title: initialData.title,
        description: initialData.description,
        steps: initialData.steps,
        tags: initialData.tags,
        videoUrl: initialData.videoUrl || '',
      };
      
      setFormState((prev) => ({
        ...prev,
        geminiContent,
        contentJson: JSON.stringify(geminiContent, null, 2),
      }));
    }
  }, [mode, initialData]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (formState.previewUrl) {
        URL.revokeObjectURL(formState.previewUrl);
      }
    };
  }, [formState.previewUrl]);

  const loadCategories = async () => {
    setFormState((prev) => ({ ...prev, isLoadingCategories: true }));
    
    try {
      const categories = await fetchCategories();
      setFormState((prev) => ({
        ...prev,
        categories,
        isLoadingCategories: false,
      }));
    } catch {
      setFormState((prev) => ({
        ...prev,
        isLoadingCategories: false,
        error: 'Failed to load categories. Please refresh the page.',
      }));
    }
  };

  const handleVideoUrlChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormState((prev) => ({
      ...prev,
      videoUrl: value,
      validationErrors: {
        ...prev.validationErrors,
        videoUrl: undefined,
      },
    }));
  }, []);

  const handleProcessVideo = async () => {
    // Validate video URL
    const validation = validateVideoUrl(formState.videoUrl);
    
    if (!validation.isValid) {
      setFormState((prev) => ({
        ...prev,
        validationErrors: {
          ...prev.validationErrors,
          videoUrl: validation.error,
        },
      }));
      return;
    }

    setFormState((prev) => ({
      ...prev,
      isProcessingVideo: true,
      error: null,
      validationErrors: {},
    }));

    try {
      const content = await generateTipContentFromVideo(formState.videoUrl);
      
      setFormState((prev) => ({
        ...prev,
        isProcessingVideo: false,
        geminiContent: content,
        contentJson: JSON.stringify(content, null, 2),
      }));
    } catch (err) {
      const error = err as Error;
      
      setFormState((prev) => ({
        ...prev,
        isProcessingVideo: false,
        validationErrors: {
          ...prev.validationErrors,
          gemini: error.message || ERROR_MESSAGES.GEMINI_API_ERROR,
        },
      }));
    }
  };

  const handleContentJsonChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setFormState((prev) => ({
      ...prev,
      contentJson: e.target.value,
      validationErrors: {
        ...prev.validationErrors,
        gemini: undefined,
      },
    }));
  }, []);

  const handleCategoryChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setFormState((prev) => ({
      ...prev,
      selectedCategoryId: e.target.value,
      validationErrors: {
        ...prev.validationErrors,
        categoryId: undefined,
      },
    }));
  }, []);

  const validateImageFile = useCallback((file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
      return ERROR_MESSAGES.IMAGE_TYPE_INVALID;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return ERROR_MESSAGES.IMAGE_SIZE_EXCEEDED;
    }

    return null;
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    const error = validateImageFile(file);

    if (error) {
      setFormState((prev) => ({
        ...prev,
        validationErrors: {
          ...prev.validationErrors,
          image: error,
        },
      }));
      return;
    }

    // Revoke previous object URL if exists
    if (formState.previewUrl) {
      URL.revokeObjectURL(formState.previewUrl);
    }

    const previewUrl = URL.createObjectURL(file);

    setFormState((prev) => ({
      ...prev,
      selectedFile: file,
      previewUrl,
      validationErrors: {
        ...prev.validationErrors,
        image: undefined,
      },
    }));
  }, [validateImageFile, formState.previewUrl]);

  const handleFileInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setFormState((prev) => ({ ...prev, isDragOver: true }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setFormState((prev) => ({ ...prev, isDragOver: false }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setFormState((prev) => ({ ...prev, isDragOver: false }));

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleRemoveImage = useCallback(() => {
    if (formState.previewUrl) {
      URL.revokeObjectURL(formState.previewUrl);
    }

    setFormState((prev) => ({
      ...prev,
      selectedFile: null,
      previewUrl: null,
      validationErrors: {
        ...prev.validationErrors,
        image: undefined,
      },
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [formState.previewUrl]);

  const handleClickUploadZone = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors: TipValidationErrors = {};

    if (!formState.contentJson) {
      errors.gemini = 'Please generate tip content from a video URL first';
    }

    if (!formState.selectedCategoryId) {
      errors.categoryId = ERROR_MESSAGES.CATEGORY_REQUIRED;
    }

    // Image is required only in create mode or if a new file is selected in edit mode
    if (mode === 'create' && !formState.selectedFile) {
      errors.image = ERROR_MESSAGES.IMAGE_REQUIRED;
    }

    if (Object.keys(errors).length > 0) {
      setFormState((prev) => ({
        ...prev,
        validationErrors: errors,
      }));
      return;
    }

    // Parse and validate JSON content
    let parsedContent: GeminiTipContent;
    try {
      parsedContent = JSON.parse(formState.contentJson);
    } catch {
      setFormState((prev) => ({
        ...prev,
        validationErrors: {
          ...prev.validationErrors,
          gemini: 'Invalid JSON format. Please fix the content.',
        },
      }));
      return;
    }

    setFormState((prev) => ({
      ...prev,
      isSubmitting: true,
      error: null,
      successMessage: null,
    }));

    try {
      if (!idToken) {
        throw new Error('Authentication required');
      }

      if (mode === 'edit') {
        // Edit mode: Update existing tip
        if (!tipId) {
          throw new Error('Tip ID is required for edit mode');
        }

        // Upload new image if selected (image updates are handled separately)
        if (formState.selectedFile) {
          await uploadTipImage(formState.selectedFile, idToken);
        }

        await updateTip(
          tipId,
          {
            title: parsedContent.title,
            description: parsedContent.description,
            steps: parsedContent.steps,
            categoryId: formState.selectedCategoryId,
            tags: parsedContent.tags,
            videoUrl: parsedContent.videoUrl || null,
          },
          idToken
        );

        // Success - navigate to tips list
        router.push('/admin/tips');
      } else {
        // Create mode: Create new tip
        if (!formState.selectedFile) {
          throw new Error('Image file is required for create mode');
        }

        const imageMetadata = await uploadTipImage(formState.selectedFile, idToken);

        await createTip(
          {
            title: parsedContent.title,
            description: parsedContent.description,
            steps: parsedContent.steps,
            categoryId: formState.selectedCategoryId,
            tags: parsedContent.tags,
            videoUrl: parsedContent.videoUrl || null,
            image: imageMetadata,
          },
          idToken
        );

        // Success - reset form
        if (formState.previewUrl && formState.selectedFile) {
          URL.revokeObjectURL(formState.previewUrl);
        }

        setFormState({
          videoUrl: '',
          isProcessingVideo: false,
          geminiContent: null,
          contentJson: '',
          selectedCategoryId: '',
          selectedFile: null,
          previewUrl: null,
          categories: formState.categories,
          isLoadingCategories: false,
          isSubmitting: false,
          error: null,
          successMessage: 'Tip created successfully!',
          validationErrors: {},
          isDragOver: false,
        });

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (err) {
      // Handle 403 Forbidden - redirect to 404
      const error = err as { status?: number; message?: string };
      if (error.status === 403) {
        window.location.href = '/404';
        return;
      }

      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: error.message || (mode === 'edit' ? 'Failed to update tip' : ERROR_MESSAGES.TIP_CREATION_FAILED),
      }));
    }
  };

  const canSubmit =
    formState.geminiContent !== null &&
    formState.selectedCategoryId !== '' &&
    (mode === 'edit' || formState.selectedFile !== null) &&
    !formState.isSubmitting;

  const submitButtonText = mode === 'edit' ? 'Update Tip' : 'Create Tip';

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl">
      {/* Success Message */}
      {formState.successMessage && (
        <div
          role="alert"
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800"
        >
          {formState.successMessage}
        </div>
      )}

      {/* Error Message */}
      {formState.error && (
        <div
          role="alert"
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800"
        >
          {formState.error}
        </div>
      )}

      {/* Step 1: Video URL Input - Only show in create mode or if no content yet */}
      {(mode === 'create' || !formState.geminiContent) && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Step 1: Enter Video URL</h2>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="url"
              value={formState.videoUrl}
              onChange={handleVideoUrlChange}
              disabled={formState.isProcessingVideo || formState.geminiContent !== null}
              placeholder="https://www.youtube.com/shorts/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              aria-label="Video URL"
              aria-describedby={formState.validationErrors.videoUrl ? 'video-url-error' : undefined}
              aria-invalid={!!formState.validationErrors.videoUrl}
            />
            {formState.validationErrors.videoUrl && (
              <p id="video-url-error" className="mt-1 text-sm text-red-600" role="alert">
                {formState.validationErrors.videoUrl}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleProcessVideo}
            disabled={formState.isProcessingVideo || formState.geminiContent !== null || !formState.videoUrl}
            className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {formState.isProcessingVideo ? 'Processing...' : 'Generate Content'}
          </button>
        </div>
        {formState.validationErrors.gemini && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600" role="alert">
              {formState.validationErrors.gemini}
            </p>
            <button
              type="button"
              onClick={() => {
                setFormState((prev) => ({
                  ...prev,
                  validationErrors: { ...prev.validationErrors, gemini: undefined },
                }));
                handleProcessVideo();
              }}
              className="mt-2 text-sm text-primary hover:text-primary-dark underline"
            >
              Retry
            </button>
          </div>
        )}
      </div>
      )}

      {/* Loading State */}
      {formState.isProcessingVideo && (
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <svg
              className="animate-spin h-5 w-5 text-primary mr-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-blue-800">Analyzing video and generating tip content...</span>
          </div>
        </div>
      )}

      {/* Step 2: Edit Generated Content */}
      {formState.geminiContent && (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Step 2: Review & Edit Content</h2>
            <textarea
              value={formState.contentJson}
              onChange={handleContentJsonChange}
              disabled={formState.isSubmitting}
              rows={20}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed font-mono text-sm"
              aria-label="Tip content JSON"
            />
            <p className="mt-1 text-sm text-gray-500">
              Edit the JSON above to modify title, description, steps, or tags
            </p>
          </div>

          {/* Step 3: Select Category */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Step 3: Select Category</h2>
            <select
              value={formState.selectedCategoryId}
              onChange={handleCategoryChange}
              disabled={formState.isSubmitting || formState.isLoadingCategories}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              aria-label="Category"
              aria-describedby={formState.validationErrors.categoryId ? 'category-error' : undefined}
              aria-invalid={!!formState.validationErrors.categoryId}
            >
              <option value="">Select a category</option>
              {formState.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {formState.validationErrors.categoryId && (
              <p id="category-error" className="mt-1 text-sm text-red-600" role="alert">
                {formState.validationErrors.categoryId}
              </p>
            )}
          </div>

          {/* Step 4: Upload Image */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Step 4: Upload Image</h2>
            {!formState.selectedFile && !formState.previewUrl ? (
              <div>
                <div
                  onClick={handleClickUploadZone}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    formState.isDragOver
                      ? 'border-primary bg-primary-light'
                      : 'border-gray-300 hover:border-gray-400'
                  } ${formState.isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload tip image"
                  aria-describedby={formState.validationErrors.image ? 'image-error' : 'image-hint'}
                >
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p id="image-hint" className="mt-1 text-xs text-gray-500">
                    PNG, JPG, GIF or WebP up to 5MB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(',')}
                  onChange={handleFileInputChange}
                  disabled={formState.isSubmitting}
                  className="hidden"
                  aria-label="Select image file"
                />
                {formState.validationErrors.image && (
                  <p id="image-error" className="mt-2 text-sm text-red-600" role="alert">
                    {formState.validationErrors.image}
                  </p>
                )}
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="relative w-full h-48 rounded-lg overflow-hidden mb-3">
                  <Image
                    src={formState.selectedFile ? formState.previewUrl! : (formState.previewUrl || '')}
                    alt={formState.selectedFile ? `Preview of ${formState.selectedFile.name}` : 'Tip image'}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {formState.selectedFile ? formState.selectedFile.name : 'Current image'}
                    </p>
                    {formState.selectedFile && (
                      <p className="text-xs text-gray-500">
                        {(formState.selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={formState.isSubmitting}
                    className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Remove selected image"
                  >
                    {mode === 'edit' && !formState.selectedFile ? 'Change Image' : 'Remove'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            aria-label={formState.isSubmitting ? `${mode === 'edit' ? 'Updating' : 'Creating'} tip...` : `${submitButtonText}`}
          >
            {formState.isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {mode === 'edit' ? 'Updating Tip...' : 'Creating Tip...'}
              </span>
            ) : (
              submitButtonText
            )}
          </button>
        </>
      )}
    </form>
  );
}
