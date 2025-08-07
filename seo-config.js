/**
 * SEO配置文件
 * 集中管理网站的SEO相关设置
 */

export const seoConfig = {
  // 网站基本信息
  site: {
    name: "多尺寸图片切割工具",
    nameEn: "Multi-size Image Cutting Tool",
    description: "免费在线图片切割工具，支持Instagram、LinkedIn、Twitter、Facebook等社交媒体尺寸。支持裁剪、适配、圆形三种模式，100%安全免费。",
    descriptionEn: "Free online image cutting tool supporting Instagram, LinkedIn, Twitter, Facebook and other social media sizes. Supports crop, fit, and circle modes. 100% free and secure.",
    url: "https://your-domain.com",
    logo: "https://your-domain.com/favicon.svg",
    ogImage: "https://your-domain.com/og-image.jpg",
    screenshot: "https://your-domain.com/screenshot.jpg",
  },

  // 多语言配置
  languages: {
    zh: {
      code: "zh-CN",
      locale: "zh_CN",
      path: "/zh",
      name: "中文",
      description: "免费在线图片切割工具，支持Instagram、LinkedIn、Twitter、Facebook等社交媒体尺寸。支持裁剪、适配、圆形三种模式，100%安全免费。",
    },
    en: {
      code: "en-US", 
      locale: "en_US",
      path: "/en",
      name: "English",
      description: "Free online image cutting tool supporting Instagram, LinkedIn, Twitter, Facebook and other social media sizes. Supports crop, fit, and circle modes. 100% free and secure.",
    },
    hi: {
      code: "hi-IN",
      locale: "hi_IN", 
      path: "/hi",
      name: "हिन्दी",
      description: "Instagram, LinkedIn, Twitter, Facebook और अन्य सोशल मीडिया आकारों का समर्थन करने वाला मुफ्त ऑनलाइन इमेज कटिंग टूल। क्रॉप, फिट और सर्कल मोड का समर्थन करता है। 100% मुफ्त और सुरक्षित।",
    }
  },

  // 关键词配置
  keywords: {
    zh: "图片切割,在线切割,社交媒体图片,instagram切割,linkedin切割,微信头像,小红书图片,电商图片,免费工具",
    en: "image crop,online crop,social media images,instagram crop,linkedin crop,free tool,image editor",
    hi: "छवि क्रॉप,ऑनलाइन क्रॉप,सोशल मीडिया छवियां,इंस्टाग्राम क्रॉप,लिंक्डइन क्रॉप,मुफ्त टूल"
  },

  // 页面配置
  pages: {
    home: {
      title: "多尺寸图片切割工具 - 免费在线工具",
      titleEn: "Multi-size Image Cutting Tool - Free Online Tool",
      priority: 1.0,
      changefreq: "weekly"
    }
  },

  // 社交媒体配置
  social: {
    twitter: {
      card: "summary_large_image",
      site: "@your-twitter-handle"
    },
    facebook: {
      appId: "your-facebook-app-id"
    }
  },

  // 分析工具配置
  analytics: {
    googleAnalytics: "G-CQWGKM8K5T",
    microsoftClarity: "sqe6v3w5wx"
  },

  // 站点地图配置
  sitemap: {
    url: "https://your-domain.com/sitemap.xml",
    lastmod: "2024-12-19",
    changefreq: "weekly"
  },

  // 结构化数据配置
  structuredData: {
    type: "WebApplication",
    category: "MultimediaApplication",
    features: [
      "多尺寸支持",
      "智能切割", 
      "移动端优化",
      "多语言支持",
      "批量下载",
      "自定义尺寸",
      "格式转换"
    ],
    requirements: "Requires JavaScript. Requires HTML5.",
    devices: ["Desktop", "Mobile", "Tablet"]
  }
};

export default seoConfig; 