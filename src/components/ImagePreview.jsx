import React from 'react';
import { XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ImagePreview = ({ imageUrl, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-[90vw] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()} // 阻止点击内部区域关闭弹窗
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-10 right-0 text-white hover:bg-white/20 z-10"
          onClick={onClose}
        >
          <XIcon className="h-6 w-6" />
        </Button>
        <div className="overflow-auto flex-grow flex items-center justify-center">
          <img 
            src={imageUrl} 
            alt="预览图片" 
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-xl"
          />
        </div>
        <div className="mt-4 text-center text-white text-sm">
          点击图片外部区域关闭预览
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
