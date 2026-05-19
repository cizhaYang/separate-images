interface Window {
  showDirectoryPicker?: () => Promise<{
    getFileHandle: (
      name: string,
      options: { create: boolean },
    ) => Promise<{
      createWritable: () => Promise<{
        write: (data: Blob) => Promise<void>;
        close: () => Promise<void>;
      }>;
    }>;
  }>;
}
