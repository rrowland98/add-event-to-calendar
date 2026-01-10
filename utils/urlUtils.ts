
import { EventData } from '../types';

export const encodeEventData = (data: EventData): string => {
  const dataToEncode = { ...data };
  
  // Strip large base64 images to keep URL size manageable
  if (dataToEncode.imageUrl && dataToEncode.imageUrl.startsWith('data:')) {
    if (dataToEncode.imageUrl.length > 1000) {
      dataToEncode.imageUrl = null; 
    }
  }

  if (!dataToEncode.description) delete (dataToEncode as any).description;
  if (!dataToEncode.location) delete (dataToEncode as any).location;

  const jsonString = JSON.stringify(dataToEncode);
  const encoded = encodeURIComponent(btoa(encodeURIComponent(jsonString)));
  
  return encoded;
};

export const decodeEventData = (encodedString: string): EventData | null => {
  try {
    const jsonString = decodeURIComponent(atob(decodeURIComponent(encodedString)));
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to decode event data", e);
    return null;
  }
};

export const shortenUrl = async (longUrl: string): Promise<string> => {
  // If the URL is already short enough, don't bother the external service
  if (longUrl.length < 150) return longUrl;

  try {
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
