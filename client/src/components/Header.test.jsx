import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

const mockLogout = jest.fn();
const mockUseAuth = jest.fn();

jest.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const renderHeader = () => {
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );
};

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows login and register links for guests', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: () => false,
      user: null,
      logout: mockLogout,
    });

    renderHeader();

    expect(screen.getByRole('link', { name: /workoutly/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
  });

  it('shows dashboard and user greeting for authenticated users', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: () => true,
      user: { name: 'Alice' },
      logout: mockLogout,
    });

    renderHeader();

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByText(/hi, alice/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument();
  });

  it('calls logout when logout button is clicked', async () => {
    const user = userEvent.setup();

    mockUseAuth.mockReturnValue({
      isAuthenticated: () => true,
      user: { name: 'Bob' },
      logout: mockLogout,
    });

    renderHeader();
    await user.click(screen.getByRole('button', { name: /logout/i }));

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
