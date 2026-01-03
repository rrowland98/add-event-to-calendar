import { EventData } from '../types';

export const encodeEventData = (data: EventData): string => {
  // We create a copy to potentially sanitize data before encoding
  const dataToEncode = { ...data };
  
  if (dataToEncode.imageUrl && dataToEncode.imageUrl.startsWith('data:')) {
    // If it's a huge base64 string, we remove it to prevent URL overflow
    if (dataToEncode.imageUrl.length > 500) {
      dataToEncode.imageUrl = null; 
    }
  }

  // Optimize payload size by removing empty fields
  if (!dataToEncode.description) delete (dataToEncode as any).description;
  if (!dataToEncode.location) delete (dataToEncode as any).location;

  const jsonString = JSON.stringify(dataToEncode);
  // encodeURIComponent handles unicode
  // btoa handles base64
  // We MUST encodeURIComponent again after btoa because btoa produces '+', '/', '=' which are unsafe in URL params
  return encodeURIComponent(btoa(encodeURIComponent(jsonString)));
};

export const decodeEventData = (encodedString: string): EventData | null => {
  try {
    // decodeURIComponent first (to handle the URL safe characters)
    // atob to decode base64
    // decodeURIComponent again to handle the JSON string components
    const jsonString = decodeURIComponent(atob(decodeURIComponent(encodedString)));
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to decode event data", e);
    return null;
  }
};

export const shortenUrl = async (longUrl: string): Promise<string> => {
  try {
    // Attempt to use TinyURL's public API
    const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
    if (response.ok) {
      const shortUrl = await response.text();
      return shortUrl;
    }
    return longUrl;
  } catch (error) {
    console.warn("Shortening service unavailable, falling back to long URL", error);
    return longUrl;
  }
};