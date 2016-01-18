var paste_enc_pref = "//+paste-encr";

var new_line_start = "<li class='li1'><div class='de1'>";
var new_line_end = "</div></li>";


function addNewlines(text) {
    //Thanks :) Credit: http://stackoverflow.com/a/6455874/849787
    var htmls = [];
    var lines = text.split(/\n/);

    var tmpDiv = jQuery(document.createElement('div'));
    for (var i = 0 ; i < lines.length ; i++) {
        htmls.push(tmpDiv.text(lines[i]).html());
    }
    return htmls.join("<br>");
}
function createPasteText(text) {
    return new_line_start + text + new_line_end;

}
var paste = addNewlines($("#selectable").text()).slice(4).trim();

if(paste.slice(0, paste_enc_pref.length) == paste_enc_pref) {
    var password = prompt("This paste is encrypted.\nPlease input a password!");

    var enc_data = paste.substr(paste_enc_pref.length+1).replace(/\<br\>/g," ");
    var dec_data = sjcl.decrypt(password, enc_data);

    var lines = dec_data.split('\n');
    $("ol.text").empty();
    for(var i = 0; i < lines.length ;i++){
        $("ol.text").append(createPasteText(lines[i]));
    }

}