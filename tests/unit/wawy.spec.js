const chai = require('chai');
const supertest = require('supertest');
const config = require('../../config');
const server = require('../../index');

describe('WaWy API', () => {
  
  const expect = chai.expect;
  const _SuperTest = supertest(server)
  let name = '';
  let rotation = '';

  describe('GET /wawy', () => {
    it('should return WaWy Informations', (done) => {
      _SuperTest
        .get('/wawy')
        .end((err, response) => {
            if (err) {
              done(err);
            }
            else {
              expect(response.status).to.equal(200);
              expect(response.body.serial).to.exist;
              expect(response.body.name).to.exist;
              expect(response.body.rotation).to.exist;

              name = response.body.name;
              rotation = response.body.rotation;
              done();
            }
        });
    });
  });

  describe('POST /wawy/name', () => {
    it('should set WaWy Camera Name', (done) => {
      _SuperTest
        .post('/wawy/name')
        .send({
          name: name
        })
        .end((err, response) => {
            if (err) {
              done(err);
            }
            else {
              expect(response.status).to.equal(201);
              done();
            }
        });
    });
  });

  describe('POST /wawy/rotation', () => {
    it('should set camera rotation lens', (done) => {
      _SuperTest
        .post('/wawy/rotation')
        .send({
          degree: rotation
        })
        .end((err, response) => {
            if (err) {
              done(err);
            }
            else {
              expect(response.status).to.equal(201);
              done();
            }
        });
    });
  });

  describe('POST /wawy/qrcode', () => {
    it('should set qrcode based on Wawy cam name', (done) => {
      _SuperTest
        .post('/wawy/qrcode')
        .send({
          name: name
        })
        .end((err, response) => {
            if (err) {
              done(err);
            }
            else {
              expect(response.status).to.equal(201);
              done();
            }
        });
    });
  });

  describe('GET /wawy/qrcode.svg', () => {
    it('should get svg qrcode', (done) => {
      _SuperTest
        .get('/wawy/qrcode.svg')
        .end((err, response) => {
            if (err) {
              done(err);
            }
            else {
              expect(response.status).to.equal(200);
              done();
            }
        });
    });
  });
  
});
