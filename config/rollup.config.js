import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/pact-consumer-dsl/pact.js',
  format: 'cjs',
  dest: 'dist/pact-consumer-js-dsl.js',
  plugins: [
    babel({
      presets: [ 'es2015-rollup' ],
      babelrc: false
    })
  ]
}
