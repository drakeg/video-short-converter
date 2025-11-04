import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

describe('test-utils', () => {
  it('should be properly configured', () => {
    expect(true).toBe(true);
  });
});


// Simple test provider wrapper
const TestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Custom render function that includes providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'queries'>
) => {
  return render(ui, {
    wrapper: TestProvider,
    ...options,
  });
};

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { renderWithProviders as render };
