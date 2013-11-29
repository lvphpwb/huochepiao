var station_obj = (function(){
    var old_kw = "";
    var search_timer = null;
    var addr_type = "begin";
    var final_data = [];
    var stations = null;
    var is_select_begin=false;
    var is_select_end=false;
    var select_begin_addr=null;
    var select_end_addr=null;
    function init(beginid,endid){
        var b_e = $("#"+beginid); 
        var e_e = $("#"+endid);
        var b_list = $('<div class="addr-list" id="list-begin-outer"><div class="tip">没有找到匹配的结果</div><ul id="list-begin"></ul></div>');
        var e_list = $('<div class="addr-list" id="list-end-outer"><div class="tip">没有找到匹配的结果</div><ul id="list-end"></ul></div>');
        b_e.after(b_list);
        e_e.after(e_list);
        var b_p = b_e.position();
        var e_p = e_e.position();

        $("#list-begin-outer").css("top",b_p.top+b_e.height()+17);
        $("#list-begin-outer").css("left",b_p.left);
        $("#list-end-outer").css("top",e_p.top+e_e.height()+17);
        $("#list-end-outer").css("left",e_p.left);

        stations = $.map(
                station_names.split("@"),
                function(n) {
                     if (!n) return null;
                     var t = n.split("|");
                     return {
                          firstLetter: t[0],
                          name: t[1],
                          code: t[2],
                          py: t[3],
                          shortName: t[4],
                          order: parseInt(t[5]) || 0
                     }
                }
        );

    }
     function process(item,sn,type){
           if(type=="shortName"){
                if(item.shortName.indexOf(sn)!=-1){
                     final_data.push(item);
                }
           }else{
                if(item.name.indexOf(sn)!=-1){
                     final_data.push(item);
                }
           }
           
           if(final_data.length>20)return true;
      }
      function showList(){
           var len = final_data.length;
           if(len<=0){
                $("#list-"+addr_type).siblings(".tip").show().parent(".addr-list").show();
                return;
           }
           $("#list-"+addr_type).siblings(".tip").hide().parent(".addr-list").show();
           for(var i=0;i<len;i++){
                $("#list-"+addr_type).append("<li code='"+final_data[i].code+"'>"+final_data[i].name+"</li>");
           }
           //$("#list-"+addr_type).parent(".addr-list").show();
      }
      function getDataByShortName(sn,type){
           var i = stations.length % 8;
           var tails = i;
           for(var j=0;j<i;j++){
                process(stations[j],sn,type);
           }
          
           var greatest_factor = stations.length-1;
           var low = tails;
          //var greatest_factor = 0;
           var over = false;
          do{
               over = process(stations[low],sn,type);
               over = process(stations[low+1],sn,type);
               over = process(stations[low+2],sn,type);
               over = process(stations[low+3],sn,type);
               over = process(stations[low+4],sn,type);
               over = process(stations[low+5],sn,type);
               over = process(stations[low+6],sn,type);
               over = process(stations[low+7],sn,type);
              low+=8;
              if(over)break;
           }while(low<greatest_factor);
           showList();

      }
      function input_addr(that){
           var addr = $.trim($(that).text());
           var code = $.trim($(that).attr("code"));
           if(addr_type=="begin"){
                $("#begin-addr").val(addr).attr("code",code);
                is_select_begin = true;
                select_begin_addr = addr;
           }else{
                $("#end-addr").val(addr).attr("code",code);
                is_select_end = true;
                select_end_addr = addr;
           }
           hide_list(addr_type);
      }
      function show_hot(){
           $("#hot-list").show();
      }
      function hide_hot(){
           $("#hot-list").hide();
      }
      function show_list(type){
           $("#list-"+type).empty().parent().show();
      }
      function hide_list(type){
           $("#list-"+type).empty().parent().hide();
      }
     
      function change_status(type,value){
           if(type=="begin"){
                if(value==select_begin_addr){
                     return;
                }else{
                     is_select_begin = false;
                     select_begin_addr = null;
                }
           }else if(type=="end"){
                if(value==select_end_addr){
                     return;
                }else{
                     is_end_begin = false;
                     select_end_addr = null;
                }
           }
      }
    $(document).on("blur","#begin-addr",function(){
               // $("#hot-list").hide();
                if(!is_select_begin){
                     $(this).val("");
                }
      })
      $(document).on("blur","#end-addr",function(){
           // $("#hot-list").hide();
            if(!is_select_end){
                 $(this).val("");
            }
      })
      $(document).on("focus","#begin-addr",function(){
            addr_type = "begin";
            /*if($.trim($(this).val())){
                 return;
            }*/
            var p = $(this).position();
            $("#hot-list").css({"top":(p.top+37)+"px","left":p.left+"px"}).show();
       })
       $(document).on("focus","#end-addr",function(){
            addr_type = "end";
            /*if($.trim($(this).val())){
                 return;
            }*/
            var p = $(this).position();
            $("#hot-list").css({"top":(p.top+37)+"px","left":p.left+"px"}).show();
       })
       $(document).on("keyup","#begin-addr,#end-addr",function(event){
            var e = event||window.event;
            var code =e.keyCode||e.which;
            
            clearTimeout(search_timer);
            var new_kw = $.trim($(this).val());
            if(code==32){
                 //输入空格
                 $(this).val(new_kw);
                 return;
            }else if(code>=12&&code<=47){
                 //方向键下,上
                 return;
            }

            /*var txt=new RegExp("[a-z,A-Z,1-9]");
            var character = String.fromCharCode(code);
            if(!txt.test(character)){
                 return;
            }*/
            change_status(addr_type,new_kw);
            if(new_kw==""){
                 show_hot();
                 hide_list(addr_type);
                 return;
            }else{
                 hide_hot();
                 show_list(addr_type);
                 final_data = [];
                 if(/[a-zA-Z]{1,}/.test(new_kw)){
                      //字符
                      //search_timer = setTimeout(function(){getDataByShortName(new_kw);},600);
                      search_timer = setTimeout(function(){getDataByShortName(new_kw,"shortName");},200);
                 }else{
                      search_timer = setTimeout(function(){getDataByShortName(new_kw,"name");},200);
                 }
            }
       })

       $(document).on("click",".addr-list li",function(){
            input_addr(this);
       })
       $(document).on("click","#hot-list li",function(){
            input_addr(this);
            hide_hot();
       })
       $(document).on("click","#hot-close",function(){
            hide_hot();
       })
       $(document).on("click",function(event){
            var e = event||window.event;
            var target = $(e.target);
            var id = target.attr("id");
            if(id=="hot-list"||id=="begin-addr"||id=="end-addr"||target.parents("#hot-list").length>0||target.hasClass("addr-list")||target.parents(".addr-list").length>0){
                 if(id=="begin-addr"){
                      hide_list("end");
                 }else if(id="end-addr"){
                      hide_list("begin");
                 }
                 return;
            }
            hide_hot();
            hide_list(addr_type);
       })
    return {init:init};
})();