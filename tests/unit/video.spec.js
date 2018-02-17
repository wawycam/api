const chai = require('chai');
const supertest = require('supertest');
const config = require('../../config');
const server = require('../../index');

describe('Video API', () => {
  
  const expect = chai.expect;
  const _SuperTest = supertest(server)
  
  describe('POST /video', () => {
    it('should start recording a video', (done) => {
      _SuperTest
        .post('/video')
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

  describe('DELETE /video', () => {
    it('should stop a video recording', (done) => {
      _SuperTest
        .del('/video')
        .end((err, response) => {
            if (err) {
              done(err);
            }
            else {
              expect(response.status).to.equal(204);
              done();
            }
        });
    });
  });

  describe('POST /video/broadcast', () => {
    it('should start video broadcasting', (done) => {
      _SuperTest
        .post('/video/broadcast')
        .end((err, response) => {
            if (err) {
              done(err);
            }
            else {
              expect(response.status).to.equal(200);
              expect(response.body.url.local).to.exist;
              done();
            }
        });
    });
  });

  describe('DELETE /video/broadcast', () => {
    it('should stop video broadcasting', (done) => {
      _SuperTest
        .del('/video/broadcast')
        .end((err, response) => {
            if (err) {
              done(err);
            }
            else {
              expect(response.status).to.equal(204);
              done();
            }
        });
    });
  });
  
});
