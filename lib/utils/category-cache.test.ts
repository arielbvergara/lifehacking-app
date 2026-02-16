import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCachedCategories, setCachedCategories } from './category-cache';
import { Category } from '@/lib/types/api';

describe('getCachedCategories', () => {
  beforeEach(() => {
    // Clear session storage before each test
    sessionStorage.clear();
  });

  it('should return null when cache is empty', () => {
    const result = getCachedCategories();
    expect(result).toBeNull();
  });

  it('should return cached categories when present', () => {
    // Arrange
    const mockCategories: Category[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Kitchen',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: null,
      },
      {
        id: '223e4567-e89b-12d3-a456-426614174001',
        name: 'Cleaning',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: null,
      },
    ];

    const cachedData = {
      categories: mockCategories,
      timestamp: Date.now(),
    };

    sessionStorage.setItem('categories_cache', JSON.stringify(cachedData));

    // Act
    const result = getCachedCategories();

    // Assert
    expect(result).toEqual(mockCategories);
    expect(result).toHaveLength(2);
    expect(result![0].name).toBe('Kitchen');
    expect(result![1].name).toBe('Cleaning');
  });

  it('should return null when cached data is corrupted', () => {
    // Arrange: Store invalid JSON
    sessionStorage.setItem('categories_cache', 'invalid json {');

    // Act
    const result = getCachedCategories();

    // Assert: Should fail silently and return null
    expect(result).toBeNull();
  });

  it('should return null when session storage is unavailable', () => {
    // Arrange: Mock sessionStorage.getItem to throw an error
    const originalGetItem = sessionStorage.getItem;
    sessionStorage.getItem = vi.fn(() => {
      throw new Error('Storage unavailable');
    });

    // Act
    const result = getCachedCategories();

    // Assert: Should fail silently and return null
    expect(result).toBeNull();

    // Cleanup
    sessionStorage.getItem = originalGetItem;
  });

  it('should handle categories with images', () => {
    // Arrange
    const mockCategories: Category[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Kitchen',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: null,
        image: {
          imageUrl: 'https://example.com/kitchen.jpg',
          imageStoragePath: '/storage/kitchen.jpg',
          originalFileName: 'kitchen.jpg',
          contentType: 'image/jpeg',
          fileSizeBytes: 1024,
          uploadedAt: '2024-01-01T00:00:00Z',
        },
      },
    ];

    const cachedData = {
      categories: mockCategories,
      timestamp: Date.now(),
    };

    sessionStorage.setItem('categories_cache', JSON.stringify(cachedData));

    // Act
    const result = getCachedCategories();

    // Assert
    expect(result).toEqual(mockCategories);
    expect(result![0].image).toBeDefined();
    expect(result![0].image!.imageUrl).toBe('https://example.com/kitchen.jpg');
  });

  it('should return empty array when cached with empty array', () => {
    // Arrange
    const cachedData = {
      categories: [],
      timestamp: Date.now(),
    };

    sessionStorage.setItem('categories_cache', JSON.stringify(cachedData));

    // Act
    const result = getCachedCategories();

    // Assert
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });
});

