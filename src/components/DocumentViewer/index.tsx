import { useState } from 'react'
import { pdfjs, Document, Page } from 'react-pdf'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function DocumentViewer({ file }: { file: string }) {
  const [numPages, setNumPages] = useState<number>()

  function onDocumentLoadSuccess({ numPages: nextNumPages }: PDFDocumentProxy): void {
    setNumPages(nextNumPages)
  }

  return (
    <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
      {Array.from(new Array(numPages), (_el, index) => (
        <Page key={`page_${index + 1}`} pageNumber={index + 1} width={800} />
      ))}
    </Document>
  )
}
