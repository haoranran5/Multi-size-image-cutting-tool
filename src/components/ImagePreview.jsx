import React from 'react';
import { XIcon, DownloadIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ImagePreview = ({ imageUrl, onClose }) => {
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = 'preview-image.png';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-[95vw] max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()} // 阻止点击内部区域关闭弹窗
      >
        {/* 关闭按钮 */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-10 sm:-top-12 right-0 text-white hover:bg-white/20 z-10 h-8 w-8 sm:h-10 sm:w-10 touch-manipulation"
          onClick={onClose}
        >
          <XIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        {/* 下载按钮 */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-10 sm:-top-12 right-10 sm:right-12 text-white hover:bg-white/20 z-10 h-8 w-8 sm:h-10 sm:w-10 touch-manipulation"
          onClick={handleDownload}
        >
          <DownloadIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        {/* 图片容器 */}
        <div className="overflow-auto flex-grow flex items-center justify-center">
          <img 
            src={imageUrl} 
            alt="预览图片" 
            className="max-w-full max-h-[85vh] sm:max-h-[80vh] object-contain rounded-lg shadow-xl"
            style={{ touchAction: 'manipulation' }}
          />
        </div>

        {/* 操作提示 */}
        <div className="mt-3 sm:mt-4 text-center text-white text-xs sm:text-sm">
          <p className="mb-1">点击图片外部区域关闭预览</p>
          <p className="text-gray-300">支持双指缩放查看细节</p>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
