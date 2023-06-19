import html2Canvas from 'html2canvas';

export async function export_pdf(html, num){
  let top = html
  if (top != null) {
    top.scrollIntoView();
    top = null;
  }
  let title = "N." + num;
  const container = html
  console.log("[exportPdf]N.", num)
  html2Canvas(container, {
    scale: 3,
    useCORS: true 
  }).then(function (canvas) {
    let base64Image = canvas.toDataURL('image/jpeg', 1.0);
    let options = {
      data: base64Image,
      documentSize: "A4",
      type: "jpeg",
      fileName: `${title}.pdf`,
      directory: "docs",
      base64: true,
      displayHeaderFooter : true
    };
    document.addEventListener('deviceready', function() {
    window.plugin.htmltopdf.create(options,
      function(filePath) {
        console.log('[exportPdf]pdf save', filePath);
        window.plugins.socialsharing.share(null, null, filePath, null);
      },
      function(error) {
        console.error("[exportPdf]Failed to save pdf", error);
      }
    )
  })
}, false)
}
/*
import html2Canvas from 'html2canvas';
import JsPDF from 'jspdf';

export async function export_pdf(html, num){
  let top = html
  if (top != null) {
    top.scrollIntoView();
    top = null;
  }
  let title = "N." + num;
  const container = html
  console.log("[exportPdf]N.", num)
    html2Canvas(container, {
        scale: 3,
        useCORS: true 
    }).then(function (canvas) {
        获取canvas画布的宽高
        let contentWidth = canvas.width;
        let contentHeight = canvas.height;
        一页pdf显示html页面生成的canvas高度
        let pageHeight = 841.89;
        未生成pdf的html页面宽度
        let leftHeight = contentHeight;
        页面偏移
        let position = 0;
        html页面生成的canvas在pdf中图片的宽高
        let imgWidth = 595.28;
        let imgHeight = imgWidth / contentWidth * contentHeight;
        let PDF = new JsPDF('p', 'pt', 'a4');
        let pageData = canvas.toDataURL('image/jpeg', 0.98);
        PDF.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
        
        Convert PDF to blob
        const pdfOutput = PDF.output('blob');
        
        Use Cordova File plugin to write the PDF to the filesystem
        const fileName = `${title}.pdf`;

        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(directoryEntry) {
          directoryEntry.getFile(fileName, { create: true }, function(fileEntry) {
              fileEntry.createWriter(function(fileWriter) {
                fileWriter.onwriteend = function() {
                    console.log("[exportPdf]pdf save");
                    const fileURL = fileEntry.toURL();
                    window.plugins.socialsharing.share(null, null, fileURL, null);
                    
                };
                fileWriter.onerror = function(e) {
                    console.error("[exportPdf]Failed to save pdf", e);
                };
                fileWriter.write(pdfOutput);
              }, function(e) {
                  console.error("[exportPdf]Failed to create file writer", e);
              });
          }, function(e) {
              console.error("[exportPdf]Failed to get file", e);
          });
      }, function(e) {
          console.error("[exportPdf]Failed to resolve file system URL", e);
      });
  });
}*/