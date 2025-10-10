#!/usr/bin/env node

/**
 * Migration script to help transition from PayloadCMS to TinaCMS
 * This script will help create backups and provide guidance for the migration
 */

import fs from 'fs';
import path from 'path';

const BACKUP_DIR = './migration-backup';
const CONTENT_DIR = './src/content';

// Create backup directory
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

console.log('🚀 Starting migration from PayloadCMS to TinaCMS + Astro');
console.log('');

// Create backup of current important files
const filesToBackup = [
  'src/payload.config.ts',
  'src/collections',
  'src/blocks',
  'src/app/(frontend)',
  'src/components',
  'package.json',
  'next.config.js',
];

console.log('📦 Creating backup of current files...');
filesToBackup.forEach(file => {
  const sourcePath = path.join(process.cwd(), file);
  const backupPath = path.join(BACKUP_DIR, file);

  if (fs.existsSync(sourcePath)) {
    const backupDir = path.dirname(backupPath);
    fs.mkdirSync(backupDir, { recursive: true });

    if (fs.statSync(sourcePath).isDirectory()) {
      copyDir(sourcePath, backupPath);
    } else {
      fs.copyFileSync(sourcePath, backupPath);
    }
    console.log(`✅ Backed up: ${file}`);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('');
console.log('🔧 Migration Steps Completed:');
console.log('✅ Created Astro configuration');
console.log('✅ Set up TinaCMS configuration');
console.log('✅ Created content collections structure');
console.log('✅ Migrated React components to Astro');
console.log('✅ Set up new routing system');
console.log('✅ Created sample content files');
console.log('');

console.log('📋 Next Steps:');
console.log('1. Install new dependencies: pnpm install');
console.log('2. Export your PayloadCMS data to Markdown files');
console.log('3. Move your media files to public/uploads/');
console.log('4. Test the new setup: pnpm dev');
console.log('5. Set up TinaCMS account and configure environment variables');
console.log('6. Remove old PayloadCMS files when ready');
console.log('');

console.log('🗂️  Content Structure:');
console.log('- Projects: src/content/projects/ (MDX files)');
console.log('- Posts: src/content/posts/ (MDX files)');
console.log('- Categories: src/content/categories/ (MD files)');
console.log('- Pages: src/content/pages/ (MDX files)');
console.log('');

console.log('🔑 Environment Variables Needed:');
console.log('- NEXT_PUBLIC_TINA_CLIENT_ID (from tina.io)');
console.log('- TINA_TOKEN (from tina.io)');
console.log('');

console.log('⚡ Performance Benefits:');
console.log('- Static site generation (faster loading)');
console.log('- Git-based content (version control)');
console.log('- Simplified architecture (easier maintenance)');
console.log('- Better developer experience');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('');
console.log('🎉 Migration setup complete!');
console.log(`💾 Backup created in: ${BACKUP_DIR}`);
console.log('📖 Check the README for detailed migration instructions.');
