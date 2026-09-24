import next from 'eslint-config-next';

const config = [...next, { ignores: ['.next/**', 'node_modules/**', 'screenshots/**'] }];

export default config;
