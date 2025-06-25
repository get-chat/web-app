import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder for React Router
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Other global mocks if needed
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();

jest.mock('./src/VoiceRecorder', () => ({
	__esModule: true,
	default: jest.fn().mockImplementation(() => ({
		startRecording: jest.fn(),
		stopRecording: jest.fn(),
	})),
}));
