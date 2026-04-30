export const normalizeLang = (lang: string): string => {
  return lang.replace(/-.*/, '').toLowerCase();
};

export const toSlug = (str: string): string => {
  str = str.replace(/(?:^\s+|\s+$)/g, '');
  str = str.toLowerCase();

  const from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;';
  const to = 'aaaaeeeeiiiioooouuuunc------';
  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-/g, '')
    .replace(/-+/g, '-')
    .replace(/-$/g, '');

  return str;
};

export const generateTypeMsisdn = (type: string) => {
  if (type?.toLowerCase() === 'postpaid') {
    return 'web_register_check_status_result_postpaid_number';
  }
  return 'web_register_check_status_result_prepaid_number';
};

export const maskNik = (nik: string) => {
  if (!nik) {
    return '';
  }
  if (nik.length !== 16) {
    return nik;
  }
  const result = `${nik.substring(0, 5)}${nik
    .substring(5, 12)
    .replace(/./gi, '*')}${nik.substring(12)}`;
  return `${result}`;
};
