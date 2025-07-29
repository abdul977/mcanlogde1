const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for resolving packages with exports field
config.resolver.unstable_enablePackageExports = true;

// Add custom resolver for @ide/backoff
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.alias = {
  '@ide/backoff': path.resolve(__dirname, 'node_modules/@ide/backoff/build/backoff.js'),
};

module.exports = config;
