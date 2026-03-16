import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

const shared = {
  input: 'src/index.js',
  external: ['redux', 'normalizr', 'redux-batched-actions'],
  plugins: [resolve()],
};

export default [
  {
    ...shared,
    output: [
      {
        file: 'lib/index.cjs.js',
        format: 'cjs',
      },
      {
        file: 'lib/index.esm.js',
        format: 'es',
      },
    ],
  },
  {
    ...shared,
    plugins: [...shared.plugins, terser()],
    output: {
      file: 'dist/entman.js',
      format: 'umd',
      name: 'entman',
      sourcemap: true,
      globals: {
        redux: 'Redux',
        normalizr: 'normalizr',
        'redux-batched-actions': 'reduxBatchedActions',
      },
    },
  },
];
