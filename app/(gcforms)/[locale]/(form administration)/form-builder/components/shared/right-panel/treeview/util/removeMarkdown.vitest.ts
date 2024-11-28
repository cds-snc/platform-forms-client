import { describe, test, expect } from 'vitest';

import { removeMarkdown } from './itemType';

// Define the fixtures
const fixtures = [
  { input: '# Heading level 1', expected: 'Heading level 1' },
  { input: '## Heading level 2', expected: 'Heading level 2' },
  { input: '### Heading level 3', expected: 'Heading level 3' },
  { input: '#### Heading level 4', expected: 'Heading level 4' },
  { input: '##### Heading level 5', expected: 'Heading level 5' },
  { input: '###### Heading level 6', expected: 'Heading level 6' },
  { input: 'Hello, world!', expected: 'Hello, world!' },
  { input: '**Bold** text', expected: 'Bold text' },
  { input: '*Italic* text', expected: 'Italic text' },
  { input: '_Italic_ text', expected: 'Italic text' },
  { input: '~~Strikethrough~~ text', expected: 'Strikethrough text' },
  { input: '[Link](https://example.com)', expected: 'Link' },
  { input: '- List item', expected: 'List item' },

];

// Use describe.each to run the test for each fixture
describe.each(fixtures)('removeMarkdown', (fixture) => {
  test(`removes markdown from "${fixture.input}"`, () => {
    const result = removeMarkdown(fixture.input);
    expect(result).toBe(fixture.expected);
  });
});