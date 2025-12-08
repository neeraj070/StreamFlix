// Utility functions for YouTube URL handling

/**
 * Extracts YouTube video ID from various YouTube URL formats
 * @param {string} url - YouTube URL
 * @returns {string|null} - YouTube video ID or null
 */
export const extractYouTubeId = (url) => {
  if (!url) return null;

  // Regular YouTube URL patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Converts YouTube URL to embed URL
 * @param {string} url - YouTube URL
 * @returns {string|null} - YouTube embed URL or null
 */
export const getYouTubeEmbedUrl = (url) => {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
};

/**
 * Checks if URL is a YouTube URL
 * @param {string} url - URL to check
 * @returns {boolean}
 */
export const isYouTubeUrl = (url) => {
  if (!url) return false;
  return /youtube\.com|youtu\.be/.test(url);
};


