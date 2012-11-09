define(function(require) {

var AlertView = require('views/site/alert').alert
  , tpl = require('text!templates/subjects/create_subject.mustache') 
  , Subject = require('models/subject')

  return Backbone.View.extend({

    template: Hogan.compile(tpl),
   
    className: 'modal modal-subject',

    events: {
      'submit form' : 'submit'
    },

    button: '',

    initialize: function() {
      _.bindAll(this);
    },

    render: function () {
      var template = this.template.render();
      $(this.el).html(template);
      $(this.el).modal('show');
      this.button = $('button[type="submit"]', this.el);
    },

    submit: function (e) {
      e.preventDefault()
      var tArea = $('#textarea-modal')
      if (tArea.val() == '') 
        return
      var params = this.$('form').serializeObject();
      var self = this
      $.post('/subjects', params, function(data){
        $('.modal-backdrop').remove();
        $('.modal').remove();
        new AlertView('Created')
        window.events.trigger("subjectCreated-create_subject.js");
      }) 
    },

  });

});
