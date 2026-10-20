// Single characters and short words are shown large. A whole sentence has to fit on a phone.
export const hanziSize = (text: string) => ([...text].length > 4 ? 'text-4xl' : 'text-6xl');
