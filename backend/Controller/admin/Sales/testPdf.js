
const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument();
const stream = fs.createWriteStream('standalone-test.pdf');
doc.pipe(stream);

doc.fontSize(12).text('Standalone PDF Test', 50, 50);
doc.end();

stream.on('finish', () => {
    console.log('Standalone PDF generated at standalone-test.pdf');
});