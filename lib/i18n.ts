import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
import fa from '@/locales/fa.json';

const dictionaries: Record<string, typeof en> = {
    en,
    ar,
    fa,
};

export function getDictionary(locale: string) {
    return dictionaries[locale] || dictionaries.en;
}

export type Dictionary = typeof en;
