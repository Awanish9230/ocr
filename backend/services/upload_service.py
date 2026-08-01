import cloudinary
import cloudinary.uploader
from backend.core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

def upload_file_to_cloudinary(file_content: bytes, filename: str) -> dict:
    result = cloudinary.uploader.upload(
        file_content,
        folder="autoparse",
        resource_type="auto",
        public_id=filename.split('.')[0]
    )
    return {
        "url": result.get("secure_url"),
        "public_id": result.get("public_id"),
        "format": result.get("format")
    }

def delete_file_from_cloudinary(public_id: str):
    cloudinary.uploader.destroy(public_id)
