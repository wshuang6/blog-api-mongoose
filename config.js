exports.DATABASE_URL = process.env.DATABASE_URL || global.DATABASE_URL || 'mongodb://username:username123@ds137360.mlab.com:37360/blog-api';
exports.PORT = process.env.port || 8080;