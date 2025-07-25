// Mock services directory
export const authService = {
  login: jest.fn(),
  register: jest.fn(),
  googleLogin: jest.fn(),
  logout: jest.fn(),
  refreshToken: jest.fn(),
};