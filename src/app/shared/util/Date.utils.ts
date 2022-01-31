import * as moment from 'moment';

export const convertDateStringToDate = (date: string): Date => {
  try {
    return moment(convertStringDate(date)).toDate();
  } catch (error) {
    return undefined;
  }
};

export const checkIsDateValid = (date: string): boolean => {
  return moment(convertStringDate(date)).isValid();
};


function convertStringDate(date: string) {
  const dateSplit = date.split('/');
  return `${dateSplit[2]}-${dateSplit[1]}-${dateSplit[0]}`;
}

export const howLongAgo = (date: Date, language?: string) => {
  const currentLanguage = (language && language !== 'pt') ? language : 'pt-BR';
  moment.locale(currentLanguage);
  return moment(date).local().fromNow();
};
