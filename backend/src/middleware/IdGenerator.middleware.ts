const generateRandomId = (length = 32) => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export const generateId = (prefix: string | any[], digits = 64) => {
    const randomId = generateRandomId(digits - prefix.length - 1);
    return `${prefix}_${randomId}`;
};

export const generateActivationCode = (length = 16) => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export const generateDefaultPassword = (length = 16) => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};


export default generateId;
