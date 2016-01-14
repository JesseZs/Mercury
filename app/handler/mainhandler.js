
module.exports = {
  get : function(request, response){
    response.render('index', {'data': "hello nodejs!~"});
  },

  post : function(request, response){
      console.log(request.files);
      response.end();
  },

};
