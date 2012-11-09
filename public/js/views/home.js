define(function(require) {

var tpl = require('text!templates/home.html')
  , LandingPage = require('models/landingPage')
  , AlertView = require('views/site/alert').alert         
  , ThankyouView = require('views/homepage_thankyou')      

return Backbone.View.extend({

  initialize: function(options){
    _.bindAll(this); 
    this.model = new LandingPage();
    Backbone.Validation.bind(this);
    this.model.on('sync', this.notice, this) 
    this.model.on('sync', this.render, this) 
  },

  events: {
    'submit form' : 'submit',
  },

  template: tpl,

  render: function(){
    $(this.el).html(this.template);
    return this; 
  },

  submit: function(e) {
    e.preventDefault()
    var params = this.$('form').serializeObject();
    var result = this.model.save(params)
  },

  notice: function(model){
    new ThankyouView()
  }

});

});
