
module.exports = {
  get : function(request, response){
    response.writeHead(200,{'Content-Type': 'text/plain'});
    response.write("hello login!~");
    response.end();
  },

};
