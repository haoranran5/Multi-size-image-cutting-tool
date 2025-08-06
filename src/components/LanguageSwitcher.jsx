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
        <Button variant="outline" size="sm" className="gap-2">
          <GlobeIcon className="h-4 w-4" />
          {language === 'zh' ? '中文' : 'English'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage('zh')}>
          {t('chinese', language)}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('en')}>
          {t('english', language)}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher; 