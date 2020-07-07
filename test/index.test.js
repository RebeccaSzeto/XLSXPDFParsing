const index = require("../index");
const chai = require("chai");
const chaiHttp = require("chai-http");
const path = require("path");
const { expect } = chai;
chai.use(chaiHttp);

describe('GET /document/:id', () => {
    it('returns a document by id', done => {
        var doc = {
            id: '27d34930-19cb-47dd-87ec-eb42295f72e2'
        };
        chai.request(index).get('/document/' + doc.id)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done(err);
            });
    });

    it('returns status 404 when id is not found', done => {
        var doc = {
            id: 'fakeId'
        }
        chai.request(index).get('/document/' + doc.id)
            .end((err, res) => {
                expect(res).to.have.status(404);
                done(err);
            });
    });
});

describe('POST /upload', () => {
    it('uploads document', done => {
        chai.request(index).post('/upload')
            .field("Content-Type", "multipart/form-data")
            .field("email", "testuser@domain.com")
            .attach("file", path.resolve(__dirname, "some.pdf"))
            .end((err, res) => {
                done(err);
            });
    });
    it('returns status 400 when no file uploaded', done => {
        chai.request(index).post('/upload')
            .field("Content-Type", "multipart/form-data")
            .field("email", "testuser@domain.com")
            .attach("file", "")
            .end((err, res) => {
                expect(res).to.have.status(400);
                done(err);
            });
    });

    it('cannot upload without email', done => {
        chai.request(index).post('/upload')
            .field("Content-Type", "multipart/form-data")
            .field("email", "")
            .attach("file", path.resolve(__dirname, "../some.pdf"))
            .end((err, res) => {
                done(err);
            });
    });
});