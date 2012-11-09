define(function(require) {

var HomepageSubject = require('models/homepage_subject');

describe("HomepageSubject Model", function() {

  beforeEach(function() {
    this.model = new HomepageSubject({ });
  });
 
  describe("when instantiated", function() {
    it("should set id attribute to _id", function() {
      this.model.set({_id: 1}) 
      expect(this.model.id).to.equal(1);
    });
    it("should set url", function() {
      this.model.set({_id: 1}) 
      expect(this.model.url).to.equal('/subjects-home');
    });

  });


  describe("when saving", function() {
    beforeEach(function() {
      this.server = sinon.fakeServer.create();
      this.attrs = 
        {
          body: "this is my request",
          twitterOrEmail: "email@email.com",
          username: "bobby",
          location: "12345",
          when: '30 min',
        }
      var responseBody = _.extend({_id:1, slug: 'bobby'}, this.attrs)
      this.server.respondWith("POST", "/subjects-home", 
        [ 
          200, 
          {"Content-Type": "application/json"}, 
          JSON.stringify(responseBody)
        ]
      )
      this.eventSpy = sinon.spy();
    });
    
    afterEach(function() {
      this.server.restore();
    });

    it("should not save when a required attribute is emtpy", function() {
      _.extend(Backbone.Model.prototype, Backbone.Validation.mixin);
      var eventSpy = sinon.spy();
      this.model.bind("error", eventSpy);
      this.model.save(
        {
          body: "",
          twitterOrEmail: "",
          username: "",
          location: "",
          when: ""
        })
      expect(eventSpy).to.have.been.calledOnce;
      expect(eventSpy).to.have.been.calledWith(this.model, 
        {
          body: "required",
           twitterOrEmail: "required",
           username: "required",
           location: "required",
           when: 'required'
        });
    });
    it("should make a save request to the server", function() {
      this.model.save(this.attrs)

      expect(this.server.requests.length).to.equal(2)  
      expect(this.server.requests[1].url).to.equal("/subjects-home");
      expect(this.server.requests[1].method).to.equal("POST");
      var req = JSON.parse(this.server.requests[1].requestBody)
      var model = this.model.attributes
      expect(JSON.parse(this.server.requests[1].requestBody)).to.deep.equal(this.model.attributes);
    });

  });

/*
  describe("when saving", function() {
    
    beforeEach(function() {
      this.server = sinon.fakeServer.create();
      this.responseBody = '{"description":null,"done":false,"id":3,"position":null,"priority":3,"title":"Hello","tags":["garden","weekend"]}';
      this.server.respondWith(
        "POST",
        "/subjects-home",
        [
          200,
          {"Content-Type": "application/json"},
          this.responseBody
        ]
      );
      this.eventSpy = sinon.spy();
    });
    
    afterEach(function() {
      this.server.restore();
    });
    
    it("should not save when title is empty", function() {
      this.todo.bind("error", this.eventSpy);
      this.todo.save({"title": ""});
      
      expect(this.eventSpy).toHaveBeenCalledOnce();    
      expect(this.eventSpy).toHaveBeenCalledWith(this.todo, "cannot have an empty title");
    });
    
    it("should make a save request to the server", function() {
      this.todo.save();
      expect(this.server.requests[0].method).toEqual("POST");
      expect(this.server.requests[0].url).toEqual("/collection");
      expect(JSON.parse(this.server.requests[0].requestBody)).toEqual(this.todo.attributes);
    });
    
    it("should fire a change event and provide returned todo model", function() {
      this.todo.bind("change", this.eventSpy);
      this.todo.save();
      this.server.respond();
      expect(this.eventSpy).toHaveBeenCalledOnce();
      expect(this.eventSpy.getCall(0).args[0].constructor).toBe(Todo);
      expect(this.eventSpy.getCall(0).args[0].attributes).toEqual(JSON.parse(this.responseBody));
    });
 */   
  });
})
