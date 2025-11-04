import React from 'react';
import { render, screen } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

describe('test-utils', () => {
  it('renders children with router context', () => {
    renderWithProviders(<div data-testid="test">Test</div>);
    expect(screen.getByTestId('test')).toHaveTextContent('Test');
  });
});
