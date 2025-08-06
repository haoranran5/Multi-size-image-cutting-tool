import { HomeIcon, ScissorsIcon } from "lucide-react";
import ImageSlicer from "./pages/Index.jsx";

/**
* Central place for defining the navigation items. Used for navigation components and routing.
*/
export const navItems = [
  {
    title: "图片切割工具",
    to: "/",
    icon: <ScissorsIcon className="h-4 w-4" />,
    page: <ImageSlicer />,
  },
];

// 多语言路由配置
export const getLocalizedNavItems = (language) => [
  {
    title: language === 'zh' ? "图片切割工具" : 
           language === 'hi' ? "छवि क्रॉपिंग टूल" : 
           "Image Cutting Tool",
    to: `/${language}`,
    icon: <ScissorsIcon className="h-4 w-4" />,
    page: <ImageSlicer />,
  },
];
