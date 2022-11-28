export const parseMattMessage = (raw: string): string => {
  return raw.replace(/(MATT)+/g, '').trim();
};
export const generateMattMessage = (raw: string): string => {
  return `MATT${raw}MATT`;
};
