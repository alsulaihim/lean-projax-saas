import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      // Backup and temporary files
      '**/*-original.*',
      '**/*-temp.*',
      '**/*reordered*.*',
      // Test and script files (using CommonJS)
      'scripts/**',
      'test-*.js',
      'create-*.js',
      '*.test.js',
      '*.spec.js',
      // Prisma seed files (can use any types for flexibility)
      'prisma/seed*.ts',
      'prisma/fix-*.ts',
      // Marketing site generated files
      'marketing/next-env.d.ts',
      'marketing/.next/**',
    ],
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-empty-object-type': 'warn',
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]

export default eslintConfig
