'use client';

import { List, ListItem, Toggle, Segmented, SegmentedButton, BlockTitle } from 'konsta/react';
import { cities } from '@/lib/mockData';
import { useApp } from '@/lib/state';
import type { Language } from '@/lib/i18n';
import type { ThemePreference } from '@/lib/state';
import { ScreenHeader, LargeTitle } from '@/components/ui/ScreenHeader';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';

/** Grouped iOS settings, built with Konsta UI lists and toggles. */
export default function SettingsPage() {
  const {
    t,
    language,
    theme,
    city,
    notificationsEnabled,
    locationEnabled,
    largeText,
    reduceMotion,
    increaseContrast,
    reduceTransparency,
    set,
    resetDemo,
  } = useApp();

  const themeOptions: Array<{ value: ThemePreference; label: string }> = [
    { value: 'system', label: t('settings.themeSystem') },
    { value: 'light', label: t('settings.themeLight') },
    { value: 'dark', label: t('settings.themeDark') },
  ];

  return (
    <div className="pb-8">
      <ScreenHeader title={t('settings.title')} back largeTitleBelow transparent />
      <LargeTitle>{t('settings.title')}</LargeTitle>

      <BlockTitle>{t('settings.language')}</BlockTitle>
      <div className="px-4">
        <Segmented strong>
          {(['fi', 'en'] as Language[]).map((option) => (
            <SegmentedButton
              key={option}
              active={language === option}
              onClick={() => set('language', option)}
              className="min-h-11"
            >
              {option === 'fi' ? 'Suomi' : 'English'}
            </SegmentedButton>
          ))}
        </Segmented>
      </div>

      <BlockTitle>{t('settings.appearance')}</BlockTitle>
      <div className="px-4">
        <Segmented strong>
          {themeOptions.map((option) => (
            <SegmentedButton
              key={option.value}
              active={theme === option.value}
              onClick={() => set('theme', option.value)}
              className="min-h-11"
            >
              {option.label}
            </SegmentedButton>
          ))}
        </Segmented>
      </div>

      <BlockTitle>{t('settings.city')}</BlockTitle>
      <div className="flex flex-wrap gap-2 px-4">
        {cities.map((option) => (
          <Chip key={option} selected={city === option} onClick={() => set('city', option)}>
            {option}
          </Chip>
        ))}
      </div>

      <BlockTitle>{t('settings.notifications')}</BlockTitle>
      <List strong inset dividers>
        <ListItem
          label
          title={t('settings.notifications')}
          footer={t('settings.notificationsBody')}
          after={
            <Toggle
              component="span"
              checked={notificationsEnabled}
              onChange={() => set('notificationsEnabled', !notificationsEnabled)}
            />
          }
        />
        <ListItem
          label
          title={t('settings.location')}
          footer={t('settings.locationBody')}
          after={
            <Toggle
              component="span"
              checked={locationEnabled}
              onChange={() => set('locationEnabled', !locationEnabled)}
            />
          }
        />
      </List>

      <BlockTitle>{t('settings.accessibility')}</BlockTitle>
      <List strong inset dividers>
        <ListItem
          label
          title={t('settings.largeText')}
          after={
            <Toggle
              component="span"
              checked={largeText}
              onChange={() => set('largeText', !largeText)}
            />
          }
        />
        <ListItem
          label
          title={t('settings.reduceMotion')}
          after={
            <Toggle
              component="span"
              checked={reduceMotion}
              onChange={() => set('reduceMotion', !reduceMotion)}
            />
          }
        />
        <ListItem
          label
          title={t('settings.increaseContrast')}
          after={
            <Toggle
              component="span"
              checked={increaseContrast}
              onChange={() => set('increaseContrast', !increaseContrast)}
            />
          }
        />
        <ListItem
          label
          title={t('settings.reduceTransparency')}
          after={
            <Toggle
              component="span"
              checked={reduceTransparency}
              onChange={() => set('reduceTransparency', !reduceTransparency)}
            />
          }
        />
      </List>

      <BlockTitle>{t('settings.about')}</BlockTitle>
      <List strong inset dividers>
        <ListItem title={t('settings.signIn')} link onClick={() => undefined} />
        <ListItem
          label
          title={t('settings.resetDemo')}
          link
          onClick={resetDemo}
          titleWrapClassName="text-[color:var(--color-danger)]"
        />
      </List>
      <p className="t-caption1 px-5 pt-2 text-ink-secondary">{t('settings.aboutBody')}</p>

      <div className="px-4 pt-6">
        <Button full variant="secondary" href="/home">
          {t('tab.home')}
        </Button>
      </div>
    </div>
  );
}
