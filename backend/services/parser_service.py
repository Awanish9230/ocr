from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from typing import List, Optional
import json
import traceback

from backend.core.config import settings
from backend.models.document import Document, DocumentStatusEnum
from backend.core.database import SessionLocal

class LineItem(BaseModel):
    description: str = Field(description="Description of the item or service")
    quantity: Optional[float] = Field(None, description="Quantity of items")
    unit_price: Optional[float] = Field(None, description="Price per unit")
    amount: float = Field(description="Total amount for this line item")

class ExtractedFinancialData(BaseModel):
    document_type: str = Field(description="The type of document, e.g., 'Invoice', 'Receipt', 'Bank Statement', 'Salary Slip'")
    vendor_name: Optional[str] = Field(None, description="The name of the company or person issuing the document")
    customer_name: Optional[str] = Field(None, description="The name of the customer or recipient")
    date: Optional[str] = Field(None, description="The primary date of the document in YYYY-MM-DD format")
    invoice_number: Optional[str] = Field(None, description="The invoice or receipt number")
    subtotal: Optional[float] = Field(None, description="The subtotal before taxes")
    tax_amount: Optional[float] = Field(None, description="The total tax amount")
    total_amount: Optional[float] = Field(None, description="The total amount of the document")
    line_items: List[LineItem] = Field(default_factory=list, description="List of items or transactions found in the document")

def process_document(doc_id: str, file_content: bytes, mime_type: str):
    # This runs in background, so we create our own db session
    db = SessionLocal()
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        db.close()
        return

    doc.status = DocumentStatusEnum.Processing
    db.commit()

    try:
        keys = settings.get_gemini_keys
        if not keys:
            raise Exception("No Gemini API key found in configuration")
            
        client = genai.Client(api_key=keys[0])
        
        prompt = """Extract all available financial data from this document into JSON format.
Identify the type of document first (e.g., 'Invoice', 'Receipt', 'Bank Statement', 'Salary Slip').

If it is an Invoice or Receipt, use this structure:
{
  "document_type": "Invoice",
  "vendor_name": "...",
  "customer_name": "...",
  "date": "YYYY-MM-DD",
  "invoice_number": "...",
  "subtotal": 100.0,
  "tax_amount": 10.0,
  "total_amount": 110.0,
  "line_items": [
    {"description": "...", "quantity": 1, "unit_price": 100.0, "amount": 100.0}
  ]
}

If it is a Bank Statement, use this structure:
{
  "document_type": "Bank Statement",
  "bank_name": "...",
  "account_name": "...",
  "statement_period": "...",
  "opening_balance": 100.0,
  "closing_balance": 200.0,
  "transactions": [
    {"date": "YYYY-MM-DD", "description": "...", "debit": 50.0, "credit": null, "balance": 150.0}
  ]
}

If it is a Salary Slip, use this structure:
{
  "document_type": "Salary Slip",
  "employer_name": "...",
  "employee_name": "...",
  "pay_period": "...",
  "net_pay": 5000.0,
  "earnings": [
    {"description": "Basic Pay", "amount": 3000.0}
  ],
  "deductions": [
    {"description": "Tax", "amount": 500.0}
  ]
}

Return ONLY a valid JSON object. If a field is missing, set its value to null.
"""
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                prompt,
                types.Part.from_bytes(data=file_content, mime_type=mime_type)
            ],
            config={
                'response_mime_type': 'application/json',
                'temperature': 0.1
            }
        )
        
        parsed_data = json.loads(response.text)
        
        doc.extracted_data = parsed_data
        doc.document_type = parsed_data.get("document_type", "Unknown")
        
        # Generate a synthetic confidence score
        filled_fields = sum(1 for v in parsed_data.values() if v is not None and v != [])
        total_fields = len(parsed_data.keys())
        score = min(99.0, round((filled_fields / total_fields) * 100, 1)) if total_fields > 0 else 65.0
        doc.confidence_score = max(score, 65.0)
        
        doc.status = DocumentStatusEnum.Validation_Pending
        db.commit()
        
    except Exception as e:
        print(f"Error parsing document {doc_id}: {str(e)}")
        traceback.print_exc()
        doc.status = DocumentStatusEnum.Failed
        doc.validation_errors = {"error": str(e)}
        db.commit()
    finally:
        db.close()
