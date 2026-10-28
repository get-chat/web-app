import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder for React Router
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();

// jsdom does not implement ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
	observe: jest.fn(),
	unobserve: jest.fn(),
	disconnect: jest.fn(),
}));

// Fetched by the login page and Main on mount (MT 5.3); no backend in tests
jest.mock('./src/api/brandingApi', () => ({
	fetchBranding: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('./src/VoiceRecorder', () => ({
	__esModule: true,
	default: jest.fn().mockImplementation(() => ({
		startRecording: jest.fn(),
		stopRecording: jest.fn(),
	})),
}));

jest.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));
