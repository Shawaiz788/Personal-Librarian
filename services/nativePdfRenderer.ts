import { NativeModules, Platform } from 'react-native';

const { NativePdfRenderer } = NativeModules;

export interface PdfDocumentInfo {
  documentId: string;
  pageCount: number;
  width: number;
  height: number;
}

export interface RenderedPageInfo {
  uri: string;
  pageIndex: number;
  width: number;
  height: number;
}

export const NativePdfRendererService = {
  isAvailable(): boolean {
    return Platform.OS === 'android' && Boolean(NativePdfRenderer);
  },

  /**
   * Opens a PDF document locally on the native Android side via PdfRenderer
   * Returns page count and default dimensions without loading pages into memory.
   */
  async openDocument(fileUri: string): Promise<PdfDocumentInfo> {
    if (!this.isAvailable()) {
      throw new Error('NativePdfRenderer is only available on Android');
    }
    return await NativePdfRenderer.openDocument(fileUri);
  },

  /**
   * Renders a single page on-demand using Android's hardware PdfRenderer
   * Stores the rendered image in an LRU-bounded file cache and returns its local file URI.
   */
  async renderPage(
    documentId: string,
    pageIndex: number,
    targetWidth: number,
    targetHeight: number,
    quality = 85
  ): Promise<RenderedPageInfo> {
    if (!this.isAvailable()) {
      throw new Error('NativePdfRenderer is only available on Android');
    }
    return await NativePdfRenderer.renderPage(
      documentId,
      pageIndex,
      Math.round(targetWidth),
      Math.round(targetHeight),
      quality
    );
  },

  /**
   * Closes the PdfRenderer, ParcelFileDescriptor, and purges session image cache files.
   */
  async closeDocument(documentId: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return true;
    }
    try {
      return await NativePdfRenderer.closeDocument(documentId);
    } catch {
      return false;
    }
  },
};
