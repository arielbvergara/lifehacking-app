/**
 * Mock data fixtures for e2e tests
 * These fixtures provide consistent test data for API mocking
 */

// Test credentials for authentication flows (configured via environment variables)
export const E2E_TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? 'e2e-tests@lifehacking.com';
export const E2E_TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? 'e2e-tests@lifehacking.com';

export const MOCK_CATEGORIES = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Productivity',
    imageUrl: 'https://example.com/images/productivity.jpg',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Health & Fitness',
    imageUrl: 'https://example.com/images/health.jpg',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Cooking',
    imageUrl: 'https://example.com/images/cooking.jpg',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Using a real tip ID from the backend for e2e tests
export const MOCK_TIP_ID = 'ae57901d-ff64-4445-a502-1fe2fad1a51e';

export const MOCK_TIPS = [
  {
    id: MOCK_TIP_ID,
    title: '5-Minute Morning Routine for Better Productivity',
    description:
      'Start your day right with this simple morning routine that takes only 5 minutes but can dramatically improve your focus and energy throughout the day.',
    categoryId: MOCK_CATEGORIES[0].id,
    categoryName: MOCK_CATEGORIES[0].name,
    imageUrl: 'https://example.com/images/morning-routine.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    tags: ['morning', 'routine', 'productivity', 'energy'],
    steps: [
      {
        stepNumber: 1,
        description: 'Drink a glass of water immediately after waking up to rehydrate your body.',
      },
      {
        stepNumber: 2,
        description: 'Do 10 deep breathing exercises to oxygenate your brain and reduce stress.',
      },
      {
        stepNumber: 3,
        description: 'Write down your top 3 priorities for the day in a notebook or app.',
      },
    ],
    viewCount: 1250,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '223e4567-e89b-12d3-a456-426614174001',
    title: 'Quick Healthy Breakfast Ideas',
    description:
      'Delicious and nutritious breakfast recipes that you can prepare in under 10 minutes. Perfect for busy mornings when you need energy fast.',
    categoryId: MOCK_CATEGORIES[2].id,
    categoryName: MOCK_CATEGORIES[2].name,
    imageUrl: 'https://example.com/images/breakfast.jpg',
    videoUrl: null,
    tags: ['cooking', 'breakfast', 'healthy', 'quick'],
    steps: [
      {
        stepNumber: 1,
        description: 'Prepare overnight oats the night before with oats, milk, and your favorite toppings.',
      },
      {
        stepNumber: 2,
        description: 'In the morning, add fresh fruits and nuts for extra nutrition and crunch.',
      },
      {
        stepNumber: 3,
        description: 'Enjoy your ready-to-eat breakfast that provides sustained energy.',
      },
    ],
    viewCount: 890,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
  {
    id: '323e4567-e89b-12d3-a456-426614174002',
    title: '10-Minute Home Workout',
    description:
      'No equipment needed! This quick workout routine targets all major muscle groups and can be done anywhere, anytime.',
    categoryId: MOCK_CATEGORIES[1].id,
    categoryName: MOCK_CATEGORIES[1].name,
    imageUrl: 'https://example.com/images/workout.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    tags: ['fitness', 'workout', 'home', 'quick'],
    steps: [
      {
        stepNumber: 1,
        description: 'Warm up with 2 minutes of jumping jacks and arm circles.',
      },
      {
        stepNumber: 2,
        description: 'Do 3 sets of: 10 push-ups, 15 squats, 20 mountain climbers.',
      },
      {
        stepNumber: 3,
        description: 'Cool down with 2 minutes of stretching all major muscle groups.',
      },
    ],
    viewCount: 2100,
    createdAt: '2024-01-12T14:00:00Z',
    updatedAt: '2024-01-12T14:00:00Z',
  },
  {
    id: '423e4567-e89b-12d3-a456-426614174003',
    title: 'Organize Your Workspace for Maximum Focus',
    description:
      'Learn how to arrange your desk and workspace to minimize distractions and boost your concentration and productivity.',
    categoryId: MOCK_CATEGORIES[0].id,
    categoryName: MOCK_CATEGORIES[0].name,
    imageUrl: 'https://example.com/images/workspace.jpg',
    videoUrl: null,
    tags: ['productivity', 'organization', 'workspace', 'focus'],
    steps: [
      {
        stepNumber: 1,
        description: 'Clear everything off your desk and clean the surface thoroughly.',
      },
      {
        stepNumber: 2,
        description: 'Only put back essential items: computer, notebook, and one personal item.',
      },
      {
        stepNumber: 3,
        description: 'Position your monitor at eye level and ensure good lighting.',
      },
    ],
    viewCount: 1560,
    createdAt: '2024-01-08T09:00:00Z',
    updatedAt: '2024-01-08T09:00:00Z',
  },
];

export const MOCK_TIPS_RESPONSE = {
  items: MOCK_TIPS,
  totalCount: MOCK_TIPS.length,
  page: 1,
  pageSize: 20,
  totalPages: 1,
};

export const MOCK_CATEGORIES_RESPONSE = {
  items: MOCK_CATEGORIES,
  totalCount: MOCK_CATEGORIES.length,
  page: 1,
  pageSize: 20,
  totalPages: 1,
};

export const MOCK_TIP_DETAIL = MOCK_TIPS[0];

const MOCK_SEARCH_RESULT_ITEMS = MOCK_TIPS.filter((tip) =>
  tip.title.toLowerCase().includes('productivity')
);

export const MOCK_SEARCH_RESULTS = {
  items: MOCK_SEARCH_RESULT_ITEMS,
  totalCount: MOCK_SEARCH_RESULT_ITEMS.length,
  page: 1,
  pageSize: 20,
  totalPages: 1,
};
