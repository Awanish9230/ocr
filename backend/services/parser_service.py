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
Be extremely accurate. You MUST return ONLY a valid JSON object with the following structure:
{
  "document_type": "Invoice or Receipt or Bank Statement",
  "vendor_name": "Name of the company",
  "customer_name": "Name of customer",
  "date": "YYYY-MM-DD",
  "invoice_number": "number",
  "subtotal": 100.0,
  "tax_amount": 10.0,
  "total_amount": 110.0,
  "line_items": [
    {"description": "item", "quantity": 1, "unit_price": 100.0, "amount": 100.0}
  ]
}
If a field is missing, set its value to null.
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
        total_fields = 8 # Excluding list
        score = min(99.0, round((filled_fields / total_fields) * 100, 1))
        doc.confidence_score = max(score, 65.0) # Assume at least 65% if it successfully parsed JSON
        
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
