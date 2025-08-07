import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/translations';

const SEOHead = () => {
  const { language } = useLanguage();

  useEffect(() => {
    try {
      // 更新页面标题
      document.title = t('pageTitle', language);
      
      // 更新meta描述
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', t('pageDescription', language));
      }
      
      // 更新Open Graph标题
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', t('ogTitle', language));
      }
      
      // 更新Open Graph描述
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', t('ogDescription', language));
      }
      
      // 更新Twitter标题
      const twitterTitle = document.querySelector('meta[property="twitter:title"]');
      if (twitterTitle) {
        twitterTitle.setAttribute('content', t('ogTitle', language));
      }
      
      // 更新Twitter描述
      const twitterDescription = document.querySelector('meta[property="twitter:description"]');
      if (twitterDescription) {
        twitterDescription.setAttribute('content', t('ogDescription', language));
      }
      
      // 更新hreflang标签
      const hreflangTags = document.querySelectorAll('link[rel="alternate"][hreflang]');
      hreflangTags.forEach(tag => {
        const hreflang = tag.getAttribute('hreflang');
        if (hreflang === language) {
          tag.setAttribute('href', `https://www.suihaoran.com/${language === 'zh' ? 'zh' : language === 'hi' ? 'hi' : 'en'}`);
        }
      });
      
      // 更新结构化数据
      const structuredData = document.querySelector('script[type="application/ld+json"]');
      if (structuredData) {
        const data = {
          "@context": "https://schema.org",
          "@type": "WebApplication",
                  "name": t('title', language),
        "alternateName": language === 'zh' ? "在线图片裁剪工具" : 
                        language === 'hi' ? "ऑनलाइन इमेज क्रॉपर" : 
                        "Crop Image Online",
          "description": t('pageDescription', language),
          "url": "https://www.suihaoran.com",
          "applicationCategory": "MultimediaApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
                  "featureList": [
          language === 'zh' ? "图片裁剪" : language === 'hi' ? "इमेज क्रॉपिंग" : "Image Cropping",
          language === 'zh' ? "照片调整" : language === 'hi' ? "फोटो रीसाइज़िंग" : "Photo Resizing",
          language === 'zh' ? "社交媒体格式" : language === 'hi' ? "सोशल मीडिया फॉर्मेट्स" : "Social Media Formats",
          language === 'zh' ? "批量处理" : language === 'hi' ? "बैच प्रोसेसिंग" : "Batch Processing",
          language === 'zh' ? "自定义尺寸" : language === 'hi' ? "कस्टम साइज़" : "Custom Sizes",
          language === 'zh' ? "格式转换" : language === 'hi' ? "फॉर्मेट कन्वर्जन" : "Format Conversion",
          language === 'zh' ? "移动端优化" : language === 'hi' ? "मोबाइल ऑप्टिमाइज़ेशन" : "Mobile Optimized"
        ],
          "screenshot": "https://www.suihaoran.com/screenshot.jpg",
          "softwareVersion": "1.0.0",
                  "author": {
          "@type": "Organization",
          "name": language === 'zh' ? "在线图片裁剪工具" : 
                  language === 'hi' ? "ऑनलाइन इमेज क्रॉपर" : 
                  "Crop Image Online"
        },
        "publisher": {
          "@type": "Organization",
          "name": language === 'zh' ? "在线图片裁剪工具" : 
                  language === 'hi' ? "ऑनलाइन इमेज क्रॉपर" : 
                  "Crop Image Online"
        },
          "inLanguage": language === 'zh' ? "zh-CN" : language === 'hi' ? "hi-IN" : "en-US",
          "availableOnDevice": ["Desktop", "Mobile", "Tablet"],
          "browserRequirements": "Requires JavaScript. Requires HTML5.",
          "datePublished": "2024-01-01",
          "dateModified": "2025-08-07"
        };
        structuredData.textContent = JSON.stringify(data, null, 2);
      }
      
      // 添加页面可见性API支持
      if ('visibilityState' in document) {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            // 页面重新可见时更新标题
            document.title = t('pageTitle', language);
          }
        });
      }
      
    } catch (error) {
      console.warn('SEOHead component error:', error);
    }
    
  }, [language]);

  return null; // 这个组件不渲染任何内容
};

export default SEOHead; 