export const formatDate = (
  date: Date,
  options?: Intl.DateTimeFormatOptions,
): string => {
  return new Intl.DateTimeFormat(undefined, options).format(date);
};
