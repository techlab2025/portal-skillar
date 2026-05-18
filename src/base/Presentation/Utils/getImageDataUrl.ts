export async function getImageDataUrl(el: string): Promise<string> {
  const { default: html2canvas } = await import('html2canvas');
  const selector = document.querySelector(el) as HTMLElement;
  selector.style.opacity = '1';
  const canvas = await html2canvas(selector, {
    backgroundColor: null,
    useCORS: true,
  });
  return canvas.toDataURL('image/png');
}
