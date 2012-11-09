define(function(require) {

var tpl = require('text!templates/subjects_nav.mustache')
var itemTpl = require('text!templates/subject_nav_item.mustache')

var ItemView = Backbone.View.extend({

  tagName:  "li",

  template: Hogan.compile(itemTpl),

  initialize: function(subject){
    this.subject = subject
    _.bindAll(this) 
  },

  events: {
    "click a": "active",
    "click a:not([href^='#'])": "pushState",
    "click a": "reset_unread" 
  },

  active: function(e){
    //var anchor = $(e.currentTarget)
    var el = $(this.el)
    if (el.hasClass('active')) return
    $('#subjects-nav li').removeClass('active');
    el.addClass('active');
  },

  reset_unread: function(e){
    this.subject.unread = 0
    this.render()
  },

  pushState: function(e) {
    e.preventDefault() 
    var linkEl = $(e.currentTarget)
    var href = linkEl.attr("href")
    var router = new Backbone.Router()
    router.navigate(href.substr(1), true)
  },

  render: function() {
    var subject = this.subject
    var _id = subject._id
    var body = subject.body
    if (subject.body.length > 50) {
      subject.body = subject.body.substr(0, 50) + '...' 
    }

    subject.if_total = (subject.total > 0) ? true : false 
    subject.if_unread = (subject.unread > 0) ? true : false 

    var template = this.template.render(subject)
    $(this.el).html(template);
    return this;
  },
})


var ListView = Backbone.View.extend({
 
  tagName: 'ul',
  className: 'nav nav-pills nav-stacked',

  template: Hogan.compile(tpl),

  initialize: function() {
    _.bindAll(this)
  },

  addOne: function(subject) {
    var view = new ItemView(subject);
    $(this.el).append(view.render().el)
  },

  render: function(subjects) {
    _.each(subjects, this.addOne, this);
    //var el_html = $(this.el).clone().wrap('<p>').parent().html();
    var template = $(this.template.render())
    var h = $(this.el).html()
    if (h != '')
      $('#nav', template).html(this.el)
    return template 
  },

})

return ListView

})
