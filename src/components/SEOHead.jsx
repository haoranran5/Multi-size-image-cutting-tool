import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/translations';

const SEOHead = () => {
  const { language } = useLanguage();

  useEffect(() => {
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
    
    // 更新结构化数据
    const structuredData = document.querySelector('script[type="application/ld+json"]');
    if (structuredData) {
      const data = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": t('title', language),
        "alternateName": language === 'zh' ? "多尺寸图片切割工具" : 
                        language === 'hi' ? "मल्टी-साइज़ इमेज कटिंग टूल" : 
                        "Multi-size Image Cutting Tool",
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
          language === 'zh' ? "多尺寸支持" : language === 'hi' ? "मल्टी-साइज़ समर्थन" : "Multi-size Support",
          language === 'zh' ? "智能切割" : language === 'hi' ? "स्मार्ट कटिंग" : "Smart Cutting",
          language === 'zh' ? "移动端优化" : language === 'hi' ? "मोबाइल ऑप्टिमाइज़ेशन" : "Mobile Optimization",
          language === 'zh' ? "多语言支持" : language === 'hi' ? "मल्टी-लैंग्वेज समर्थन" : "Multi-language Support",
          language === 'zh' ? "批量下载" : language === 'hi' ? "बल्क डाउनलोड" : "Batch Download",
          language === 'zh' ? "自定义尺寸" : language === 'hi' ? "कस्टम साइज़" : "Custom Sizes",
          language === 'zh' ? "格式转换" : language === 'hi' ? "फॉर्मेट कन्वर्जन" : "Format Conversion"
        ],
        "screenshot": "https://www.suihaoran.com/screenshot.jpg",
        "softwareVersion": "1.0.0",
        "author": {
          "@type": "Organization",
          "name": language === 'zh' ? "多尺寸图片切割工具" : 
                  language === 'hi' ? "मल्टी-साइज़ इमेज कटिंग टूल" : 
                  "Multi-size Image Cutting Tool"
        },
        "publisher": {
          "@type": "Organization",
          "name": language === 'zh' ? "多尺寸图片切割工具" : 
                  language === 'hi' ? "मल्टी-साइज़ इमेज कटिंग टूल" : 
                  "Multi-size Image Cutting Tool"
        },
        "inLanguage": language === 'zh' ? "zh-CN" : language === 'hi' ? "hi-IN" : "en-US",
        "availableOnDevice": ["Desktop", "Mobile", "Tablet"],
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "datePublished": "2024-01-01",
        "dateModified": "2024-12-19"
      };
      structuredData.textContent = JSON.stringify(data, null, 2);
    }
    
  }, [language]);

  return null; // 这个组件不渲染任何内容
};

export default SEOHead; 