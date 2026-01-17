const fs = require('fs');
const path = require('path');

const file = process.argv[2];
if (!file) {
  console.error('Usage: npm run make-test <path/to/Component.tsx>');
  process.exit(1);
}

const absolutePath = path.resolve(file);
const dir = path.dirname(absolutePath);
const ext = path.extname(absolutePath);
const base = path.basename(absolutePath, ext);
const testFile = path.join(dir, `${base}.test${ext}`);

if (fs.existsSync(testFile)) {
  console.error(`Error: Test file ${testFile} already exists.`);
  process.exit(1);
}

// Basic boilerplate logic
const content = `import React from 'react';
import { render } from '@testing-library/react-native';
import ${base} from './${base}';

describe('${base}', () => {
  it('renders correctly', () => {
    // Basic render test
    const { toJSON } = render(<${base} />);
    expect(toJSON()).toBeTruthy();
  });
});
`;

fs.writeFileSync(testFile, content);
console.log(`✅ Created test file: ${testFile}`);
