/**
 * Property-Based Tests for FilterSidebar Body Scroll Prevention
 * 
 * Property 11: Mobile sidebar prevents body scroll when open
 * Validates: Requirements 3.10, 16.6
 */

import { render, cleanup } from '@testing-library/react';
import { FilterSidebar } from './filter-sidebar';
import fc from 'fast-check';

describe('FilterSidebar - Property 11: Body scroll prevention', () => {
  afterEach(() => {
    cleanup();
    // Ensure body overflow is reset after each test
    document.body.style.overflow = '';
  });

  /**
   * Property 11: Mobile sidebar prevents body scroll when open
   * 
   * For any combination of sidebar props, when isOpen is true,
   * the body element should have overflow: hidden to prevent scrolling.
   * When isOpen is false, body overflow should be restored to default.
   * 
   * Validates: Requirements 3.10, 16.6
   */
  test('body overflow is hidden when sidebar is open and restored when closed', () => {
    fc.assert(
      fc.property(
        fc.record({
          selectedCategoryId: fc.option(fc.uuid(), { nil: null }),
          sortBy: fc.constantFrom('newest', 'oldest', 'alphabetical'),
          sortDir: fc.constantFrom('asc', 'desc'),
          hasActiveFilters: fc.boolean(),
          showCategoryFilter: fc.boolean(),
        }),
        (props) => {
          // Test with sidebar open
          const { rerender, unmount } = render(
            <FilterSidebar
              isOpen={true}
              onClose={() => {}}
              selectedCategoryId={props.selectedCategoryId}
              onCategorySelect={() => {}}
              sortBy={props.sortBy as 'newest' | 'oldest' | 'alphabetical'}
              sortDir={props.sortDir as 'asc' | 'desc'}
              onSortChange={() => {}}
              onSortDirectionToggle={() => {}}
              onResetFilters={() => {}}
              hasActiveFilters={props.hasActiveFilters}
              showCategoryFilter={props.showCategoryFilter}
            />
          );

          // When sidebar is open, body overflow should be hidden
          expect(document.body.style.overflow).toBe('hidden');

          // Test with sidebar closed
          rerender(
            <FilterSidebar
              isOpen={false}
              onClose={() => {}}
              selectedCategoryId={props.selectedCategoryId}
              onCategorySelect={() => {}}
              sortBy={props.sortBy as 'newest' | 'oldest' | 'alphabetical'}
              sortDir={props.sortDir as 'asc' | 'desc'}
              onSortChange={() => {}}
              onSortDirectionToggle={() => {}}
              onResetFilters={() => {}}
              hasActiveFilters={props.hasActiveFilters}
              showCategoryFilter={props.showCategoryFilter}
            />
          );

          // When sidebar is closed, body overflow should be restored
          expect(document.body.style.overflow).toBe('');

          // Cleanup
          unmount();

          // After unmount, body overflow should be restored
          expect(document.body.style.overflow).toBe('');
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 11 (Edge Case): Body overflow cleanup on unmount
   * 
   * For any sidebar state, when the component unmounts,
   * body overflow should be restored to prevent side effects.
   * 
   * Validates: Requirements 3.10, 16.6
   */
  test('body overflow is restored on component unmount regardless of isOpen state', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // isOpen state
        fc.record({
          selectedCategoryId: fc.option(fc.uuid(), { nil: null }),
          sortBy: fc.constantFrom('newest', 'oldest', 'alphabetical'),
          sortDir: fc.constantFrom('asc', 'desc'),
          hasActiveFilters: fc.boolean(),
          showCategoryFilter: fc.boolean(),
        }),
        (isOpen, props) => {
          const { unmount } = render(
            <FilterSidebar
              isOpen={isOpen}
              onClose={() => {}}
              selectedCategoryId={props.selectedCategoryId}
              onCategorySelect={() => {}}
              sortBy={props.sortBy as 'newest' | 'oldest' | 'alphabetical'}
              sortDir={props.sortDir as 'asc' | 'desc'}
              onSortChange={() => {}}
              onSortDirectionToggle={() => {}}
              onResetFilters={() => {}}
              hasActiveFilters={props.hasActiveFilters}
              showCategoryFilter={props.showCategoryFilter}
            />
          );

          // Unmount the component
          unmount();

          // Body overflow should always be restored after unmount
          expect(document.body.style.overflow).toBe('');
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 11 (Transition): Body overflow changes when isOpen toggles
   * 
   * For any sequence of isOpen state changes, body overflow should
   * always reflect the current isOpen state.
   * 
   * Validates: Requirements 3.10, 16.6
   */
  test('body overflow reflects isOpen state through multiple toggles', () => {
    fc.assert(
      fc.property(
        fc.array(fc.boolean(), { minLength: 1, maxLength: 10 }), // Sequence of isOpen states
        fc.record({
          selectedCategoryId: fc.option(fc.uuid(), { nil: null }),
          sortBy: fc.constantFrom('newest', 'oldest', 'alphabetical'),
          sortDir: fc.constantFrom('asc', 'desc'),
          hasActiveFilters: fc.boolean(),
          showCategoryFilter: fc.boolean(),
        }),
        (isOpenSequence, props) => {
          const { rerender, unmount } = render(
            <FilterSidebar
              isOpen={isOpenSequence[0]}
              onClose={() => {}}
              selectedCategoryId={props.selectedCategoryId}
              onCategorySelect={() => {}}
              sortBy={props.sortBy as 'newest' | 'oldest' | 'alphabetical'}
              sortDir={props.sortDir as 'asc' | 'desc'}
              onSortChange={() => {}}
              onSortDirectionToggle={() => {}}
              onResetFilters={() => {}}
              hasActiveFilters={props.hasActiveFilters}
              showCategoryFilter={props.showCategoryFilter}
            />
          );

          // Test each state in the sequence
          for (const isOpen of isOpenSequence) {
            rerender(
              <FilterSidebar
                isOpen={isOpen}
                onClose={() => {}}
                selectedCategoryId={props.selectedCategoryId}
                onCategorySelect={() => {}}
                sortBy={props.sortBy as 'newest' | 'oldest' | 'alphabetical'}
                sortDir={props.sortDir as 'asc' | 'desc'}
                onSortChange={() => {}}
                onSortDirectionToggle={() => {}}
                onResetFilters={() => {}}
                hasActiveFilters={props.hasActiveFilters}
                showCategoryFilter={props.showCategoryFilter}
              />
            );

            // Body overflow should match the current isOpen state
            expect(document.body.style.overflow).toBe(isOpen ? 'hidden' : '');
          }

          // Cleanup
          unmount();
          expect(document.body.style.overflow).toBe('');
        }
      ),
      { numRuns: 10 }
    );
  });
});
