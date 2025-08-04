globalThis.import = {
  meta: {
    env: {
      VITE_API_URL: 'http://localhost:8082/api',
      VITE_GOOGLE_CLIENT_ID: 'test-client-id',
    }
  }
};

const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

let store = {};
const localStorageMock = {
  getItem: (key) => store[key] || null,
  setItem: (key, value) => { store[key] = value; },
  removeItem: (key) => { delete store[key]; },
  clear: () => { store = {}; },
};
global.localStorage = localStorageMock;

process.env.VITE_API_URL = 'http://localhost:8082/api';
process.env.VITE_GOOGLE_CLIENT_ID = 'test-client-id';