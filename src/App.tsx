import { ChangeEvent, DragEvent, PointerEvent, useCallback, useEffect, useRef, useState } from 'react';
import { SplitDirection, splitImageToBlobs } from './lib/imageSplit';
import { saveExportedImages } from './lib/saveFiles';

const MIN_SPLIT_RATIO = 0.02;
const MAX_SPLIT_RATIO = 0.98;

type ExportStatus = 'idle' | 'processing' | 'success' | 'error';

export default function App() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [splitDirection, setSplitDirection] = useState<SplitDirection>('vertical');
  const [splitRatio, setSplitRatio] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('上传一张图片后开始分割。');
  const [toastMessage, setToastMessage] = useState('');
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    return () => {
      if (sourceUrl) {
        URL.revokeObjectURL(sourceUrl);
      }
    };
  }, [sourceUrl]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToastMessage('');
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const loadFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        setExportStatus('error');
        setStatusMessage('请选择图片文件。');
        return;
      }

      if (sourceUrl) {
        URL.revokeObjectURL(sourceUrl);
      }

      setSourceFile(file);
      setSourceUrl(URL.createObjectURL(file));
      setImageSize({ width: 0, height: 0 });
      setSplitRatio(0.5);
      setExportStatus('idle');
      setToastMessage('');
      setStatusMessage('拖动分割线调整位置。');
    },
    [sourceUrl],
  );

  const updateRatioFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const image = imageRef.current;

      if (!image) {
        return;
      }

      const rect = image.getBoundingClientRect();
      const rawRatio =
        splitDirection === 'vertical'
          ? (clientX - rect.left) / rect.width
          : (clientY - rect.top) / rect.height;

      setSplitRatio(clampRatio(rawRatio));
    },
    [splitDirection],
  );

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      updateRatioFromPointer(event.clientX, event.clientY);
    };
    const stopDragging = () => setIsDragging(false);

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopDragging);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopDragging);
    };
  }, [isDragging, updateRatioFromPointer]);

  const handleFileDragOver = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    const [file] = Array.from(event.dataTransfer.files);

    if (file) {
      loadFile(file);
    }
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = Array.from(event.target.files ?? []);
    if (file) {
      loadFile(file);
    }
  };

  const handleSplitPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(true);
    updateRatioFromPointer(event.clientX, event.clientY);
  };

  const handleExport = async () => {
    if (!sourceFile || !imageRef.current || !imageSize.width || !imageSize.height) {
      return;
    }

    try {
      setExportStatus('processing');
      setStatusMessage('正在生成分割图片...');

      const result = await splitImageToBlobs({
        image: imageRef.current,
        imageWidth: imageSize.width,
        imageHeight: imageSize.height,
        originalName: sourceFile.name,
        splitDirection,
        splitRatio,
      });
      const saveMethod = await saveExportedImages([
        result.first,
        result.second,
      ]);

      setExportStatus('success');
      setToastMessage('保存成功');
      setStatusMessage(saveMethod === 'directory' ? '图片已保存到选择的文件夹。' : '浏览器已开始下载两张图片。');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setExportStatus('idle');
        setStatusMessage('已取消保存。');
        return;
      }

      setExportStatus('error');
      setStatusMessage(error instanceof Error ? error.message : '导出失败，请重试。');
    }
  };

  const splitLineStyle =
    splitDirection === 'vertical'
      ? { left: `${splitRatio * 100}%` }
      : { top: `${splitRatio * 100}%` };

  return (
    <main className="app-shell">
      <section className="tool-panel" aria-label="图片分割工具">
        <header className="app-header">
          <div>
            <h1>图片分割工具</h1>
            <p>上传单张图片，拖动分割线后导出两张图片。</p>
          </div>
        </header>

        <div className="toolbar">
          <div className="segmented-control" aria-label="分割方向">
            <button
              aria-pressed={splitDirection === 'vertical'}
              className={splitDirection === 'vertical' ? 'active' : ''}
              onClick={() => setSplitDirection('vertical')}
              type="button"
            >
              竖直分割
            </button>
            <button
              aria-pressed={splitDirection === 'horizontal'}
              className={splitDirection === 'horizontal' ? 'active' : ''}
              onClick={() => setSplitDirection('horizontal')}
              type="button"
            >
              水平分割
            </button>
          </div>

          <div className="split-readout">
            <span>位置</span>
            <strong>{Math.round(splitRatio * 100)}%</strong>
          </div>

          <button
            className="primary-action"
            disabled={!sourceFile || exportStatus === 'processing'}
            onClick={handleExport}
            type="button"
          >
            确定保存
          </button>
        </div>

        <div
          className={`preview-area ${sourceUrl ? 'has-image' : ''}`}
          onDragOver={handleFileDragOver}
          onDrop={handleDrop}
        >
          {sourceUrl ? (
            <div className="image-stage">
              <img
                alt="待分割预览"
                draggable={false}
                onLoad={(event) => {
                  setImageSize({
                    width: event.currentTarget.naturalWidth,
                    height: event.currentTarget.naturalHeight,
                  });
                }}
                ref={imageRef}
                src={sourceUrl}
              />
              <button
                aria-label="拖动分割线"
                className={`split-line ${splitDirection} ${isDragging ? 'dragging' : ''}`}
                onPointerDown={handleSplitPointerDown}
                style={splitLineStyle}
                type="button"
              />
            </div>
          ) : (
            <label className="empty-state">
              <p>将图片拖到这里，或点击上传图片。</p>
              <input
                aria-label="上传图片"
                accept="image/*"
                onChange={handleFileInputChange}
                type="file"
              />
            </label>
          )}
        </div>

        <footer className={`status-bar ${exportStatus}`}>
          <span>
            {sourceFile ? sourceFile.name : '未选择图片'}
            {imageSize.width > 0 ? ` · ${imageSize.width} x ${imageSize.height}` : ''}
          </span>
          <strong>{statusMessage}</strong>
        </footer>

        {toastMessage ? (
          <div className="toast" role="status" aria-live="polite">
            {toastMessage}
          </div>
        ) : null}
      </section>
    </main>
  );
}

function clampRatio(value: number) {
  return Math.min(MAX_SPLIT_RATIO, Math.max(MIN_SPLIT_RATIO, value));
}
