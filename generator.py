import urllib.parse
from config import MESSAGE_TEMPLATE

def generate_message(name, vendor_name, maps_link):
    """Formats the message template with customer details."""
    return MESSAGE_TEMPLATE.format(
        name=name,
        vendor_name=vendor_name,
        maps_link=maps_link
    )

def generate_wa_link(phone, message):
    """Generates a WhatsApp deep link with the encoded message."""
    # Ensure phone number doesn't have '+' or spaces
    clean_phone = phone.strip().replace("+", "").replace(" ", "")
    
    encoded_message = urllib.parse.quote(message)
    return f"https://wa.me/{clean_phone}?text={encoded_message}"
