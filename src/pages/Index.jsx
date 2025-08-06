import React, { useState, useRef } from 'react';
import { UploadIcon, ScissorsIcon, DownloadIcon, Trash2Icon, PlusIcon, Loader2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import ImagePreview from '@/components/ImagePreview';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/translations';

const ImageSlicer = () => {
  const { language } = useLanguage();
  
  const PRESET_SIZES = [
    { id: 1, width: 1200, height: 510, name: t('wechatHeader', language) },
    { id: 2, width: 1242, height: 1660, name: t('xiaohongshu', language) },
    { id: 3, width: 800, height: 800, name: t('ecommerce', language) },
    { id: 4, width: 320, height: 320, name: t('instagram', language) },
    { id: 5, width: 320, height: 320, name: t('threads', language) },
    { id: 6, width: 170, height: 170, name: t('facebook', language) },
    { id: 7, width: 400, height: 400, name: t('twitter', language) },
    { id: 8, width: 400, height: 400, name: t('linkedin', language) },
    { id: 9, width: 800, height: 800, name: t('youtube', language) },
    { id: 10, width: 200, height: 200, name: t('tiktok', language) },
    { id: 11, width: 192, height: 192, name: t('whatsapp', language) },
    { id: 12, width: 512, height: 512, name: t('telegram', language) },
    { id: 13, width: 128, height: 128, name: t('discord', language) },
    { id: 14, width: 300, height: 300, name: t('snapchat', language) },
    { id: 15, width: 165, height: 165, name: t('pinterest', language) },
  ];

  const [originalImage, setOriginalImage] = useState(null);
  const [imageInfo, setImageInfo] = useState({ width: 0, height: 0, size: 0, format: '' });
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [customSizes, setCustomSizes] = useState([]);
  const [sliceSettings, setSliceSettings] = useState({
    mode: 'fit',
    fillColor: '#FFFFFF',
    outputFormat: 'original'
  });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const fileInputRef = useRef(null);
  const [customSize, setCustomSize] = useState({ width: '', height: '', name: '' });
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [originalFile, setOriginalFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
      alert(t('uploadImageError', language));
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      alert(t('fileSizeError', language));
      return;
    }
    
    setOriginalFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(e.target.result);
        setImageInfo({
          width: img.width,
          height: img.height,
          size: (file.size / 1024).toFixed(1) + 'KB',
          format: file.type.split('/')[1].toUpperCase()
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      fileInputRef.current.files = e.dataTransfer.files;
      handleFileUpload(e);
    }
  };

  const addCustomSize = () => {
    if (!customSize.width || !customSize.height) return;
    
    const newSize = {
      id: Date.now(),
      width: parseInt(customSize.width),
      height: parseInt(customSize.height),
      name: customSize.name || `${t('custom', language)} ${customSize.width}x${customSize.height}`
    };
    
    setCustomSizes([...customSizes, newSize]);
    setSelectedSizes([...selectedSizes, newSize]);
    setCustomSize({ width: '', height: '', name: '' });
  };

  const removeSize = (id) => {
    setSelectedSizes(selectedSizes.filter(size => size.id !== id));
    
    // 只有自定义尺寸才需要从 customSizes 中移除
    // 预设尺寸的 id 是 1-15，自定义尺寸的 id 是时间戳
    if (id > 15) {
      setCustomSizes(customSizes.filter(size => size.id !== id));
    }
  };

  const processImage = (img, width, height, mode, fillColor) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      const imgAspect = img.width / img.height;
      const targetAspect = width / height;
      
      let drawWidth, drawHeight, offsetX, offsetY;
      
      if (mode === 'crop') {
        // 裁剪模式：填充背景色
        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, width, height);
        
        if (imgAspect > targetAspect) {
          drawHeight = height;
          drawWidth = height * imgAspect;
          offsetX = -(drawWidth - width) / 2;
          offsetY = 0;
        } else {
          drawWidth = width;
          drawHeight = width / imgAspect;
          offsetX = 0;
          offsetY = -(drawHeight - height) / 2;
        }
      } else if (mode === 'circle') {
        // 圆形剪裁：确保输出完整的圆形，图片放大填满圆形区域
        const size = Math.min(width, height); // 使用较小的尺寸确保正方形
        
        // 重新设置画布为正方形
        canvas.width = size;
        canvas.height = size;
        
        // 计算缩放比例，确保图片能完全覆盖圆形区域
        const scale = Math.max(size / img.width, size / img.height);
        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;
        const offsetX = (size - drawWidth) / 2;
        const offsetY = (size - drawHeight) / 2;
        
        // 绘制图片（放大并居中）
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        
        // 创建圆形遮罩
        ctx.globalCompositeOperation = 'destination-in';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // 恢复绘制模式
        ctx.globalCompositeOperation = 'source-over';
        
        // 圆形剪裁强制使用PNG格式以支持透明度，最高质量
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        resolve(dataUrl);
        return;
      } else {
        // fit 模式：填充背景色
        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, width, height);
        
        if (imgAspect > targetAspect) {
          drawWidth = width;
          drawHeight = width / imgAspect;
          offsetX = 0;
          offsetY = (height - drawHeight) / 2;
        } else {
          drawHeight = height;
          drawWidth = height * imgAspect;
          offsetX = (width - drawWidth) / 2;
          offsetY = 0;
        }
      }
      
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      
      const dataUrl = canvas.toDataURL(`image/${sliceSettings.outputFormat === 'original' ? imageInfo.format.toLowerCase() : sliceSettings.outputFormat}`, 1.0);
      resolve(dataUrl);
    });
  };

  const startSlicing = async () => {
    if (!originalImage) return;
    
    setProcessing(true);
    setProgress(0);
    setResults([]);
    
    const img = new Image();
    img.src = originalImage;
    
    await new Promise(resolve => {
      img.onload = resolve;
    });
    
    const generatedResults = [];
    
    for (let i = 0; i < selectedSizes.length; i++) {
      const size = selectedSizes[i];
      const dataUrl = await processImage(
        img, 
        size.width, 
        size.height, 
        sliceSettings.mode, 
        sliceSettings.fillColor
      );
      
      // 确定文件扩展名：圆形剪裁强制使用PNG
      const fileExtension = sliceSettings.mode === 'circle' ? 'png' : 
        (sliceSettings.outputFormat === 'original' ? imageInfo.format.toLowerCase() : sliceSettings.outputFormat);
      
      generatedResults.push({
        id: i + 1,
        width: size.width,
        height: size.height,
        name: size.name,
        dataUrl,
        fileName: `${size.name.replace(/\s+/g, '_')}_${size.width}x${size.height}.${fileExtension}`
      });
      
      setProgress(Math.round(((i + 1) / selectedSizes.length) * 100));
    }
    
    setResults(generatedResults);
    setProcessing(false);
  };

  const resetAll = () => {
    setOriginalImage(null);
    setImageInfo({ width: 0, height: 0, size: 0, format: '' });
    setResults([]);
    setProgress(0);
    setOriginalFile(null);
    setSelectedSizes([]);
    setCustomSizes([]);
  };

  const downloadImage = async (dataUrl, fileName) => {
    try {
      setDownloading(true);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = fileName;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        setDownloading(false);
      }, 100);
    } catch (error) {
      console.error('下载失败:', error);
      alert(t('downloadError', language));
      setDownloading(false);
    }
  };

  const downloadAllImages = async () => {
    if (results.length === 0) return;
    
    try {
      setDownloading(true);
      setDownloadProgress(0);
      
      const zip = new JSZip();
      const imgFolder = zip.folder("切割图片");
      
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const response = await fetch(result.dataUrl);
        const blob = await response.blob();
        imgFolder.file(result.fileName, blob);
        
        setDownloadProgress(Math.round(((i + 1) / results.length) * 100));
      }
      
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, language === 'zh' ? "切割图片.zip" : "sliced_images.zip");
    } catch (error) {
      console.error('打包下载失败:', error);
      alert(t('packageDownloadError', language));
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-2 sm:py-4 md:py-8">
      <div className="container mx-auto px-2 sm:px-4 max-w-6xl">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-2 text-blue-600">{t('title', language)}</h1>
        <p className="text-center text-xs sm:text-sm md:text-base text-gray-600 mb-2 px-2">{t('subtitle', language)}</p>
        <p className="text-center text-xs text-gray-500 mb-4 sm:mb-6 md:mb-8 px-2">{t('subtitle2', language)}</p>
        
        <div className="flex flex-col xl:flex-row gap-3 sm:gap-4 md:gap-6">
          {/* 左侧配置区域 */}
          <div className="w-full xl:w-2/3 space-y-3 sm:space-y-4 md:space-y-6">
            {/* 上传图片卡片 */}
            <Card className="h-fit">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <UploadIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  {t('uploadTitle', language)}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                {!originalImage ? (
                  <div 
                    className="border-2 border-dashed border-blue-300 rounded-xl p-3 sm:p-6 md:p-8 text-center bg-blue-50 cursor-pointer touch-manipulation"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current.click()}
                  >
                    <div className="flex flex-col items-center justify-center gap-2 sm:gap-3">
                      <UploadIcon className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 text-blue-400" />
                      <p className="font-medium text-xs sm:text-sm md:text-base">{t('uploadHint', language)}</p>
                      <p className="text-xs text-gray-500 px-2">{t('uploadSupport', language)}</p>
                      <Button variant="outline" className="mt-2 bg-white text-xs sm:text-sm h-8 sm:h-9 md:h-10 px-3 sm:px-4">
                        {t('selectFile', language)}
                      </Button>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="relative mb-3 sm:mb-4 w-full">
                      <img 
                        src={originalImage} 
                        alt="预览" 
                        className="max-h-40 sm:max-h-48 md:max-h-64 max-w-full rounded-lg shadow-md mx-auto object-cover w-full"
                      />
                      <div className="absolute top-2 right-2">
                        <Button 
                          variant="destructive" 
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 touch-manipulation"
                          onClick={() => setOriginalImage(null)}
                        >
                          <Trash2Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 w-full">
                      <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                        <p className="text-xs text-gray-500">{t('dimensions', language)}</p>
                        <p className="font-medium text-xs sm:text-sm md:text-base">{imageInfo.width} × {imageInfo.height} px</p>
                      </div>
                      <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                        <p className="text-xs text-gray-500">{t('fileSize', language)}</p>
                        <p className="font-medium text-xs sm:text-sm md:text-base">{imageInfo.size}</p>
                      </div>
                      <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                        <p className="text-xs text-gray-500">{t('format', language)}</p>
                        <p className="font-medium text-xs sm:text-sm md:text-base">{imageInfo.format}</p>
                      </div>
                      <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                        <p className="text-xs text-gray-500">{t('operations', language)}</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs h-6 sm:h-7 md:h-9 w-full touch-manipulation"
                          onClick={() => fileInputRef.current.click()}
                        >
                          {t('replaceImage', language)}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* 尺寸配置卡片 */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <ScissorsIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  {t('sizeConfigTitle', language)}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <Tabs defaultValue="presets" className="mb-3 sm:mb-4">
                  <TabsList className="grid grid-cols-2 w-full h-9 sm:h-10">
                    <TabsTrigger value="presets" className="text-xs sm:text-sm">{t('presetSizes', language)}</TabsTrigger>
                    <TabsTrigger value="custom" className="text-xs sm:text-sm">{t('customSizes', language)}</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="presets">
                    <div className="mt-3 sm:mt-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs sm:text-sm text-gray-600">
                          {selectedSizes.filter(s => s.id <= 15).length} / {PRESET_SIZES.length} {t('selected', language)}
                        </span>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 p-0 text-xs touch-manipulation"
                            onClick={() => setSelectedSizes([...selectedSizes.filter(s => s.id > 15), ...PRESET_SIZES])}
                            disabled={selectedSizes.filter(s => s.id <= 15).length === PRESET_SIZES.length}
                          >
                            {t('selectAll', language)}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 p-0 text-xs touch-manipulation"
                            onClick={() => setSelectedSizes(selectedSizes.filter(s => s.id > 15))}
                            disabled={selectedSizes.filter(s => s.id <= 15).length === 0}
                          >
                            {t('clearAll', language)}
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {PRESET_SIZES.map((size) => (
                          <div key={size.id} className="border rounded-lg p-2 sm:p-3 flex justify-between items-center touch-manipulation">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-xs sm:text-sm truncate">{size.name}</p>
                              <p className="text-xs text-gray-500">{size.width} × {size.height} px</p>
                            </div>
                            {!selectedSizes.some(s => s.id === size.id) ? (
                              <Button 
                                variant="outline"
                                size="sm"
                                className="ml-2 flex-shrink-0 h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 p-0 touch-manipulation"
                                onClick={() => setSelectedSizes([...selectedSizes, size])}
                              >
                                <PlusIcon className="h-3 w-3" />
                              </Button>
                            ) : (
                              <span className="text-xs text-green-500 ml-2 flex-shrink-0">{t('added', language)}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="custom">
                    <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                        <div>
                          <Label htmlFor="width" className="text-xs sm:text-sm">{t('width', language)}</Label>
                          <Input 
                            id="width" 
                            type="number" 
                            value={customSize.width}
                            onChange={(e) => setCustomSize({...customSize, width: e.target.value})}
                            min="1"
                            className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="height" className="text-xs sm:text-sm">{t('height', language)}</Label>
                          <Input 
                            id="height" 
                            type="number" 
                            value={customSize.height}
                            onChange={(e) => setCustomSize({...customSize, height: e.target.value})}
                            min="1"
                            className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="sizeName" className="text-xs sm:text-sm">{t('sizeName', language)}</Label>
                        <Input 
                          id="sizeName" 
                          placeholder={t('sizeNamePlaceholder', language)}
                          value={customSize.name}
                          onChange={(e) => setCustomSize({...customSize, name: e.target.value})}
                          className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
                        />
                      </div>
                      
                      <Button 
                        className="w-full h-8 sm:h-9 md:h-10 text-xs sm:text-sm touch-manipulation"
                        onClick={addCustomSize}
                        disabled={!customSize.width || !customSize.height}
                      >
                        <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        {t('addCustomSize', language)}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="mt-4 sm:mt-6">
                  <h3 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">{t('selectedSizes', language)} ({selectedSizes.length})</h3>
                  <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto pr-2">
                    {selectedSizes.map((size) => (
                      <div key={size.id} className="flex justify-between items-center p-2 bg-gray-50 rounded touch-manipulation">
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-xs sm:text-sm truncate block">{size.name}</span>
                          <span className="text-xs text-gray-500">{size.width}×{size.height}px</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 flex-shrink-0 touch-manipulation"
                          onClick={() => removeSize(size.id)}
                        >
                          <Trash2Icon className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* 切割参数配置卡片 */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">{t('sliceParamsTitle', language)}</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
                <div>
                  <Label className="text-xs sm:text-sm">{t('sliceMode', language)}</Label>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="crop"
                        name="mode"
                        checked={sliceSettings.mode === 'crop'}
                        onChange={() => setSliceSettings({...sliceSettings, mode: 'crop'})}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Label htmlFor="crop" className="text-xs sm:text-sm">{t('crop', language)}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="fit"
                        name="mode"
                        checked={sliceSettings.mode === 'fit'}
                        onChange={() => setSliceSettings({...sliceSettings, mode: 'fit'})}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Label htmlFor="fit" className="text-xs sm:text-sm">{t('fit', language)}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="circle"
                        name="mode"
                        checked={sliceSettings.mode === 'circle'}
                        onChange={() => setSliceSettings({...sliceSettings, mode: 'circle'})}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Label htmlFor="circle" className="text-xs sm:text-sm">{t('circle', language)}</Label>
                    </div>
                  </div>
                </div>
                
                {(sliceSettings.mode === 'fit' || sliceSettings.mode === 'circle') && (
                  <div>
                    <Label htmlFor="fillColor" className="text-xs sm:text-sm">{t('fillColor', language)}</Label>
                    <div className="flex items-center gap-2 sm:gap-3 mt-1">
                      <input 
                        type="color" 
                        id="fillColor"
                        value={sliceSettings.fillColor}
                        onChange={(e) => setSliceSettings({
                          ...sliceSettings, 
                          fillColor: e.target.value
                        })}
                        className="w-8 h-8 sm:w-10 sm:h-10 border-0 rounded cursor-pointer touch-manipulation"
                      />
                      <span className="text-xs sm:text-sm">{sliceSettings.fillColor}</span>
                    </div>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="outputFormat" className="text-xs sm:text-sm">{t('outputFormat', language)}</Label>
                  <Select 
                    value={sliceSettings.outputFormat}
                    onValueChange={(value) => setSliceSettings({
                      ...sliceSettings, 
                      outputFormat: value
                    })}
                  >
                    <SelectTrigger className="w-full mt-1 h-8 sm:h-9 md:h-10 text-xs sm:text-sm">
                      <SelectValue placeholder={t('outputFormat', language)} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">{t('originalFormat', language)}</SelectItem>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="jpg">JPG</SelectItem>
                      <SelectItem value="webp">WebP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button 
                className="flex-1 py-3 sm:py-4 md:py-6 text-sm sm:text-base md:text-lg touch-manipulation"
                onClick={startSlicing}
                disabled={!originalImage || selectedSizes.length === 0 || processing}
              >
                <ScissorsIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                {t('startSlicing', language)}
              </Button>
              
              <Button 
                variant="outline" 
                className="py-3 sm:py-4 md:py-6 text-sm sm:text-base md:text-lg touch-manipulation"
                onClick={resetAll}
              >
                <Trash2Icon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                {t('reset', language)}
              </Button>
            </div>
          </div>
          
          {/* 右侧切割结果区域 */}
          <div className="w-full xl:w-1/3">
            {/* 处理进度 */}
            {processing && (
              <Card className="mb-3 sm:mb-4 md:mb-6">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-sm sm:text-base md:text-lg">{t('processing', language)}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <Progress value={progress} className="h-2 sm:h-3" />
                  <p className="text-center mt-2 text-gray-600 text-xs sm:text-sm">
                    {t('processingText', language, { count: selectedSizes.length, progress })}
                  </p>
                </CardContent>
              </Card>
            )}
            
            {/* 切割结果预览区域 */}
            {!processing && results.length === 0 && (
              <Card>
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-sm sm:text-base md:text-lg">{t('resultPreviewTitle', language)}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col items-center justify-center h-32 sm:h-40 md:h-48 lg:h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-center p-3 sm:p-4">
                      <ScissorsIcon className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                      <p className="text-gray-500 font-medium text-xs sm:text-sm md:text-base">{t('resultPreviewHint', language)}</p>
                      <p className="text-xs text-gray-400 mt-1 sm:mt-2">{t('resultPreviewSubHint', language)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* 切割结果 */}
            {results.length > 0 && (
              <Card>
                <CardHeader className="pb-2 sm:pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-2">
                    <CardTitle className="text-sm sm:text-base md:text-lg">{t('sliceResults', language)}</CardTitle>

                    <Button 
                      variant="secondary"
                      size="sm"
                      className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9 touch-manipulation"
                      onClick={(e) => {
                        e.preventDefault();
                        downloadAllImages();
                      }}
                      disabled={downloading}
                    >
                      {downloading ? (
                        <>
                          <Loader2Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                          <span className="hidden sm:inline">{t('packaging', language, { progress: downloadProgress })}</span>
                          <span className="sm:hidden">打包中</span>
                        </>
                      ) : (
                        <>
                          <DownloadIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">{t('downloadAll', language)}</span>
                          <span className="sm:hidden">下载全部</span>
                        </>
                      )}
                    </Button>
                  </div>

                    {/* 移动端操作提示 */}
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-blue-700">
                        💡 {t('mobileHint', language)}
                      </p>
                    </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
                    {results.map((result) => (
                      <div key={result.id} className="border rounded-lg overflow-hidden flex touch-manipulation">
                        <div className="w-1/3 relative">
                          <img 
                            src={result.dataUrl} 
                            alt={result.name}
                            className="w-full h-20 sm:h-24 md:h-32 object-cover cursor-pointer"
                            onClick={() => setPreviewImage(result.dataUrl)}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
                            {result.width}×{result.height}px
                          </div>
                        </div>
                        <div className="w-2/3 p-2 sm:p-3 flex flex-col justify-between">
                          <div>
                            <p className="font-medium truncate text-xs sm:text-sm md:text-base">{result.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{t('dimensions', language)}: {result.width}×{result.height}px</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full h-7 sm:h-8 md:h-9 text-xs sm:text-sm touch-manipulation mt-2"
                            onClick={(e) => {
                              e.preventDefault();
                              downloadImage(result.dataUrl, result.fileName);
                            }}
                            disabled={downloading}
                          >
                            {downloading ? (
                              <Loader2Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                            ) : (
                              <DownloadIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            )}
                            {t('download', language)}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        {/* 图片预览弹窗 */}
        {previewImage && (
          <ImagePreview 
            imageUrl={previewImage} 
            onClose={() => setPreviewImage(null)} 
          />
        )}
      </div>
    </div>
  );
};

export default ImageSlicer;
