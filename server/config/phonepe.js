const dotenv = require('dotenv');

dotenv.config();

const phonepeConfig = {
    merchantId: process.env.PHONEPE_MERCHANT_ID,
    saltKey: process.env.PHONEPE_SALT_KEY,
    saltIndex: process.env.PHONEPE_SALT_INDEX || 1,
    env: process.env.PHONEPE_ENV || 'STAGING', // 'STAGING' or 'PRODUCTION'
    apiEndpoint: process.env.PHONEPE_ENV === 'PRODUCTION'
        ? 'https://api.phonepe.com/apis/hermes'
        : 'https://api-preprod.phonepe.com/apis/pg-sandbox',
};

module.exports = phonepeConfig;
