process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
const User = require('.././models/users').User;
const allowAutomatedTesting = "allowAutomatedTesting";
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../index');
let should = chai.should();
chai.use(chaiHttp);

describe('users', () => {
    beforeEach(async function() {
        User.remove({}, (error) => {});
    });

    describe('/POST User', () => {

        it('it should not POST a User without names field', (done) => {
            let dataToSave = { email: 'admintest@gmail.com', phoneNum: '09012345678', password: 'adminTest', isValid: true };
            chai.request(server)
            .post('/api/v1/users/signup')
            .send(dataToSave)
            .end((error, response) => {
                response.should.have.status(400);
                response.body.should.be.a('object');
                response.body.should.have.property('errors');
                response.body.errors.should.have.property('message');
                done();
            });
        });

        
        it('it should not POST a User without email field', (done) => {
            let dataToSave = { names: 'Admin Test', phoneNum: '09012345678', password: 'adminTest', isValid: true };
            chai.request(server)
            .post('/api/v1/users/signup')
            .send(dataToSave)
            .end((error, response) => {
                response.should.have.status(400);
                response.body.should.be.a('object');
                response.body.should.have.property('errors');
                response.body.errors.should.have.property('message');
                done();
            });
        });

        
        it('it should not POST a User without phoneNum field', (done) => {
            let dataToSave = { names: 'Admin Test', email: 'admintest@gmail.com', password: 'adminTest', isValid: true };
            chai.request(server)
            .post('/api/v1/users/signup')
            .send(dataToSave)
            .end((error, response) => {
                response.should.have.status(400);
                response.body.should.be.a('object');
                response.body.should.have.property('errors');
                response.body.errors.should.have.property('message');
                done();
            });
        });

        
        it('it should not POST a User without password field', (done) => {
            let dataToSave = { names: 'Admin Test', email: 'admintest@gmail.com', phoneNum: '09012345678', isValid: true };
            chai.request(server)
            .post('/api/v1/users/signup')
            .send(dataToSave)
            .end((error, response) => {
                response.should.have.status(400);
                response.body.should.be.a('object');
                response.body.should.have.property('errors');
                response.body.errors.should.have.property('message');
                done();
            });
        });

        
        it('it should not POST a User without isValid field', (done) => {
            let dataToSave = { names: 'Admin Test', email: 'admintest@gmail.com', phoneNum: '09012345678', password: 'adminTest' };
            chai.request(server)
            .post('/api/v1/users/signup')
            .send(dataToSave)
            .end((error, response) => {
                response.should.have.status(400);
                response.body.should.be.a('object');
                response.body.should.have.property('errors');
                response.body.errors.should.have.property('message');
                done();
            });
        });


        it('it should Create A User Account ', (done) => {
            let dataToSave = { names: 'Admin Test', email: 'admintest@gmail.com', phoneNum: '09012345678', password: 'adminTest', isValid: true };
            chai.request(server)
            .post('/api/v1/users/signup')
            .send(dataToSave)
            .end((error, response) => {
                response.should.have.status(201);
                response.body.should.be.a('object');
                response.body.should.have.property('message').eql('User Account successfully created!');
                response.body.data.should.have.property('token');
                response.body.data.should.have.property('userId');
                response.body.data.should.have.property('userRole');
                done();
            });
        });


        it('it should Log In A User', (done) => {
            let userObj = { names: 'Admin Test 2', email: 'admintest2@gmail.com', phoneNum: '0901234567X', isValid: true };
            bcrypt.hash("adminTest2", 10).then((hash) => {
                let userData = { ...userObj, password: hash };
                (new User(userData)).save()
                .then(result => {
                    const {_id, email, userRole = 0 } = result._id;
                    const payLoadParam = [_id, email, userRole].join('!~+=');
                    const token = jwt.sign({userId: payLoadParam}, 'RANDOM_TOKEN_SECRET', {expiresIn:'24h'});

                    chai.request(server)
                    .post('/api/v1/users/login')
                    .send({ email: 'admintest2@gmail.com', password: 'adminTest2', allowAutomatedTesting })
                    .end((error, response) => {
                        response.should.have.status(201);
                        response.body.should.be.a('object');
                        response.body.should.have.property('message').eql('success');
                        response.body.data.should.have.property('token');
                        response.body.data.should.have.property('userId');
                        response.body.data.should.have.property('userRole');
                        done();
                    });
                })
                .catch(error => console.log(error));
            }).catch(error => console.log(error));
        });
    });


    describe('/GET/:id User', () => {
        it('it should GET a User by the given id', (done) => {
            let user = new User({ 
                names: 'Admin Test 2', email: 'admintest2@gmail.com', phoneNum: '0901234567X', password: 'adminTest2', isValid: true 
            });

            user.save((error, user) => {
                chai.request(server)
                .get('/api/v1/users/' + user.id)
                .send({ allowAutomatedTesting })
                .end((error, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.user.should.have.property('names');
                    response.body.user.should.have.property('email');
                    response.body.user.should.have.property('phoneNum');
                    response.body.user.should.have.property('password');
                    response.body.user.should.have.property('isValid');
                    response.body.user.should.have.property('_id').eql(user.id);
                    done();
                });
            });
        });
    });


    describe('/PUT/:id User', () => {
        it('it should UPDATE a User given the id', (done) => {
            let user = new User({
                names: 'Admin Test 2', email: 'admintest2@gmail.com', phoneNum: '0901234567X', password: 'adminTest2', isValid: true
            });

            user.save((error, user) => {
                chai.request(server)
                .put('/api/v1/users/' + user.id)
                .send({ isValid: false, allowAutomatedTesting })
                .end((error, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('message').eql('User updated!');
                    response.body.result.should.have.property('ok').eql(1);
                    response.body.result.should.have.property('n').eql(1);
                    response.body.result.should.have.property('nModified').eql(1);
                    done();
                });
            });
        });
    });


    describe('/DELETE/:id User', () => {
        it('it should DELETE a User given the id', (done) => {
            let user = new User({
                names: 'Admin Test 2', email: 'admintest2@gmail.com', phoneNum: '0901234567X', password: 'adminTest2', isValid: true
            });
            user.save((error, user) => {
                chai.request(server)
                .delete('/api/v1/users/' + user.id)
                .send({ allowAutomatedTesting })
                .end((error, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('message').eql('User successfully deleted!');
                    response.body.result.should.have.property('ok').eql(1);
                    response.body.result.should.have.property('n').eql(1);
                    response.body.result.should.have.property('deletedCount').eql(1);
                    done();
                });
            });
        });
    });

    after(async function() {
        User.remove({}, (error) => {});
    });
});