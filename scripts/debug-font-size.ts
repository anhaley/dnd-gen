import { readFileSync } from "fs";
import { join } from "path";
import { PDFDocument, PDFTextField } from "pdf-lib";

async function main() {
  const pdfPath = join(process.cwd(), "public", "templates", "character-sheet.pdf");
  const bytes = readFileSync(pdfPath);
  const pdf = await PDFDocument.load(bytes);
  const form = pdf.getForm();
  const fields = form.getFields();

  const withDA: string[] = [];
  const withoutDA: string[] = [];

  for (const field of fields) {
    if (!(field instanceof PDFTextField)) continue;
    const name = field.getName();
    try {
      field.setFontSize(10);
      field.setFontSize(0); // reset
      withDA.push(name);
    } catch {
      withoutDA.push(name);
    }
  }

  console.log(`Text fields WITH /DA (${withDA.length}):`);
  for (const n of withDA) console.log(`  ${n}`);
  console.log(`\nText fields WITHOUT /DA (${withoutDA.length}):`);
  for (const n of withoutDA) console.log(`  ${n}`);
}

main().catch(console.error);
