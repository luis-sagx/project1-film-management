const js = require('@eslint/js');

module.exports = [
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
    },
    rules: {
      ...js.configs.recommended.rules,
      semi: ['error', 'always'], // siempre usar punto y coma
      quotes: ['error', 'single'], // usar comillas simples
      'no-unused-vars': ['warn'], // no declarar variables sin usar
      'no-undef': ['error'], // prohibir el uso de variables no definidas
      'no-multi-spaces': ['error'], // no permitir espacios innecesarios
      curly: ['error', 'all'], // requerir llaves siempre en bloques (if, for, etc.)
      eqeqeq: ['error', 'always'], // exigir uso de === y !== en lugar de == y !=
      'no-console': ['warn'], // no permitir console.log en código final
    },
  },
];


// corregir automatico con: npm run lint -- --fix
