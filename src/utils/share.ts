export interface ShareDataInput {
  title: string;
  text: string;
  url?: string;
}

export async function shareContent(data: ShareDataInput): Promise<{ success: boolean; method: 'native' | 'clipboard' | 'whatsapp' | 'error' }> {
  const url = data.url || window.location.href;
  const shareData = {
    title: data.title,
    text: data.text,
    url: url,
  };

  // Try native Web Share API (Mobile Browsers & supporting desktop browsers)
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return { success: true, method: 'native' };
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return { success: false, method: 'native' };
      }
      // If native share fails for another reason, fallback to clipboard
    }
  }

  // Fallback 1: Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(`${data.title}\n${data.text}\n${url}`);
      return { success: true, method: 'clipboard' };
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  }

  // Fallback 2: Direct WhatsApp Share
  try {
    const waText = encodeURIComponent(`${data.title}\n${data.text}\n${url}`);
    window.open(`https://wa.me/?text=${waText}`, '_blank');
    return { success: true, method: 'whatsapp' };
  } catch (err) {
    console.error('WhatsApp share failed:', err);
    return { success: false, method: 'error' };
  }
}
