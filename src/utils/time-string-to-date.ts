export const timeStringToDate = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);

  const date = new Date(0);
  date.setUTCHours(hours, minutes, 0, 0);

  return date;
};
