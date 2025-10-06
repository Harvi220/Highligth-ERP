import { pdfjs } from "react-pdf";

// Используем локальный worker из public папки для избежания CORS проблем
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
