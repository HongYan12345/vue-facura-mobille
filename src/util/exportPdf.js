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
  // 使用 scrollWidth/scrollHeight 捕获完整内容高度，避免只截取首屏
  const rect = container && container.getBoundingClientRect ? container.getBoundingClientRect() : { width: 794, height: 1123 };
  const targetWidth = Math.max(1, Math.round((container && container.scrollWidth) ? container.scrollWidth : rect.width));
  const targetHeight = Math.max(1, Math.round((container && container.scrollHeight) ? container.scrollHeight : rect.height));
  console.log("[exportPdf]N.", num)
  html2Canvas(container, {
    scale: 3,
    useCORS: true,
    width: targetWidth,
    height: targetHeight,
    windowWidth: targetWidth,
    windowHeight: targetHeight,
    backgroundColor: '#ffffff'
  }).then(function (canvas) {
    // 获取canvas画布的宽高（加入保护，避免为0）
    console.log('[exportPdf] canvas size:', canvas.width, canvas.height)
    let contentWidth = canvas.width;
    let contentHeight = canvas.height;
    
    // A4纸的尺寸[595.28, 841.89]，单位pt
    let pageHeight = 841.89;
    let pageWidth = 595.28;
    if (!contentWidth || contentWidth <= 0) contentWidth = pageWidth;
    if (!contentHeight || contentHeight <= 0) contentHeight = pageHeight;
    
    // 将高度换算到 PDF 单位（pt），保持单位一致
    // 以 imgWidth = pageWidth 为基准缩放，按比例换算得到 imgHeight（pt）
    let imgWidth = pageWidth;
    let imgHeight = pageWidth / contentWidth * contentHeight; // pt

    // 保持满宽输出：不在轻微溢出时整体缩小，改为正常分页
    const smallOverflow = imgHeight - pageHeight;
    console.log('[exportPdf] computed img size pt:', imgWidth, imgHeight, 'overflow:', smallOverflow)
    
    // 创建PDF对象
    let PDF = new JsPDF('p', 'pt', 'a4');
    // 计算总页数（pt 单位），加入微小容差避免浮点误差导致多一页
    const epsilon = 4; // 4pt 容差，进一步避免第二页后产生空白第三页
    const totalPages = Math.max(1, Math.ceil((imgHeight - epsilon) / pageHeight));
    let currentPage = 1;
    
    // 生成页面数据
    let pageData = canvas.toDataURL('image/jpeg', 1.0);
    
    // 当内容未超过a4纸一页显示的范围，无需分页（加入容差）
    if (imgHeight <= pageHeight + epsilon) {
      try {
        PDF.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
      } catch (e) {
        console.error('[exportPdf] addImage error (single page):', e)
      }
      PDF.setFontSize(10);
      PDF.text(`Page 1/1`, pageWidth - 60, pageHeight - 20);
    } else {
      // 固定切片分页，彻底避免尾部空白页
      for (let i = 0; i < totalPages; i++) {
        const position = -i * pageHeight;
        try {
          PDF.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight);
        } catch (e) {
          console.error('[exportPdf] addImage error (multi page slice):', e)
          break;
        }
        // 遮罩切片边缘：在续页顶部绘制白色矩形，避免上缘出现分割线
        if (i > 0) {
          try {
            PDF.setFillColor(255, 255, 255);
            PDF.rect(0, 0, pageWidth, 3, 'F'); // 3pt 高度足以覆盖 1px 的边框线
          } catch (e) {
            console.warn('[exportPdf] mask top seam failed:', e)
          }
        }
        PDF.setFontSize(10);
        PDF.text(`Page ${i + 1}/${totalPages}`, pageWidth - 60, pageHeight - 20);
        if (i < totalPages - 1) PDF.addPage();
      }
    }
    
    // 保存PDF文件
    try {
      PDF.save(`${title}.pdf`);
    } catch (e) {
      console.error('[exportPdf] save error:', e)
    }
    
    // 如果需要使用Cordova插件分享，可以使用以下代码
    try {
      // 转换为blob
      const pdfOutput = PDF.output('blob');
      
      // 使用Cordova插件保存和分享
      document.addEventListener('deviceready', function() {
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(directoryEntry) {
          directoryEntry.getFile(`${title}.pdf`, { create: true }, function(fileEntry) {
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
            });
          });
        });
      }, false);
    } catch (e) {
      console.log("[exportPdf] Cordova plugin not available, using direct download");
    }
  });
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