describe('setCachedCategories', () => {
  beforeEach(() => {
    // Clear session storage before each test
    sessionStorage.clear();
  });

  it('should store categories in session storage', () => {
    // Arrange
    const mockCategories: Category[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Kitchen',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: null,
      },
    ];

    // Act
    setCachedCategories(mockCategories);

    // Assert
    const stored = sessionStorage.getItem('categories_cache');
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);
    expect(parsed.categories).toEqual(mockCategories);
    expect(parsed.timestamp).toBeDefined();
    expect(typeof parsed.timestamp).toBe('number');
  });

  it('should store multiple categories correctly', () => {
    // Arrange
    const mockCategories: Category[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Kitchen',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: null,
      },
      {
        id: '223e4567-e89b-12d3-a456-426614174001',
        name: 'Cleaning',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: null,
      },
      {
        id: '323e4567-e89b-12d3-a456-426614174002',
        name: 'Tech Help',
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-04T00:00:00Z',
      },
    ];

    // Act
    setCachedCategories(mockCategories);

    // Assert
    const stored = sessionStorage.getItem('categories_cache');
    const parsed = JSON.parse(stored!);
    expect(parsed.categories).toHaveLength(3);
    expect(parsed.categories[0].name).toBe('Kitchen');
    expect(parsed.categories[1].name).toBe('Cleaning');
    expect(parsed.categories[2].name).toBe('Tech Help');
  });

  it('should store categories with images', () => {
    // Arrange
    const mockCategories: Category[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Kitchen',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: null,
        image: {
          imageUrl: 'https://example.com/kitchen.jpg',
          imageStoragePath: '/storage/kitchen.jpg',
          originalFileName: 'kitchen.jpg',
          contentType: 'image/jpeg',
          fileSizeBytes: 1024,
          uploadedAt: '2024-01-01T00:00:00Z',
        },
      },
    ];

    // Act
    setCachedCategories(mockCategories);

    // Assert
    const stored = sessionStorage.getItem('categories_cache');
    const parsed = JSON.parse(stored!);
    expect(parsed.categories[0].image).toBeDefined();
    expect(parsed.categories[0].image.imageUrl).toBe('https://example.com/kitchen.jpg');
  });

  it('should store empty array correctly', () => {
    // Arrange
    const mockCategories: Category[] = [];

    // Act
    setCachedCategories(mockCategories);

    // Assert
    const stored = sessionStorage.getItem('categories_cache');
    const parsed = JSON.parse(stored!);
    expect(parsed.categories).toEqual([]);
    expect(parsed.categories).toHaveLength(0);
  });

  it('should fail silently when session storage is unavailable', () => {
    // Arrange
    const mockCategories: Category[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Kitchen',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: null,
      },
    ];

    // Mock sessionStorage.setItem to throw an error
    const originalSetItem = sessionStorage.setItem;
    sessionStorage.setItem = vi.fn(() => {
      throw new Error('Storage unavailable');
    });

    // Act & Assert: Should not throw an error
    expect(() => setCachedCategories(mockCategories)).not.toThrow();

    // Cleanup
    sessionStorage.setItem = originalSetItem;
  });

  it('should overwrite existing cache', () => {
    // Arrange
    const firstCategories: Category[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Kitchen',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: null,
      },
    ];

    const secondCategories: Category[] = [
      {
        id: '223e4567-e89b-12d3-a456-426614174001',
        name: 'Cleaning',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: null,
      },
    ];

    // Act
    setCachedCategories(firstCategories);
    setCachedCategories(secondCategories);

    // Assert
    const stored = sessionStorage.getItem('categories_cache');
    const parsed = JSON.parse(stored!);
    expect(parsed.categories).toHaveLength(1);
    expect(parsed.categories[0].name).toBe('Cleaning');
  });

  it('should include current timestamp', () => {
    // Arrange
    const mockCategories: Category[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Kitchen',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: null,
      },
    ];

    const beforeTimestamp = Date.now();

    // Act
    setCachedCategories(mockCategories);

    const afterTimestamp = Date.now();

    // Assert
    const stored = sessionStorage.getItem('categories_cache');
    const parsed = JSON.parse(stored!);
    expect(parsed.timestamp).toBeGreaterThanOrEqual(beforeTimestamp);
    expect(parsed.timestamp).toBeLessThanOrEqual(afterTimestamp);
  });
});

describe('getCachedCategories and setCachedCategories integration', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('should retrieve what was stored', () => {
    // Arrange
    const mockCategories: Category[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Kitchen',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: null,
      },
      {
        id: '223e4567-e89b-12d3-a456-426614174001',
        name: 'Cleaning',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: null,
        image: {
          imageUrl: 'https://example.com/cleaning.jpg',
          imageStoragePath: '/storage/cleaning.jpg',
          originalFileName: 'cleaning.jpg',
          contentType: 'image/jpeg',
          fileSizeBytes: 2048,
          uploadedAt: '2024-01-02T00:00:00Z',
        },
      },
    ];

    // Act
    setCachedCategories(mockCategories);
    const result = getCachedCategories();

    // Assert
    expect(result).toEqual(mockCategories);
  });

  it('should handle multiple set and get operations', () => {
    // Arrange
    const categories1: Category[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Kitchen',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: null,
      },
    ];

    const categories2: Category[] = [
      {
        id: '223e4567-e89b-12d3-a456-426614174001',
        name: 'Cleaning',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: null,
      },
    ];

    // Act & Assert
    setCachedCategories(categories1);
    expect(getCachedCategories()).toEqual(categories1);

    setCachedCategories(categories2);
    expect(getCachedCategories()).toEqual(categories2);
  });
});
