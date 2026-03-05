import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'

export default [
  {
    input: 'src/yah.ts',

    output: {
      file: 'dist/yah.js',
      format: 'iife',
      name: 'Yah',
      sourcemap: true
    },

    plugins: [
      resolve(),
      commonjs(),
      typescript()
    ]
  },

  {
    input: 'src/yah.ts',

    output: {
      file: 'dist/yah.min.js',
      format: 'iife',
      name: 'Yah'
    },

    plugins: [
      resolve(),
      commonjs(),
      typescript(),
      terser()
    ]
  }
]