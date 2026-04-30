import { ChangeEvent } from 'react';
import { ChangeHandler } from 'react-hook-form';

export const maxLengthInputNumberLimit = (
  e: ChangeEvent<HTMLInputElement>,
  hookChange: ChangeHandler
) => {
  const { value, maxLength } = e.target;
  const normalizeValue = value.toString();
  if (maxLength <= 0) {
    e.target.value = '';
  } else if (normalizeValue.length > maxLength) {
    e.target.value = normalizeValue.slice(0, maxLength);
    hookChange(e);
  } else {
    hookChange(e);
  }
};
