import { Document } from '@/src/models/Document';

export class DocumentValidator {
  /**
   * Runs business logic validation on the extracted data.
   * Returns a record of errors, or null if perfectly valid.
   */
  static validate(extractedData: Record<string, any>, documentType: string): Record<string, string> | null {
    const errors: Record<string, string> = {};

    if (!extractedData) return { data: 'No data extracted' };

    const strData = JSON.stringify(extractedData).toUpperCase();

    // Generic PAN Validation if PAN key exists or if we expect PAN
    if (strData.includes('PAN')) {
      const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
      const foundPan = panRegex.exec(strData);
      if (!foundPan) {
        // We only warn if the documentType strictly requires a PAN, otherwise we might just skip.
        if (['ITR', 'SALARYSLIP', 'FORM16'].includes(documentType.toUpperCase())) {
          errors['pan'] = 'PAN number is required but could not be validated or found in the correct format.';
        }
      }
    }

    // Generic GST Validation
    if (documentType.toUpperCase() === 'INVOICE') {
      // Very basic check if GSTIN is present
      const gstRegex = /[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}/;
      const foundGst = gstRegex.exec(strData);
      if (!foundGst) {
        errors['gst'] = 'GSTIN format is invalid or missing in the invoice.';
      }
    }

    // Account Number & IFSC for Bank Statements
    if (documentType.toUpperCase() === 'BANKSTATEMENT') {
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      // We look inside the object values for a match
      const values = Object.values(extractedData).map(v => String(v).toUpperCase());
      const hasIfsc = values.some(v => ifscRegex.test(v));
      if (!hasIfsc) {
        errors['ifsc'] = 'IFSC code is missing or invalid.';
      }
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }
  
  /**
   * Checks if this document is a duplicate based on file hash or exact parsed data match
   * For a robust system, we would hash the file buffer, but here we can check by originalFilename and uploader for simplicity.
   */
  static async checkDuplicate(filename: string, uploaderId: string): Promise<boolean> {
    const existing = await Document.findOne({
      uploaderId,
      originalFilename: filename,
      status: { $in: ['Completed', 'Validation_Pending'] }
    });
    return !!existing;
  }
}
