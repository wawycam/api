const chai = require('chai');
const supertest = require('supertest');
const config = require('../../config');
const server = require('../../index');

describe('Service API', () => {
  
  const expect = chai.expect;
  const _SuperTest = supertest(server)
  
  describe('GET /service/version', () => {
    it('should return api version', (done) => {
      _SuperTest
        .get('/service/version')
        .end((err, response) => {
            if (err) {
              done(err);
            }
            else {
              expect(response.status).to.equal(200);
              expect(response.body.version).to.equal(config.version);
              done();
            }
        });
    });
  });

  describe('GET /service/status', () => {
    it('should return api status', (done) => {
      _SuperTest
        .get('/service/status')
        .end((err, response) => {
            if (err) {
              done(err);
            }
            else {
              expect(response.status).to.equal(200);
              expect(response.body).to.equal('alive');
              done();
            }
        });
    });
  });

  describe('GET /service/info', () => {
    it('should return Wawy Uptime and Disk information', (done) => {
      _SuperTest
        .get('/service/info')
        .end((err, response) => {
            if (err) {
              done(err);
            }
            else {
              expect(response.status).to.equal(200);
              expect(response.body.uptime).to.exist;
              expect(response.body.disk).to.exist;
              done();
            }
        });
    });
  });

  describe('GET /service/serial', () => {
    it('should return Wawy serial number', (done) => {
      _SuperTest
        .get('/service/serial')
        .end((err, response) => {
            if (err) {
              done(err);
            }
            else {
              expect(response.status).to.equal(200);
              expect(response.body.serial).to.exist;
              done();
            }
        });
    });
  });
  
});
