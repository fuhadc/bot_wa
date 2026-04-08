export function generateMessage(customerName: string, vendorName: string, mapsLink: string): string {
    return `Hi ${customerName},

Thank you for visiting ${vendorName} 😊

We’d really appreciate your feedback. Please leave us a review:

${mapsLink}`;
}

export function generateWaLink(phone: string, message: string): string {
    // Clear non-numeric chars from phone
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
