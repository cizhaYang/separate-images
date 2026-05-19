import { describe, expect, it } from 'vitest';
import { buildSplitFileNames, getExportMime, getSplitRects } from './imageSplit';

describe('getSplitRects', () => {
  it('splits vertical images into left and right rectangles', () => {
    expect(
      getSplitRects({
        imageWidth: 1000,
        imageHeight: 600,
        splitDirection: 'vertical',
        splitRatio: 0.3,
      }),
    ).toEqual([
      { x: 0, y: 0, width: 300, height: 600 },
      { x: 300, y: 0, width: 700, height: 600 },
    ]);
  });

  it('splits horizontal images into top and bottom rectangles', () => {
    expect(
      getSplitRects({
        imageWidth: 800,
        imageHeight: 500,
        splitDirection: 'horizontal',
        splitRatio: 0.4,
      }),
    ).toEqual([
      { x: 0, y: 0, width: 800, height: 200 },
      { x: 0, y: 200, width: 800, height: 300 },
    ]);
  });
});

describe('buildSplitFileNames', () => {
  it('keeps the original extension for vertical split exports', () => {
    expect(
      buildSplitFileNames({
        originalName: 'holiday.jpg',
        splitDirection: 'vertical',
        exportMime: 'image/jpeg',
      }),
    ).toEqual({
      first: 'holiday-left.jpg',
      second: 'holiday-right.jpg',
    });
  });

  it('switches to png when the export mime is png', () => {
    expect(
      buildSplitFileNames({
        originalName: 'holiday.jpg',
        splitDirection: 'horizontal',
        exportMime: 'image/png',
      }),
    ).toEqual({
      first: 'holiday-top.png',
      second: 'holiday-bottom.png',
    });
  });
});

describe('getExportMime', () => {
  it('keeps jpeg for supported jpeg input', () => {
    expect(getExportMime('photo.jpeg')).toBe('image/jpeg');
  });

  it('falls back to png for unsupported extensions', () => {
    expect(getExportMime('photo.bmp')).toBe('image/png');
  });
});
