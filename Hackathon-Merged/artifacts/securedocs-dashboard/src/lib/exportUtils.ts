export const generateAndDownloadFile = (
  filename: string,
  content: string | Blob,
  mimeType: string,
  onSuccess?: () => void,
  onError?: (err: any) => void
) => {
  try {
    let blob: Blob;
    if (content instanceof Blob) {
      blob = content;
    } else {
      blob = new Blob([content], { type: mimeType });
    }
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    if (onSuccess) onSuccess();
  } catch (error) {
    console.error(`Export failed for ${filename}:`, error);
    if (onError) onError(error);
  }
};

export const getMockPdfContent = (title: string, details: string) => {
  return `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 150 >>
stream
BT
/F1 24 Tf
100 700 Td
(${title.replace(/[()]/g, '')}) Tj
/F1 12 Tf
0 -40 Td
(${details.replace(/[()]/g, '')}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000222 00000 n 
0000000420 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
508
%%EOF`;
};

export const getMockCsvContent = (title: string) => {
  return `ID,Name,Type,Date,Status\n1,${title},Report,2026-09-09,Verified\n2,Sample Entry,Data,2026-09-08,Pending`;
};

export const getMockExcelContent = (title: string) => {
  return `ID\tName\tType\tDate\tStatus\n1\t${title}\tReport\t2026-09-09\tVerified\n2\tSample Entry\tData\t2026-09-08\tPending`;
};

export const getMockZipContent = () => {
  const zipBytes = new Uint8Array([80, 75, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  return new Blob([zipBytes], { type: 'application/zip' });
};
