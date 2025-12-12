import { jsPDF } from 'jspdf';
import fastLogo from '@/assets/fast-malhas-logo.png';

interface ProductForPDF {
  code: string;
  name: string;
  composition: string | null;
  weight_gsm: number | null;
  width_cm: number | null;
  yield_m_kg: number | null;
}

export const generateProductsPDF = async (products: ProductForPDF[], title: string = 'Relação de Artigos') => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 15;
  const marginRight = 15;
  const contentWidth = pageWidth - marginLeft - marginRight;

  // Load logo
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  try {
    const logoImg = await loadImage(fastLogo);
    
    const addHeader = () => {
      // Green header bar
      doc.setFillColor(0, 155, 58);
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      // Logo
      doc.addImage(logoImg, 'PNG', marginLeft, 5, 50, 25);
      
      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text(title, pageWidth - marginRight, 20, { align: 'right' });
      
      // Date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const today = new Date().toLocaleDateString('pt-BR');
      doc.text(`Data: ${today}`, pageWidth - marginRight, 28, { align: 'right' });
    };

    addHeader();

    let yPos = 45;
    const lineHeight = 8;
    const itemsPerPage = Math.floor((pageHeight - 60) / (lineHeight * 4 + 10));

    // Table header styling
    const drawTableHeader = () => {
      doc.setFillColor(50, 50, 50);
      doc.rect(marginLeft, yPos - 5, contentWidth, 8, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      
      doc.text('CÓD.', marginLeft + 2, yPos);
      doc.text('ARTIGO', marginLeft + 22, yPos);
      doc.text('COMPOSIÇÃO', marginLeft + 80, yPos);
      doc.text('GRAM.', marginLeft + 130, yPos);
      doc.text('LARG.', marginLeft + 148, yPos);
      doc.text('REND.', marginLeft + 166, yPos);
      
      yPos += 8;
    };

    drawTableHeader();

    products.forEach((product, index) => {
      // Check if new page needed
      if (yPos > pageHeight - 25) {
        doc.addPage();
        addHeader();
        yPos = 45;
        drawTableHeader();
      }

      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(marginLeft, yPos - 4, contentWidth, lineHeight, 'F');
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(0, 100, 40);
      doc.text(product.code || '', marginLeft + 2, yPos);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 30, 30);
      
      // Name - truncate if too long
      const name = product.name || '';
      const truncatedName = name.length > 28 ? name.substring(0, 28) + '...' : name;
      doc.text(truncatedName, marginLeft + 22, yPos);
      
      // Composition - truncate
      const composition = product.composition || '';
      const truncatedComp = composition.length > 22 ? composition.substring(0, 22) + '...' : composition;
      doc.setFontSize(6);
      doc.text(truncatedComp, marginLeft + 80, yPos);
      
      doc.setFontSize(7);
      doc.text(product.weight_gsm?.toString() || '-', marginLeft + 132, yPos);
      doc.text(product.width_cm?.toString() || '-', marginLeft + 150, yPos);
      doc.text(product.yield_m_kg?.toString() || '-', marginLeft + 168, yPos);

      yPos += lineHeight;
    });

    // Footer
    const totalProducts = products.length;
    doc.setFillColor(0, 155, 58);
    doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`Total: ${totalProducts} artigos`, pageWidth / 2, pageHeight - 6, { align: 'center' });

    // Generate filename
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const filename = `Artigos_FAST_${dateStr}.pdf`;
    
    doc.save(filename);
    
    return true;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
};
