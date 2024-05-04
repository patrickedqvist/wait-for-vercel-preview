import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['index.js'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/index.js',
});
