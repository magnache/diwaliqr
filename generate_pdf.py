from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER

def create_qr_pdf():
    pdf_path = 'Diwali_QR_Code.pdf'
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=25,
        alignment=TA_CENTER
    )

    instruction_style = ParagraphStyle(
        'Instruction',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#196B24')
    )

    url_style = ParagraphStyle(
        'UrlStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#0056b3')
    )

    subtitle_style = ParagraphStyle(
        'SubStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=10,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#555555')
    )

    greeting_style = ParagraphStyle(
        'GreetingStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#275317')
    )

    story = []

    # Title matching Word document colors
    title_html = '<font color="#C00000">DIWALI</font> - <font color="#196B24">INDIA\'S</font> <font color="#45B0E1">FESTIVAL</font> <font color="#E97132">OF</font> <font color="#7030A0">LIGHTS</font>'
    story.append(Paragraph(title_html, title_style))
    story.append(Spacer(1, 14))

    # Family image from Word doc
    story.append(Image('assets/images/diwali-family.png', width=380, height=214))
    story.append(Spacer(1, 18))

    # Divider bar
    divider_data = [['']]
    divider_table = Table(divider_data, colWidths=[420], rowHeights=[2])
    divider_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#E97132')),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    story.append(divider_table)
    story.append(Spacer(1, 16))

    # QR Scan Instruction
    story.append(Paragraph('SCAN QR CODE TO OPEN WEBPAGE', instruction_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph('Point your smartphone camera at this code to view the celebration page', subtitle_style))
    story.append(Spacer(1, 12))

    # QR Code Image
    story.append(Image('assets/images/qrcode.png', width=190, height=190))
    story.append(Spacer(1, 10))

    # URL Link text
    story.append(Paragraph('<u>https://magnache.github.io/diwaliqr/</u>', url_style))
    story.append(Spacer(1, 24))

    # Happy Diwali greeting
    story.append(Paragraph('HAPPY DIWALI', greeting_style))

    doc.build(story)
    print(f'Successfully generated {pdf_path}')

if __name__ == '__main__':
    create_qr_pdf()
