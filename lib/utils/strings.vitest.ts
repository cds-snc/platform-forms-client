import { stripMarkdown, stripEntities, stripLineBreaks, toPlainText } from '@root/lib/utils/strings';
import { describe, test, expect } from 'vitest';

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
    const result = stripMarkdown(fixture.input);
    expect(result).toBe(fixture.expected);
  });
});

describe('stripEntities', () => {
  test('strips HTML entities', () => {
    expect(stripEntities('Hello&#32;world')).toBe('Hello world');
    expect(stripEntities('Tom &amp; Jerry')).toBe('Tom & Jerry');
    expect(stripEntities('5 &lt; 10')).toBe('5 < 10');
    expect(stripEntities('10 &gt; 5')).toBe('10 > 5');
    expect(stripEntities('&quot;quoted&quot;')).toBe('"quoted"');
    expect(stripEntities('It&#39;s great')).toBe("It's great");
  });

  test('handles multiple entities in one string', () => {
    expect(stripEntities('&lt;div&gt; &amp; &quot;text&quot;')).toBe('<div> & "text"');
  });

  test('returns unchanged text when no entities present', () => {
    expect(stripEntities('Hello world')).toBe('Hello world');
  });

  test('handles empty string', () => {
    expect(stripEntities('')).toBe('');
  });
});

describe('stripLineBreaks', () => {
  test('removes Unix line breaks', () => {
    expect(stripLineBreaks('Hello\nworld')).toBe('Hello world');
  });

  test('removes Windows line breaks', () => {
    expect(stripLineBreaks('Hello\r\nworld')).toBe('Hello world');
  });

  test('removes Mac (old) line breaks', () => {
    expect(stripLineBreaks('Hello\rworld')).toBe('Hello world');
  });

  test('handles multiple line breaks', () => {
    expect(stripLineBreaks('Line 1\n\nLine 2\nLine 3')).toBe('Line 1  Line 2 Line 3');
  });

  test('handles mixed line break types', () => {
    expect(stripLineBreaks('Line 1\rLine 2\nLine 3\r\nLine 4')).toBe('Line 1 Line 2 Line 3 Line 4');
  });

  test('returns unchanged text when no line breaks present', () => {
    expect(stripLineBreaks('Hello world')).toBe('Hello world');
  });

  test('handles empty string', () => {
    expect(stripLineBreaks('')).toBe('');
  });
});

describe('toPlainText', () => {
  test('strips markdown, entities, and line breaks together', () => {
    const input = '# Hello &amp; Welcome\n**Bold** text with&#32;entities';
    const expected = 'Hello & Welcome Bold text with entities';
    expect(toPlainText(input)).toBe(expected);
  });

  test('handles complex markdown with entities', () => {
    const input = '## [Link](https://example.com) &lt;div&gt;\n- List item';
    const expected = 'Link <div> List item';
    expect(toPlainText(input)).toBe(expected);
  });

  test('handles multiline markdown with entities', () => {
    const input = '**Bold text**\n&amp;\n*Italic text*';
    const expected = 'Bold text & Italic text';
    expect(toPlainText(input)).toBe(expected);
  });

  test('collapses multiple spaces after processing', () => {
    const input = '**Bold**   text\n\nwith    spaces';
    const result = toPlainText(input);
    expect(result).not.toContain('  '); // No double spaces
  });

  test('handles empty string', () => {
    expect(toPlainText('')).toBe('');
  });

  test('handles plain text without formatting', () => {
    expect(toPlainText('Hello world')).toBe('Hello world');
  });

  test('trims leading and trailing whitespace', () => {
    const input = '  # Heading  \n\n';
    const result = toPlainText(input);
    expect(result).toBe('Heading');
  });
});