var paste_enc_pref = "//+paste-encr";

var new_line_start = "<li class='li1'><div class='de1'>";
var new_line_end = "</div></li>";
var text_patt = new RegExp("/archive/text");
var password_input = "Encrypted! Input password: <input type='password' id='paste_pass'>"


function htmlEscape(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}


function createPasteText(text, html) {
    if (text_patt.exec(html) == null) {
        return new_line_start + hljs.highlightAuto(text).value + new_line_end;
    } else {
        return new_line_start + htmlEscape(text) + new_line_end;
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

function decryptPaste(paste_text, callback) {
    if (paste_text.slice(0, paste_enc_pref.length) == paste_enc_pref) {
           try {
               var dec_data = decryptData(paste_text, $("#paste_pass").val());
           } catch (e) {
               alertify.error("Wrong password!");
           }
           callback(dec_data);
    }
}


function decryptIndex(paste_text) {
    //Non-raw pastebin
    var html = $("html").html();
    if (paste_text.slice(0, paste_enc_pref.length) == paste_enc_pref) {
        var paste_ol = $("ol");
        var raw_paste = $("#paste_code");

        paste_ol.empty().append(password_input);
        raw_paste.empty().val("Encrypted!");
        $("#paste_pass").keyup(function(e){
            if(e.keyCode == 13) {
                decryptPaste(paste_text, function(dec_data) {
                    raw_paste.empty().val(dec_data);

                    var lines = dec_data.split('\n');
                    paste_ol.empty();
                    for (var i = 0; i < lines.length; i++) {
                        paste_ol.append(createPasteText(lines[i], html));
                    }
                });
            }
        });
    }
}

function decryptRaw(paste_text) {
    //Decrypts /raw
    if (paste_text.slice(0, paste_enc_pref.length) == paste_enc_pref) {
        var html_selector = $("body pre");
        html_selector.html(password_input);
        $("#paste_pass").keyup(function(e) {
            if (e.keyCode == 13) {
                decryptPaste(paste_text, function (dec_data) {
                    html_selector.html(dec_data);
                });
            }
        });
    }
}

function decryptClone(paste_text) {
    if (paste_text.slice(0, paste_enc_pref.length) == paste_enc_pref) {
        var html_selector = $("#paste_code");
        html_selector.val(password_input);
        $("#paste_pass").keyup(function(e) {
            if (e.keyCode == 13) {
                decryptPaste(paste_text, function (dec_data) {
                    html_selector.val(dec_data);
                });
            }
        });
    }
}


if(window.location.pathname.slice(0,5) === "/raw/") {
    decryptRaw($("body pre").text());
} else if (window.location.pathname.slice(0,"/index/".length) === "/index/") {
    decryptClone($("#paste_code").val());
} else {
    var paste_text = $("#selectable").text().slice(4).trim();
    decryptIndex(paste_text);
}