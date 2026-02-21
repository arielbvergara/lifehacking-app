'use client';

import { useState, useCallback, ChangeEvent, FormEvent, DragEvent, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';
import { useAuth } from '@/lib/auth/auth-context';
import { uploadCategoryImage, createCategory, updateCategory } from '@/lib/api/admin-category';
import { ValidationErrors, CategoryResponse, CategoryImageDto } from '@/lib/types/admin-category';
import {
  CATEGORY_NAME_MIN_LENGTH,
  CATEGORY_NAME_MAX_LENGTH,
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_IMAGE_TYPES,
  ERROR_MESSAGES,
} from '@/lib/constants/admin-category';

interface FormState {
  categoryName: string;
  selectedFile: File | null;
  previewUrl: string | null;
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;
  validationErrors: ValidationErrors;
  isDragOver: boolean;
}

interface CategoryFormCreateProps {
  mode: 'create';
  initialData?: never;
  categoryId?: never;
}

interface CategoryFormEditProps {
  mode: 'edit';
  initialData: CategoryResponse;
  categoryId: string;
}

type CategoryFormProps = CategoryFormCreateProps | CategoryFormEditProps;

export function CategoryForm(props: CategoryFormProps) {
  // Type guard and validation
  if (props.mode === 'edit' && !props.categoryId) {
    throw new Error('categoryId is required when mode is "edit"');
  }
  
  if (props.mode === 'edit' && !props.initialData) {
    throw new Error('initialData is required when mode is "edit"');
  }

  const { mode, initialData, categoryId } = props;
  const router = useRouter();
  const { idToken } = useAuth();
  
  const [formState, setFormState] = useState<FormState>({
    categoryName: initialData?.name || '',
    selectedFile: null,
    previewUrl: initialData?.image?.imageUrl || null,
    isSubmitting: false,
    error: null,
    successMessage: null,
    validationErrors: {},
    isDragOver: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (formState.previewUrl) {
        URL.revokeObjectURL(formState.previewUrl);
      }
    };
  }, [formState.previewUrl]);

  // Validation functions
  const validateCategoryName = useCallback((name: string): string | null => {
    const trimmed = name.trim();

    if (trimmed.length === 0) {
      return ERROR_MESSAGES.NAME_REQUIRED;
    }

    if (trimmed.length < CATEGORY_NAME_MIN_LENGTH) {
      return ERROR_MESSAGES.NAME_TOO_SHORT;
    }

    if (trimmed.length > CATEGORY_NAME_MAX_LENGTH) {
      return ERROR_MESSAGES.NAME_TOO_LONG;
    }

    return null;
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

  // Event handlers
  const handleNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const error = validateCategoryName(value);

    setFormState((prev) => ({
      ...prev,
      categoryName: value,
      validationErrors: {
        ...prev.validationErrors,
        categoryName: error || undefined,
      },
    }));
  }, [validateCategoryName]);

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

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setFormState((prev) => ({ ...prev, isDragOver: true }));
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setFormState((prev) => ({ ...prev, isDragOver: false }));
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
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
    const nameError = validateCategoryName(formState.categoryName);
    // Image is required only in create mode or if a new file is selected in edit mode
    const imageError = (mode === 'create' && !formState.selectedFile) ? ERROR_MESSAGES.IMAGE_REQUIRED : null;

    if (nameError || imageError) {
      setFormState((prev) => ({
        ...prev,
        validationErrors: {
          categoryName: nameError || undefined,
          image: imageError || undefined,
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
      await Sentry.startSpan(
        {
          op: 'ui.action',
          name: mode === 'edit' ? 'Update Category Form Submit' : 'Create Category Form Submit',
        },
        async (span) => {
          span.setAttribute('category.name', formState.categoryName.trim());
          span.setAttribute('category.mode', mode);
          if (formState.selectedFile) {
            span.setAttribute('image.size', formState.selectedFile.size);
            span.setAttribute('image.type', formState.selectedFile.type);
          }

          // Get Firebase ID token from auth context
          if (!idToken) {
            throw new Error('Authentication required');
          }

          if (mode === 'edit') {
            // Edit mode: Update existing category
            if (!categoryId) {
              throw new Error('Category ID is required for edit mode');
            }

            let image: CategoryImageDto | undefined;

            // Upload new image if selected
            if (formState.selectedFile) {
              image = await uploadCategoryImage(formState.selectedFile, idToken);
              span.setAttribute('image.uploaded', true);
            } else if (initialData?.image) {
              // Keep existing image
              image = initialData.image;
            }

            await updateCategory(
              categoryId,
              {
                name: formState.categoryName.trim(),
                image,
              },
              idToken
            );
            span.setAttribute('category.updated', true);

            // Success - navigate to categories list
            router.push('/admin/categories');
          } else {
            // Create mode: Create new category
            if (!formState.selectedFile) {
              throw new Error('Image file is required for create mode');
            }

            // Step 1: Upload image
            const imageMetadata = await uploadCategoryImage(formState.selectedFile, idToken);
            span.setAttribute('image.uploaded', true);

            // Step 2: Create category
            await createCategory(
              {
                name: formState.categoryName.trim(),
                image: imageMetadata,
              },
              idToken
            );
            span.setAttribute('category.created', true);

            // Success - reset form
            if (formState.previewUrl && formState.selectedFile) {
              URL.revokeObjectURL(formState.previewUrl);
            }

            setFormState({
              categoryName: '',
              selectedFile: null,
              previewUrl: null,
              isSubmitting: false,
              error: null,
              successMessage: 'Category created successfully!',
              validationErrors: {},
              isDragOver: false,
            });

            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }
        }
      );
    } catch (err) {
      // Capture exception in Sentry
      Sentry.captureException(err);
      
      // Handle 403 Forbidden - redirect to 404
      const error = err as { status?: number; message?: string };
      if (error.status === 403) {
        window.location.href = '/404';
        return;
      }

      // Handle 409 Conflict - category name already exists
      if (error.status === 409) {
        setFormState((prev) => ({
          ...prev,
          isSubmitting: false,
          validationErrors: {
            ...prev.validationErrors,
            categoryName: error.message || 'A category with this name already exists',
          },
        }));
        return;
      }

      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: error.message || (mode === 'edit' ? 'Failed to update category' : ERROR_MESSAGES.GENERIC_ERROR),
      }));
    }
  };

  const isFormValid =
    formState.categoryName.trim().length >= CATEGORY_NAME_MIN_LENGTH &&
    formState.categoryName.trim().length <= CATEGORY_NAME_MAX_LENGTH &&
    (mode === 'edit' || formState.selectedFile !== null) &&
    !formState.validationErrors.categoryName &&
    !formState.validationErrors.image;

  const submitButtonText = mode === 'edit' ? 'Update Category' : 'Create Category';

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
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

      {/* Category Name Input */}
      <div className="mb-6">
        <label
          htmlFor="category-name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Category Name
        </label>
        <input
          type="text"
          id="category-name"
          value={formState.categoryName}
          onChange={handleNameChange}
          disabled={formState.isSubmitting}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          aria-describedby={
            formState.validationErrors.categoryName
              ? 'category-name-error'
              : 'category-name-hint'
          }
          aria-invalid={!!formState.validationErrors.categoryName}
        />
        <div className="mt-1 flex justify-between items-start">
          <div className="flex-1">
            {formState.validationErrors.categoryName && (
              <p id="category-name-error" className="text-sm text-red-600" role="alert">
                {formState.validationErrors.categoryName}
              </p>
            )}
          </div>
          <p
            id="category-name-hint"
            className="text-sm text-gray-500"
            aria-live="polite"
          >
            {formState.categoryName.length}/{CATEGORY_NAME_MAX_LENGTH}
          </p>
        </div>
      </div>

      {/* Image Upload */}
      {!formState.selectedFile && !formState.previewUrl ? (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Image
          </label>
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
            aria-label="Upload category image"
            aria-describedby={
              formState.validationErrors.image ? 'image-error' : 'image-hint'
            }
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
        /* Image Preview */
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Image
          </label>
          <div className="border border-gray-300 rounded-lg p-4">
            <div className="relative w-full h-48 rounded-lg overflow-hidden mb-3">
              <Image
                src={formState.selectedFile ? formState.previewUrl! : (formState.previewUrl || '')}
                alt={formState.selectedFile ? `Preview of ${formState.selectedFile.name}` : 'Category image'}
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
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormValid || formState.isSubmitting}
        className="w-full px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        aria-label={formState.isSubmitting ? `${mode === 'edit' ? 'Updating' : 'Creating'} category...` : submitButtonText}
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
            {mode === 'edit' ? 'Updating Category...' : 'Creating Category...'}
          </span>
        ) : (
          submitButtonText
        )}
      </button>
    </form>
  );
}
