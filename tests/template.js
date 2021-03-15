process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
{ fileIncludeString }
const allowAutomatedTesting = "allowAutomatedTesting";

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../index');
let should = chai.should();
chai.use(chaiHttp);


const testCase = () => {
    { testComplexities }
}


describe('Test { MainModel }', () => {
    beforeEach(async function() {
        { modelName }.remove({}, (error) => {
            //done();
        });
    });


    describe('/GET { tableNameLower }', () => {
        it('it should GET all the { tableNameLower }', function(done) {
            chai.request(server)
            .get('/api/v1/{ tableNameLower }')
            .send({ allowAutomatedTesting })
            .end((error, response) => {
                response.should.have.status(200);
                response.body.should.be.a('Object');
                response.body.{ tableNameLower }.should.be.a('Array');
                response.body.{ tableNameLower }.length.should.be.eql(0);
                response.body.should.have.property('totalPages');
                response.body.should.have.property('currentPage');
                done();
            });
        });
    });


    describe('/POST { modelName }', () => {

        //NOTE THE ObjectId Fields and handle testing accordingly
        //{ objectIdFields }

        { doNotPostTests }

        it('it should POST a { modelName } ', (done) => {
            testCase().then(resData => {
                let { { modelNameLower } } = resData;
                chai.request(server)
                .post('/api/v1/{ tableNameLower }')
                .send({ ...{ modelNameLower }, allowAutomatedTesting })
                .end((error, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('message').eql('{ modelName } successfully added!');
                    { shouldHaveColumns }
                    done();
                });
            });
        });
    });


    describe('/GET/:id { modelName }', () => {
        it('it should GET a { modelName } by the given id', (done) => {
            testCase().then(resData => {
                let { { modelNameLower } } = resData;
                (new { modelName }({ modelNameLower })).save((error, { modelNameLower }) => {
                    chai.request(server)
                    .get('/api/v1/{ tableNameLower }/' + { modelNameLower }.id)
                    .send({ allowAutomatedTesting })
                    .end((error, response) => {
                        response.should.have.status(200);
                        response.body.should.be.a('object');
                        { shouldHaveColumns }
                        response.body.{ modelNameLower }.should.have.property('_id').eql({ modelNameLower }.id);
                        done();
                    });
                });
            });
        });
    });


    describe('/PUT/:id { modelName }', () => {
        it('it should UPDATE a { modelName } given the id', (done) => {
            testCase().then(resData => {
                let { { modelNameLower } } = resData;
                (new { modelName }({ modelNameLower })).save((error, { modelNameLower }) => {
                    chai.request(server)
                    .put('/api/v1/{ tableNameLower }/' + { modelNameLower }.id)
                    .send({ allowAutomatedTesting, { testFakeValues }})
                    .end((error, response) => {
                        response.should.have.status(200);
                        response.body.should.be.a('object');
                        response.body.should.have.property('message').eql('{ modelName } updated!');
                        response.body.result.should.have.property('ok').eql(1);
                        response.body.result.should.have.property('n').eql(1);
                        response.body.result.should.have.property('nModified').eql(1);
                        done();
                    });
                });
            });
        });
    });


    describe('/DELETE/:id { modelName }', () => {
        it('it should DELETE a { modelName } given the id', (done) => {
            testCase().then(resData => {
                let { { modelNameLower } } = resData;
                (new { modelName }({ modelNameLower })).save((error, { modelNameLower }) => {
                    chai.request(server)
                    .delete('/api/v1/{ tableNameLower }/' + { modelNameLower }.id)
                    .send({ allowAutomatedTesting })
                    .end((error, response) => {
                        response.should.have.status(200);
                        response.body.should.be.a('object');
                        response.body.should.have.property('message').eql('{ modelName } successfully deleted!');
                        response.body.result.should.have.property('ok').eql(1);
                        response.body.result.should.have.property('n').eql(1);
                        response.body.result.should.have.property('deletedCount').eql(1);
                        done();
                    });
                });
            });
        });
    });
});