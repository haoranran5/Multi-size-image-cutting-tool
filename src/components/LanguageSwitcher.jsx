import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { GlobeIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/translations';

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1 sm:gap-2 text-xs sm:text-sm h-7 w-7 sm:h-8 sm:w-auto sm:px-2 sm:px-3 p-0 touch-manipulation shadow-sm bg-white/90 backdrop-blur-sm"
        >
          <GlobeIcon className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">
            {language === 'zh' ? '中文' : language === 'hi' ? 'हिंदी' : 'English'}
          </span>
          <span className="sm:hidden">
            {language === 'zh' ? '中' : language === 'hi' ? 'हि' : 'EN'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        <DropdownMenuItem 
          onClick={() => changeLanguage('zh')}
          className="text-sm cursor-pointer touch-manipulation"
        >
          {t('chinese', language)}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage('en')}
          className="text-sm cursor-pointer touch-manipulation"
        >
          {t('english', language)}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage('hi')}
          className="text-sm cursor-pointer touch-manipulation"
        >
          {t('hindi', language)}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher; 