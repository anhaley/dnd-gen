import { readFileSync } from "fs";
import { join } from "path";
import { PDFDocument } from "pdf-lib";

async function main() {
  const pdfPath = join(process.cwd(), "public", "templates", "character-sheet.pdf");
  const bytes = readFileSync(pdfPath);
  const pdf = await PDFDocument.load(bytes);
  const form = pdf.getForm();
  const fields = form.getFields();

  console.log(`Found ${fields.length} form fields:\n`);

  for (const field of fields) {
    const name = field.getName();
    const type = field.constructor.name;
    console.log(`  [${type}] ${name}`);
  }
}

main().catch(console.error);
