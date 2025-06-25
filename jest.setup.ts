import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder for React Router
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();

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
