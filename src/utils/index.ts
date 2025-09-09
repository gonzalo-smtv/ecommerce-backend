export const getVersionFromPackageJson = (): string => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const packageJson = require('../../package.json');
  return packageJson.version || 'unknown';
};
