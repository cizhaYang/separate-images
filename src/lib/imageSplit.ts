export type SplitDirection = 'vertical' | 'horizontal';

export type SplitRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SplitInput = {
  imageWidth: number;
  imageHeight: number;
  splitDirection: SplitDirection;
  splitRatio: number;
};

export type SplitFileNameInput = {
  originalName: string;
  splitDirection: SplitDirection;
  exportMime: string;
};

export type SplitImageInput = {
  image: CanvasImageSource;
  imageWidth: number;
  imageHeight: number;
  originalName: string;
  splitDirection: SplitDirection;
  splitRatio: number;
};

export type SplitImageResult = {
  first: {
    fileName: string;
    blob: Blob;
  };
  second: {
    fileName: string;
    blob: Blob;
  };
};

export function getSplitRects(_input: SplitInput): [SplitRect, SplitRect] {
  const { imageWidth, imageHeight, splitDirection, splitRatio } = _input;
  const ratio = Math.min(1, Math.max(0, splitRatio));

  if (splitDirection === 'vertical') {
    const splitX = Math.round(imageWidth * ratio);

    return [
      { x: 0, y: 0, width: splitX, height: imageHeight },
      { x: splitX, y: 0, width: imageWidth - splitX, height: imageHeight },
    ];
  }

  const splitY = Math.round(imageHeight * ratio);

  return [
    { x: 0, y: 0, width: imageWidth, height: splitY },
    { x: 0, y: splitY, width: imageWidth, height: imageHeight - splitY },
  ];
}

export function buildSplitFileNames(input: SplitFileNameInput) {
  const extension = getExtensionForMime(input.exportMime);
  const baseName = stripExtension(input.originalName);
  const [firstSuffix, secondSuffix] =
    input.splitDirection === 'vertical' ? ['left', 'right'] : ['top', 'bottom'];

  return {
    first: `${baseName}-${firstSuffix}.${extension}`,
    second: `${baseName}-${secondSuffix}.${extension}`,
  };
}

export function getExportMime(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (extension === 'jpg' || extension === 'jpeg') {
    return 'image/jpeg';
  }

  if (extension === 'png') {
    return 'image/png';
  }

  if (extension === 'webp') {
    return 'image/webp';
  }

  return 'image/png';
}

export async function splitImageToBlobs(input: SplitImageInput): Promise<SplitImageResult> {
  const exportMime = getExportMime(input.originalName);
  const [firstRect, secondRect] = getSplitRects({
    imageWidth: input.imageWidth,
    imageHeight: input.imageHeight,
    splitDirection: input.splitDirection,
    splitRatio: input.splitRatio,
  });
  const names = buildSplitFileNames({
    originalName: input.originalName,
    splitDirection: input.splitDirection,
    exportMime,
  });
  const [firstBlob, secondBlob] = await Promise.all([
    renderRectToBlob(input.image, firstRect, exportMime),
    renderRectToBlob(input.image, secondRect, exportMime),
  ]);

  return {
    first: {
      fileName: names.first,
      blob: firstBlob,
    },
    second: {
      fileName: names.second,
      blob: secondBlob,
    },
  };
}

function stripExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf('.');

  return dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
}

function getExtensionForMime(mime: string) {
  if (mime === 'image/jpeg') {
    return 'jpg';
  }

  if (mime === 'image/webp') {
    return 'webp';
  }

  return 'png';
}

async function renderRectToBlob(image: CanvasImageSource, rect: SplitRect, mime: string) {
  if (rect.width <= 0 || rect.height <= 0) {
    throw new Error('分割位置不能位于图片边界');
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('当前浏览器不支持 Canvas 导出');
  }

  canvas.width = rect.width;
  canvas.height = rect.height;
  context.drawImage(image, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mime, 0.95);
  });

  if (!blob) {
    throw new Error('图片导出失败');
  }

  return blob;
}
