import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getImageDataUrl } from '../getImageDataUrl';

const html2canvasMock = vi.fn();

vi.mock('html2canvas', () => ({
  default: html2canvasMock,
}));

describe('getImageDataUrl', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="capture" style="opacity: 0;"></div>';
    html2canvasMock.mockReset();
  });

  it('captures the selected element as a png data URL', async () => {
    html2canvasMock.mockResolvedValue({
      toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mocked'),
    });

    const result = await getImageDataUrl('#capture');

    const selector = document.querySelector('#capture') as HTMLElement;
    expect(selector.style.opacity).toBe('1');
    expect(html2canvasMock).toHaveBeenCalledWith(selector, {
      backgroundColor: null,
      useCORS: true,
    });
    expect(result).toBe('data:image/png;base64,mocked');
  });
});
