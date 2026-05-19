export type ExportedImage = {
  fileName: string;
  blob: Blob;
};

type FileSystemWritableFileStream = {
  write: (data: Blob) => Promise<void>;
  close: () => Promise<void>;
};

type FileSystemFileHandle = {
  createWritable: () => Promise<FileSystemWritableFileStream>;
};

type FileSystemDirectoryHandle = {
  getFileHandle: (name: string, options: { create: boolean }) => Promise<FileSystemFileHandle>;
};

export async function saveExportedImages(images: ExportedImage[]) {
  if (canPickDirectory()) {
    try {
      const directory = (await window.showDirectoryPicker?.()) as FileSystemDirectoryHandle;

      await Promise.all(
        images.map(async (image) => {
          const fileHandle = await directory.getFileHandle(image.fileName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(image.blob);
          await writable.close();
        }),
      );

      return 'directory' as const;
    } catch (error) {
      if (!isAbortError(error)) {
        downloadImages(images);
        return 'download' as const;
      }

      throw error;
    }
  }

  downloadImages(images);
  return 'download' as const;
}

function canPickDirectory() {
  return typeof window.showDirectoryPicker === 'function';
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}

function downloadImages(images: ExportedImage[]) {
  images.forEach((image) => {
    const url = URL.createObjectURL(image.blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = image.fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });
}
