import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { splitImageToBlobs } from './lib/imageSplit';
import { saveExportedImages } from './lib/saveFiles';

vi.mock('./lib/imageSplit', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./lib/imageSplit')>();

  return {
    ...actual,
    splitImageToBlobs: vi.fn(),
  };
});

vi.mock('./lib/saveFiles', () => ({
  saveExportedImages: vi.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    vi.mocked(splitImageToBlobs).mockResolvedValue({
      first: { fileName: 'photo-left.jpg', blob: new Blob(['left'], { type: 'image/jpeg' }) },
      second: { fileName: 'photo-right.jpg', blob: new Blob(['right'], { type: 'image/jpeg' }) },
    });
    vi.mocked(saveExportedImages).mockResolvedValue('directory');
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:preview'),
      revokeObjectURL: vi.fn(),
    });
    Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', {
      configurable: true,
      get: () => 1000,
    });
    Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', {
      configurable: true,
      get: () => 600,
    });
  });

  it('shows a single upload drop zone and split controls', () => {
    render(<App />);

    expect(screen.getByLabelText('上传图片')).toBeInTheDocument();
    expect(screen.getByLabelText('上传图片').closest('.empty-state')).not.toBeNull();
    expect(screen.getByRole('button', { name: '竖直分割' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '水平分割' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '确定保存' })).toBeDisabled();
  });

  it('shows a success toast after saving split images', async () => {
    const user = userEvent.setup();
    const file = new File(['image'], 'photo.jpg', { type: 'image/jpeg' });

    render(<App />);

    await user.upload(screen.getByLabelText('上传图片'), file);
    fireEvent.load(await screen.findByAltText('待分割预览'));
    await user.click(screen.getByRole('button', { name: '确定保存' }));

    await waitFor(() => {
      expect(screen.getByText('保存成功')).toBeInTheDocument();
    });
  });

  it('loads an image dropped onto the preview area', async () => {
    const file = new File(['image'], 'dropped-photo.jpg', { type: 'image/jpeg' });

    render(<App />);

    const dropZone = screen.getByLabelText('上传图片').closest('.preview-area');
    expect(dropZone).not.toBeNull();

    fireEvent.drop(dropZone as Element, {
      dataTransfer: {
        files: [file],
      },
    });

    expect(await screen.findByAltText('待分割预览')).toBeInTheDocument();
    expect(screen.getByText(/dropped-photo\.jpg/)).toBeInTheDocument();
  });
});
