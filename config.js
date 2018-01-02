const fs = require('fs');

module.exports = {
  name: 'API',
  version: '0.4.0',
	env: process.env.NODE_ENV || 'development',
	port: process.env.PORT || 3001,
	base_url: process.env.BASE_URL || 'http://localhost:3001',
	microservice_url: process.env.MICROSERVICE_URL || 'http://localhost:3021'
};