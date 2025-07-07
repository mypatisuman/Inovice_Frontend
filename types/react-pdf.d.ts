declare module 'react-pdf' {
  import { ComponentType } from 'react';

  export interface DocumentProps {
    file: string | ArrayBuffer | null;
    children?: React.ReactNode;
    onLoadSuccess?: (pdf: any) => void;
    onLoadError?: (error: Error) => void;
    loading?: React.ReactNode;
    error?: React.ReactNode;
  }

  export interface PageProps {
    pageNumber: number;
    width?: number;
    height?: number;
    scale?: number;
    loading?: React.ReactNode;
    error?: React.ReactNode;
  }

  export const Document: ComponentType<DocumentProps>;
  export const Page: ComponentType<PageProps>;
  
  export const pdfjs: {
    GlobalWorkerOptions: {
      workerSrc: string;
    };
  };
} 