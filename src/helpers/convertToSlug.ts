import * as unidecode from 'unidecode';

export const convertToSlug = (text: string): string => {
  if (text) {
    text += '';
    const unidecodeText = unidecode(text.trim());
    const slug: string = unidecodeText.replace(/\s+/g, '-');
    return slug;
  } else {
    return '';
  }
};
