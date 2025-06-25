import '@testing-library/jest-dom';
import React from "react";
import { TextEncoder, TextDecoder } from 'util';

global.React = React;

// Polyfill TextEncoder/TextDecoder for React Router
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Other global mocks if needed
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();
