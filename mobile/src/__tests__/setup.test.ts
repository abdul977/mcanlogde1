/**
 * Test Setup Verification
 * 
 * This test file verifies that the testing infrastructure is properly configured
 * and all mocks are working correctly.
 */

describe('Test Setup', () => {
  it('should have proper Jest configuration', () => {
    expect(jest).toBeDefined();
    expect(jest.fn).toBeDefined();
    expect(jest.mock).toBeDefined();
  });

  it('should have React Native Testing Library available', () => {
    const { render } = require('@testing-library/react-native');
    expect(render).toBeDefined();
  });

  it('should have mocked Expo SecureStore', () => {
    const SecureStore = require('expo-secure-store');
    expect(SecureStore.setItemAsync).toBeDefined();
    expect(SecureStore.getItemAsync).toBeDefined();
    expect(SecureStore.deleteItemAsync).toBeDefined();
  });

  it('should have mocked React Navigation', () => {
    const { useNavigation } = require('@react-navigation/native');
    const navigation = useNavigation();
    expect(navigation.navigate).toBeDefined();
    expect(navigation.goBack).toBeDefined();
  });

  it('should have mocked axios', () => {
    const axios = require('axios');
    expect(axios.create).toBeDefined();
    expect(axios.get).toBeDefined();
    expect(axios.post).toBeDefined();
  });

  it('should suppress console warnings and errors', () => {
    expect(console.warn).toBeDefined();
    expect(console.error).toBeDefined();
    
    // These should be mocked and not actually log
    console.warn('Test warning');
    console.error('Test error');
    
    expect(console.warn).toHaveBeenCalledWith('Test warning');
    expect(console.error).toHaveBeenCalledWith('Test error');
  });

  it('should have fake timers enabled', () => {
    expect(jest.isMockFunction(setTimeout)).toBe(true);
  });
});
