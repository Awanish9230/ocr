import re
from typing import Dict, Any, List

def validate_pan(pan: str) -> bool:
    if not pan:
        return False
    return bool(re.match(r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$", str(pan).upper()))

def validate_gstin(gstin: str) -> bool:
    if not gstin:
        return False
    return bool(re.match(r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$", str(gstin).upper()))

def validate_ifsc(ifsc: str) -> bool:
    if not ifsc:
        return False
    return bool(re.match(r"^[A-Z]{4}0[A-Z0-9]{6}$", str(ifsc).upper()))

def validate_account_number(acc_num: str) -> bool:
    if not acc_num:
        return False
    return bool(re.match(r"^\d{9,18}$", str(acc_num)))

def validate_date(date_str: str) -> bool:
    if not date_str:
        return False
    return bool(re.match(r"^\d{4}-\d{2}-\d{2}$", str(date_str)))

def validate_document_data(doc_type: str, data: Dict[str, Any]) -> List[str]:
    errors = []
    
    if doc_type == "Bank Statement":
        if not data.get("bank_name"):
            errors.append("Mandatory field 'bank_name' is missing")
        if data.get("ifsc_code") and not validate_ifsc(data.get("ifsc_code")):
            errors.append("Invalid IFSC format")
        if data.get("account_number") and not validate_account_number(data.get("account_number")):
            errors.append("Invalid Account Number format")
            
    elif doc_type == "Income Tax Return" or doc_type == "ITR":
        if not data.get("pan"):
            errors.append("Mandatory field 'pan' is missing")
        elif not validate_pan(data.get("pan")):
            errors.append("Invalid PAN format")
            
    elif doc_type == "GST Return":
        if not data.get("gstin"):
            errors.append("Mandatory field 'gstin' is missing")
        elif not validate_gstin(data.get("gstin")):
            errors.append("Invalid GSTIN format")
            
    elif doc_type == "Salary Slip":
        if not data.get("employee_name"):
            errors.append("Mandatory field 'employee_name' is missing")
        if data.get("pan") and not validate_pan(data.get("pan")):
            errors.append("Invalid PAN format")
            
    elif doc_type == "Invoice":
        if not data.get("invoice_number"):
            errors.append("Mandatory field 'invoice_number' is missing")
        if data.get("date") and not validate_date(data.get("date")):
            errors.append("Invalid Date format (expected YYYY-MM-DD)")
            
    return errors
