define(function(require) {

var tpl = require('text!templates/contact.html')
  , Contact = require('models/contact-page') 
  , AlertView = require('views/site/alert').alert         

return Backbone.View.extend({

  className: 'contact',

  events: {
    'submit form' : 'submit',
  },

  initialize: function(options){
    _.bindAll(this); 
    this.model = new Contact()
    Backbone.Validation.bind(this)
    this.model.on('sync', this.notice, this) 
    this.model.on('sync', this.render, this) 
  },

  render: function(){
    $(this.el).html(tpl);
    return this; 
  },

  submit: function(e) {
    e.preventDefault()
    var params = this.$('form').serializeObject();
    this.model.save(params);
  },

  notice: function(){
    new AlertView({
      message: '<strong>Thank you for the message.</strong>',
      type: 'info'
    })
    //successAlert.fadeOut()
  },

});


});
