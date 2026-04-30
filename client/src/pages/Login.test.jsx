import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import api from '../services/api';

const mockLogin = jest.fn();
const mockNavigate = jest.fn();
const mockUseAuth = jest.fn();
const mockToastError = jest.fn();

jest.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
  getErrorMessage: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    error: (...args) => mockToastError(...args),
  },
}));

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderLogin = (initialEntries = ['/login']) => {
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <Login />
    </MemoryRouter>
  );
};

describe('Login page interaction tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      login: mockLogin.mockReturnValue({ success: true }),
      isAuthenticated: () => false,
      loading: false,
      user: null,
    });
  });

  it('allows the user to type email and password', async () => {
    const user = userEvent.setup();

    renderLogin();

    await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/password/i), 'supersecret');

    expect(screen.getByLabelText(/email/i)).toHaveValue('alice@example.com');
    expect(screen.getByLabelText(/password/i)).toHaveValue('supersecret');
  });

  it('submits valid credentials once with the correct payload', async () => {
    const user = userEvent.setup();

    api.post.mockResolvedValue({
      data: {
        token: 'token-123',
        user: { name: 'Alice' },
      },
    });

    renderLogin();

    await user.type(screen.getByLabelText(/email/i), 'Alice@Example.com');
    await user.type(screen.getByLabelText(/password/i), 'supersecret');
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'alice@example.com',
      password: 'supersecret',
    });
    expect(mockLogin).toHaveBeenCalledTimes(1);
    expect(mockLogin).toHaveBeenCalledWith({ name: 'Alice' }, 'token-123');
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  it('shows validation errors and does not submit when fields are empty', async () => {
    const user = userEvent.setup();

    renderLogin();

    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
    expect(mockLogin).not.toHaveBeenCalled();
  });
});