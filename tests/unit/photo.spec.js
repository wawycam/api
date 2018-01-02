const chai = require('chai');
const supertest = require('supertest');
const config = require('../../config');
const server = require('../../index');

describe('Photo API', () => {
  
  const expect = chai.expect;
  const _SuperTest = supertest(server)
  
  describe('GET /photo', () => {
    it('should list all photos (should take 6s to execute)', (done) => {
      _SuperTest
        .get('/photo')
        .end((err, response) => {
            if (err) {
              done(err);
            }
            else {
              expect(response.status).to.equal(200);
              expect(response.body.photos).to.exist;
              done();
            }
        });
    });
  });

  describe('POST /photo', () => {
    it('should take a photo', (done) => {
      _SuperTest
        .post('/photo')
        .end((err, response) => {
            if (err) {
              done(err);
            }
            else {
              expect(response.status).to.equal(200);
              expect(response.body.photo).to.exist;
              done();
            }
        });
    });
  });

  // describe('POST /photo/filter', () => {
  //   it('should apply a filter to a photo', (done) => {
  //     _SuperTest
  //       .post('/photo/filter')
  //       .send({
  //         filter: 'xpro2',
  //         photo: 'tests/fixtures/road.jpg'
  //       })
  //       .end((err, response) => {
  //           if (err) {
  //             done(err);
  //           }
  //           else {
  //             expect(response.status).to.equal(200);
  //             expect(response.body.photo).to.exist;
  //             done();
  //           }
  //       });
  //   });
  // });

  
  
});