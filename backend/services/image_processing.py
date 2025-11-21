from PIL import Image
import io

def convert_image(file_content: bytes, target_format: str) -> io.BytesIO:
    """
    Convert an image file to the target format.
    """
    try:
        image = Image.open(io.BytesIO(file_content))

        # Convert to RGB if saving as JPEG (to handle RGBA pngs)
        if target_format.upper() == "JPEG" or target_format.upper() == "JPG":
            if image.mode in ("RGBA", "P"):
                image = image.convert("RGB")

        output = io.BytesIO()
        image.save(output, format=target_format.upper())
        output.seek(0)
        return output
    except Exception as e:
        raise ValueError(f"Image conversion failed: {str(e)}")

def apply_image_operation(file_content: bytes, operation: str) -> io.BytesIO:
    """
    Apply various editing operations to an image.
    """
    try:
        image = Image.open(io.BytesIO(file_content))
        original_format = image.format if image.format else "PNG" # Default to PNG if format is None

        if operation == "rotate_left":
            image = image.transpose(Image.ROTATE_90)
        elif operation == "rotate_right":
            image = image.transpose(Image.ROTATE_270)
        elif operation == "flip_horizontal":
            image = image.transpose(Image.FLIP_LEFT_RIGHT)
        elif operation == "flip_vertical":
            image = image.transpose(Image.FLIP_TOP_BOTTOM)
        elif operation == "grayscale":
            image = image.convert("L") # Convert to grayscale
        else:
            raise ValueError(f"Unsupported image operation: {operation}")

        output = io.BytesIO()
        image.save(output, format=original_format)
        output.seek(0)
        return output
    except Exception as e:
        raise ValueError(f"Image operation failed: {str(e)}")