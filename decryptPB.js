var paste_enc_pref = "//+paste-encr";

var new_line_start = "<li class='li1'><div class='de1'>";
var new_line_end = "</div></li>";
var text_patt = new RegExp("/archive/text");

function createPasteText(text, html) {
    if (text_patt.exec(html) == null) {
        return new_line_start + hljs.highlightAuto(text).value + new_line_end;
    } else {
        return new_line_start + text + new_line_end;
    }

}

function decryptData(paste_text, password) {
    var enc_data = paste_text.substr(paste_enc_pref.length + 1);
    try {
        var dec_data = sjcl.decrypt(password, enc_data, {}, {});
    } catch(e) {
        alertify.error("Wrong password!");
        return;
    }

    return dec_data;
}

function decryptPaste(paste_text, paste_id, callback) {
    if (paste_text.slice(0, paste_enc_pref.length) == paste_enc_pref) {
        pastePwExists(paste_id, function(exists){
           if (exists) {
               alertify.prompt("Paste ID found in DB, input your master password!", function(master_pw, ev){
                  getPastePw(paste_id, master_pw, function(password) {
                      var dec_data = decryptData(paste_text, password);
                      callback(dec_data);
                  })
               });
           } else {
               alertify.prompt("This paste is encrypted.\nPlease input a password!", function (password, ev) {
                   try {
                       var dec_data = decryptData(paste_text, password);
                       alertify.prompt("Save this password with your master password", function (master_pw, ev) {
                           savePastePw(paste_id, password, master_pw);
                       });
                   } catch (e) {
                       alertify.error("Wrong password!");
                   }
                   callback(dec_data);
               });
           }
        });
    }
}


function decryptIndex(paste_text, paste_id) {
    //Non-raw pastebin
    var html = $("html").html();
    if (paste_text.slice(0, paste_enc_pref.length) == paste_enc_pref) {
        var paste_ol = $("ol");
        var raw_paste = $("#paste_code");

        paste_ol.empty().append(createPasteText("Encrypted!", html));
        raw_paste.empty().val("Encrypted!");

        decryptPaste(paste_text, paste_id, function(dec_data) {
            raw_paste.empty().val(dec_data);

            var lines = dec_data.split('\n');
            paste_ol.empty();
            for (var i = 0; i < lines.length; i++) {
                paste_ol.append(createPasteText(lines[i], html));
            }
        });
    }
}

function decryptRaw(paste_text, paste_id) {
    //Decrypts /raw
    if (paste_text.slice(0, paste_enc_pref.length) == paste_enc_pref) {
        var html_selector = $("body pre");
        html_selector.html("Encrypted!");
        decryptPaste(paste_text, paste_id, function(dec_data) {
            html_selector.html(dec_data);
        });
    }
}

function decryptClone(paste_text, paste_id) {
    if (paste_text.slice(0, paste_enc_pref.length) == paste_enc_pref) {
        var html_selector = $("#paste_code");
        html_selector.val("Encrypted!");

        decryptPaste(paste_text, paste_id, function(dec_data) {
           html_selector.val(dec_data);
        });
    }
}

var paste_id = window.location.pathname.split("/");

if(window.location.pathname.slice(0,5) === "/raw/") {
    decryptRaw($("body pre").text(), paste_id[2]);
} else if (window.location.pathname.slice(0,"/index/".length) === "/index/") {
    decryptClone($("#paste_code").val(), paste_id[2]);
} else {
    var paste_text = $("#selectable").text().slice(4).trim();
    decryptIndex(paste_text, paste_id[1]);
}