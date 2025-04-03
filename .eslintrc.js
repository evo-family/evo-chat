module.exports = {
  root: true,
  extends: ['react-app', 'react-app/jest'],
  plugins: ['simple-import-sort'],
  settings: {
    react: {
      version: '17.0.2',
    },
  },
  rules: {
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // Third party packages, `react` related packages come first.
          ['^react', '^@?\\w'],
          // Side effect imports.
          ['^\\u0000'],
          // Relative imports. e.g. `@|src|..|.` started imports, put same-folder imports and `..`, `.` at last.
          [
            '^(@|src)([^.]+$)',
            '^\\.\\.(?!/?$)',
            '^\\.\\./?$',
            '^\\./(?=.*/)(?!/?$)',
            '^\\.(?!/?$)',
            '^\\./?$',
          ],
          // Assets imports
          ['^\\S+\\.(?:(png|svg|jpg|jpeg|gif))', '^.+\\.(scss|less|css)$'],
        ],
      },
    ],
    'import/newline-after-import': ['error', { count: 1 }],
    'import/no-duplicates': 'error',
    'import/no-anonymous-default-export': 'off',
    'react/jsx-key': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-useless-constructor': 'off',
    'react/no-array-index-key': 'off',
    'react/jsx-pascal-case': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'jsx-a11y/alt-text': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/iframe-has-title': 'off',
    'no-unused-vars': 'off',
    'no-empty-pattern': 'off',
    'no-useless-escape': 'off',
    'no-template-curly-in-string': 'off',
    'eqeqeq': 'off',
  },
  overrides: [
    {
      files: ['{packages,projects}/*/**/*.js'],
      rules: {
        'import/no-commonjs': 'off',
      },
    },
    {
      files: ['{packages,projects}/*/tests/**/*'],
      rules: {
        'no-magic-numbers': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
      },
    },
    {
      files: ['{packages,projects}/*/tests/examples?/**/*', 'examples/**/*'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
