import { describe, it, expect } from 'vitest';
import { formClosingDateEst } from './utcToEst';

describe('utcToEst', () => {
  it('should convert UTC date to EST date in English', () => {
    const utcDate = '2023-10-01T12:00:00Z';
    const lang = 'en';
    const result = formClosingDateEst(utcDate, lang);
    expect(result).toStrictEqual({
      "day": "01",
      "hour": "08",
      "minute": "00",
      "month": "October",
      "year": "2023",
    });
  });

  it('should convert UTC date to EST date in French', () => {
    const utcDate = '2023-10-01T12:00:00Z';
    const lang = 'fr';
    const result = formClosingDateEst(utcDate, lang);
    expect(result).toStrictEqual({
      "day": "01",
      "hour": "08",
      "minute": "00",
      "month": "octobre",
      "year": "2023",
    });
  });

  it('should handle invalid date input', () => {
    const utcDate = 'invalid-date';
    const lang = 'en';
    expect(() => formClosingDateEst(utcDate, lang)).toThrow();
  });
});