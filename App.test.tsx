import React from 'react';
import { render } from '@testing-library/react-native';
import App from './App';

// Mock dependencies
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: jest.fn(({ children }) => children),
    SafeAreaConsumer: jest.fn(({ children }) => children(inset)),
    useSafeAreaInsets: jest.fn(() => inset),
    useSafeAreaFrame: jest.fn(() => ({ x: 0, y: 0, width: 390, height: 844 })),
    SafeAreaInsetsContext: React.createContext(inset),
  };
});

jest.mock('./src/screens/HomeScreen', () => 'HomeScreen');

describe('App', () => {
  it('renders correctly', () => {
    const tree = render(<App />).toJSON();
    expect(tree).toBeTruthy();
  });
});
