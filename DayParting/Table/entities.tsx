import i18next from 'i18next';

export const dayNamesMap = [
  i18next.t('Mo'),
  i18next.t('Tu'),
  i18next.t('We'),
  i18next.t('Th'),
  i18next.t('Fr'),
  i18next.t('Sa'),
  i18next.t('Su'),
];
export const hoursColumnMap = Array.from(Array(24).keys()); // 0,1,2,...,23
