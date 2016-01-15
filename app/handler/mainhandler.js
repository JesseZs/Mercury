
module.exports = {
  get : function(request, response){
    response.render('main', {'data': "hello nodejs!~"});
  },

  post : function(request, response){
      console.log(request.files);
      response.end();
  },

};
