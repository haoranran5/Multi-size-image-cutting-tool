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

const PRESET_SIZES = [
  { id: 1, width: 1200, height: 510, name: '微信头图' },
  { id: 2, width: 1242, height: 1660, name: '小红书' },
  { id: 3, width: 800, height: 800, name: '电商商品' },
];

const ImageSlicer = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [imageInfo, setImageInfo] = useState({ width: 0, height: 0, size: 0, format: '' });
  const [selectedSizes, setSelectedSizes] = useState([...PRESET_SIZES]);
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
      alert('请上传图片文件 (PNG, JPG, WebP)');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小不能超过10MB');
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
      name: customSize.name || `自定义 ${customSize.width}x${customSize.height}`
    };
    
    setCustomSizes([...customSizes, newSize]);
    setSelectedSizes([...selectedSizes, newSize]);
    setCustomSize({ width: '', height: '', name: '' });
  };

  const removeSize = (id) => {
    setSelectedSizes(selectedSizes.filter(size => size.id !== id));
    
    if (id > 3) {
      setCustomSizes(customSizes.filter(size => size.id !== id));
    }
  };

  const processImage = (img, width, height, mode, fillColor) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      ctx.fillStyle = fillColor;
      ctx.fillRect(0, 0, width, height);
      
      const imgAspect = img.width / img.height;
      const targetAspect = width / height;
      
      let drawWidth, drawHeight, offsetX, offsetY;
      
      if (mode === 'crop') {
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
      } else {
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
      
      const dataUrl = canvas.toDataURL(`image/${sliceSettings.outputFormat === 'original' ? imageInfo.format.toLowerCase() : sliceSettings.outputFormat}`, 0.92);
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
      
      generatedResults.push({
        id: i + 1,
        width: size.width,
        height: size.height,
        name: size.name,
        dataUrl,
        fileName: `${size.name.replace(/\s+/g, '_')}_${size.width}x${size.height}.${sliceSettings.outputFormat === 'original' ? imageInfo.format.toLowerCase() : sliceSettings.outputFormat}`
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
    setSelectedSizes([...PRESET_SIZES]);
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
      alert('图片下载失败，请重试');
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
      saveAs(content, "切割图片.zip");
    } catch (error) {
      console.error('打包下载失败:', error);
      alert('打包下载失败，请重试');
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl rounded">
        <h1 className="text-3xl font-bold text-center mb-2 text-blue-600">多尺寸图片切割工具</h1>
        <p className="text-center text-gray-600 mb-8">快速生成适配不同平台的图片尺寸</p>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左侧配置区域 - 占2/3 */}
          <div className="w-full lg:w-2/3 space-y-6">
            {/* 上传图片卡片 */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UploadIcon className="h-5 w-5" />
                  上传图片
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!originalImage ? (
                  <div 
                    className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-blue-50 cursor-pointer"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current.click()}
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <UploadIcon className="h-12 w-12 text-blue-400" />
                      <p className="font-medium">拖放图片到此处或点击上传</p>
                      <p className="text-sm text-gray-500">支持 PNG, JPG, WebP 格式 (最大10MB)</p>
                      <Button variant="outline" className="mt-2 bg-white">
                        选择文件
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
                    <div className="relative mb-4">
                      <img 
                        src={originalImage} 
                        alt="预览" 
                        className="max-h-64 max-w-full rounded-lg shadow-md mx-auto object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={() => setOriginalImage(null)}
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">尺寸</p>
                        <p className="font-medium">{imageInfo.width} × {imageInfo.height} px</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">大小</p>
                        <p className="font-medium">{imageInfo.size}</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">格式</p>
                        <p className="font-medium">{imageInfo.format}</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">操作</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => fileInputRef.current.click()}
                        >
                          更换图片
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* 尺寸配置卡片 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ScissorsIcon className="h-5 w-5" />
                  尺寸配置
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="presets" className="mb-4">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="presets">预设尺寸</TabsTrigger>
                    <TabsTrigger value="custom">自定义尺寸</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="presets">
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {PRESET_SIZES.map((size) => (
                        <div key={size.id} className="border rounded-lg p-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{size.name}</p>
                            <p className="text-sm text-gray-500">{size.width} × {size.height} px</p>
                          </div>
                          {!selectedSizes.some(s => s.id === size.id) ? (
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedSizes([...selectedSizes, size])}
                            >
                              <PlusIcon className="h-4 w-4" />
                            </Button>
                          ) : (
                            <span className="text-sm text-green-500">已添加</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="custom">
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="width">宽度 (px)</Label>
                          <Input 
                            id="width" 
                            type="number" 
                            value={customSize.width}
                            onChange={(e) => setCustomSize({...customSize, width: e.target.value})}
                            min="1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="height">高度 (px)</Label>
                          <Input 
                            id="height" 
                            type="number" 
                            value={customSize.height}
                            onChange={(e) => setCustomSize({...customSize, height: e.target.value})}
                            min="1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="sizeName">尺寸名称 (可选)</Label>
                        <Input 
                          id="sizeName" 
                          placeholder="例如：海报尺寸"
                          value={customSize.name}
                          onChange={(e) => setCustomSize({...customSize, name: e.target.value})}
                        />
                      </div>
                      
                      <Button 
                        className="w-full"
                        onClick={addCustomSize}
                        disabled={!customSize.width || !customSize.height}
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        添加自定义尺寸
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-3">已选尺寸 ({selectedSizes.length})</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {selectedSizes.map((size) => (
                      <div key={size.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{size.name}</span>
                          <span className="text-sm text-gray-500 ml-2">{size.width}×{size.height}px</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeSize(size.id)}
                        >
                          <Trash2Icon className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* 切割参数配置卡片 */}
            <Card>
              <CardHeader>
                <CardTitle>切割参数设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="mode">切割模式</Label>
                  <div className="flex items-center gap-3">
                    <span className={sliceSettings.mode === 'crop' ? 'font-medium' : 'text-gray-500'}>裁剪</span>
                    <Switch 
                      id="mode"
                      checked={sliceSettings.mode === 'fit'}
                      onCheckedChange={(checked) => setSliceSettings({
                        ...sliceSettings, 
                        mode: checked ? 'fit' : 'crop'
                      })}
                    />
                    <span className={sliceSettings.mode === 'fit' ? 'font-medium' : 'text-gray-500'}>适配</span>
                  </div>
                </div>
                
                {sliceSettings.mode === 'fit' && (
                  <div>
                    <Label htmlFor="fillColor">空白填充颜色</Label>
                    <div className="flex items-center gap-3 mt-1">
                      <input 
                        type="color" 
                        id="fillColor"
                        value={sliceSettings.fillColor}
                        onChange={(e) => setSliceSettings({
                          ...sliceSettings, 
                          fillColor: e.target.value
                        })}
                        className="w-10 h-10 border-0 rounded cursor-pointer"
                      />
                      <span>{sliceSettings.fillColor}</span>
                    </div>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="outputFormat">输出格式</Label>
                  <Select 
                    value={sliceSettings.outputFormat}
                    onValueChange={(value) => setSliceSettings({
                      ...sliceSettings, 
                      outputFormat: value
                    })}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="选择输出格式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">同原图格式</SelectItem>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="jpg">JPG</SelectItem>
                      <SelectItem value="webp">WebP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            {/* 操作按钮 */}
            <div className="flex gap-3">
              <Button 
                className="flex-1 py-6 text-lg"
                onClick={startSlicing}
                disabled={!originalImage || selectedSizes.length === 0 || processing}
              >
                <ScissorsIcon className="h-5 w-5 mr-2" />
                开始切割
              </Button>
              
              <Button 
                variant="outline" 
                className="py-6 text-lg"
                onClick={resetAll}
              >
                <Trash2Icon className="h-5 w-5 mr-2" />
                重置
              </Button>
            </div>
          </div>
          
          {/* 右侧切割结果区域 - 占1/3 */}
          <div className="w-full lg:w-1/3">
            {/* 处理进度 */}
            {processing && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>处理中...</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={progress} className="h-3" />
                  <p className="text-center mt-2 text-gray-600">
                    正在生成 {selectedSizes.length} 种尺寸的图片 ({progress}%)
                  </p>
                </CardContent>
              </Card>
            )}
            
            {/* 切割结果预览区域 */}
            {!processing && results.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>切割结果预览</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-center p-4">
                      <ScissorsIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">切割完成后的图片将在这里显示</p>
                      <p className="text-sm text-gray-400 mt-2">上传图片并选择尺寸后点击"开始切割"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* 切割结果 */}
            {results.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center mb-2">
                    <CardTitle>切割结果</CardTitle>

                    <Button 
                      variant="secondary"
                      onClick={(e) => {
                        e.preventDefault();
                        downloadAllImages();
                      }}
                      disabled={downloading}
                    >
                      {downloading ? (
                        <>
                          <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                          打包中 ({downloadProgress}%)
                        </>
                      ) : (
                        <>
                          <DownloadIcon className="h-4 w-4 mr-2" />
                          打包下载全部
                        </>
                      )}
                    </Button>
                  </div>

                    {/* 新增移动端操作提示 */}
                    <div className="p-2 bg-blue-50 rounded-lg block">
                      <p className="text-sm text-blue-700 ">
                        在移动端请点击图片预览，长按图片保存
                      </p>
                    </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    {results.map((result) => (
                      <div key={result.id} className="border rounded-lg overflow-hidden flex">
                        <div className="w-1/3 relative">
                          <img 
                            src={result.dataUrl} 
                            alt={result.name}
                            className="w-full h-32 object-cover cursor-pointer"
                            onClick={() => setPreviewImage(result.dataUrl)}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
                            {result.width}×{result.height}px
                          </div>
                        </div>
                        <div className="w-2/3 p-3 flex flex-col justify-between">
                          <div>
                            <p className="font-medium truncate">{result.name}</p>
                            <p className="text-sm text-gray-500 mt-1">尺寸: {result.width}×{result.height}px</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={(e) => {
                              e.preventDefault();
                              downloadImage(result.dataUrl, result.fileName);
                            }}
                            disabled={downloading}
                          >
                            {downloading ? (
                              <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <DownloadIcon className="h-4 w-4 mr-2" />
                            )}
                            下载
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
