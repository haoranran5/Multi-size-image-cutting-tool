import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { navItems, getLocalizedNavItems } from "./nav-items";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const queryClient = new QueryClient();

const App = () => {
  const mainPage = navItems[0].page;
  
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
                          {/* 语言切换器 */}
            <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50">
              <LanguageSwitcher />
            </div>
              
              <Routes>
                {/* 重定向根路径到英文版本 */}
                <Route path="/" element={<Navigate to="/en" replace />} />
                
                {/* 中文路由 */}
                <Route path="/zh" element={mainPage} />
                
                {/* 英文路由 */}
                <Route path="/en" element={mainPage} />
                
                {/* 捕获所有其他路由，重定向到英文版本 */}
                <Route path="*" element={<Navigate to="/en" replace />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
