import { render, screen } from '@testing-library/react';
import HomePage from '../page';

// Mock the ServicesOverview component
jest.mock('@/pages/ServicesOverview', () => {
  return function MockServicesOverview() {
    return <div data-testid="services-overview">Services Overview Component</div>;
  };
});

describe('HomePage', () => {
  it('renders ServicesOverview component', () => {
    render(<HomePage />);
    
    expect(screen.getByTestId('services-overview')).toBeInTheDocument();
    expect(screen.getByText('Services Overview Component')).toBeInTheDocument();
  });
});