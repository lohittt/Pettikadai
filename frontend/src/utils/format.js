export const MAX_QTY = 99;

export const ADDRESS_STORAGE_KEY = 'shopease_address';

export function formatINR(value) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(value);
}
