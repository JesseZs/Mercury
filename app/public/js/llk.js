
var state = 0;

var item_map;
var path_map;

var wc = 10;
var hc = 8;

var picCount = 10;

var items;

var src_item;

var picSrc = [
    "/images/llk/icon_1.png",
    "/images/llk/icon_2.png",
    "/images/llk/icon_3.png",
    "/images/llk/icon_4.png",
    "/images/llk/icon_5.png",
    "/images/llk/icon_6.png",
    "/images/llk/icon_1.png",
    "/images/llk/icon_2.png",
    "/images/llk/icon_3.png",
    "/images/llk/icon_4.png",
    "/images/llk/icon_5.png",
    "/images/llk/icon_6.png",
];
window.onload = init;

function init(){
    items = new Array();
    item_map = new Array();
    path_map = new Array();
}

function start(){
    if(state != 0) return;
    state = 1;


    var nc = (wc-2)*(hc-2);
    var h_nc = nc/2;

    for(var i=0; i<nc; ++i)
    {
        if(i<h_nc)
        {
            items[i] = parseInt(Math.random()*picCount);
        }
        else
        {
            items[i] = items[i-h_nc];
        }
    }

    for(var i=0; i<nc; ++i)
    {
        var r = parseInt(Math.random()*(nc-i))+i;
        if(r != i)
        {
            var temp = items[i];
            items[i] = items[r];
            items[r] = temp;
        }
    }
    console.log(items);

    var _i=0;
    for(var i=0;i<hc;++i)
    {
        for(var j=0;j<wc;++j)
        {
            if(i==0 || i==hc-1 || j==0 || j==wc-1)
            {
                item_map.push({"index":-1,"state":0});
            }
            else
            {
                item_map.push({"index":_i,"state":1});
                ++_i;
            }
        }
    }

    var html_str = "<table>"
    for(var i=0;i<hc-2;++i)
    {
        html_str += "<tr>"
        for(var j=0;j<wc-2;++j)
        {
            var _index = (i+1)*wc+j+1;
            var _picSrc = "";
            if( item_map[_index]["state"] == 1)
            {
                _picSrc = picSrc[items[item_map[_index]["index"]]];
            }
            html_str += "<td><button id='"+_index+"' onclick='click_signal(this)'><img class='cell' src='"+_picSrc+"'/></button></td>"
        }
        html_str += "</tr>"
    }
    html_str += "</table>";
    $("#planet").html(html_str);

}

function click_signal(item){
    console.log(item.id);
    if(!src_item) src_item = item;
    else
    {
        if(src_item != item && match(src_item,item))
        {
            //$(src_item).hide();
            //$(item).hide();
            hide_item(src_item);
            hide_item(item);
            src_item = null;
            console.log(path_map);
            path_map.splice(0,path_map.length);
        }
        else
        {
            src_item = item;
        }
    }
}
function match(src,dst){
    if(items[item_map[src.id]["index"]] != items[item_map[dst.id]["index"]]) return false;

    var pax = Number(src.id)%wc;
    var pay = Math.floor(Number(src.id)/wc);
    var pbx = Number(dst.id)%wc;
    var pby = Math.floor(Number(dst.id)/wc);
    //return connected_recursive(pax,pay,pbx,pby,0,0);
    return path_bfs(pax,pay,pbx,pby);
}

function path_bfs(pax,pay,pbx,pby){

    var queue = new Array();

    var _path = new Array();
    _path.push(pay*wc+pax);
    queue.push({x:pax,y:pay,dir:0,inf:0,path:_path});
    var _i=0;
    while(queue.length > 0)
    {
        var node = queue.shift();
        if(node.inf > 2) break;
        console.log("========"+String(_i)+"======"+String(node.x)+":"+String(node.y)+"========");
        if(node.x == pbx && node.y == pby)
        {
            console.log(String(node.path));
            return true;
        }

        if(node.dir != 2 && node.x-1>=0 && (item_map[node.y*wc+node.x-1]["state"]==0 || (node.x-1==pbx&&node.y==pby)))
        {
            var _inf = node.inf;
            if(node.dir == 3 || node.dir == 4) _inf += 1;
            var _path = node.path + [node.y*wc+node.x-1];
            queue.push({x:node.x-1,y:node.y,dir:1,inf:_inf,path:_path});
        }

        if(node.dir != 1 && node.x+1<wc && (item_map[node.y*wc+node.x+1]["state"]==0 || (node.x+1==pbx&&node.y==pby)))
        {
            var _inf = node.inf;
            if(node.dir == 3 || node.dir == 4) _inf += 1;
            var _path = node.path + [node.y*wc+node.x+1];
            queue.push({x:node.x+1,y:node.y,dir:2,inf:_inf,path:_path});
        }

        if(node.dir != 4 && node.y-1>=0 && (item_map[(node.y-1)*wc+node.x]["state"]==0 || (node.x==pbx&&node.y-1==pby)))
        {
            var _inf = node.inf;
            if(node.dir == 1 || node.dir == 2) _inf += 1;
            var _path = node.path + [(node.y-1)*wc+node.x];
            queue.push({x:node.x,y:node.y-1,dir:3,inf:_inf,path:_path});
        }

        if(node.dir != 3 && node.y+1<hc && (item_map[(node.y+1)*wc+node.x]["state"]==0 || (node.x==pbx&&node.y+1==pby)))
        {
            var _inf = node.inf;
            if(node.dir == 1 || node.dir == 2) _inf += 1;
            var _path = node.path + [(node.y+1)*wc+node.x];
            queue.push({x:node.x,y:node.y+1,dir:4,inf:_inf,path:_path});
        }
        ++_i;
    }
    return false;
}
function hide_item(item){
    $(item).hide();
    item_map[item.id]["state"] = 1;
}
