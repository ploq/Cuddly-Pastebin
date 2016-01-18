var pasteTextarea = "paste_code";


function getPastetext() {
    return $("#"+pasteTextarea).val();
}

function setPastetext(paste_text) {
    $("#"+pasteTextarea).val(paste_text);
}

function getPassword() {
    return $("#paste_passw").val();
}

var injected_input = '<input type="text" id="paste_passw" name="paste_passw" size="20" maxlength="60" value="" class="post_input">';

var injected_div = `<div class="form_left">
Password:
</div>`;

var pastebin_form = $(".form_frame_left");
pastebin_form.prepend("<div class='form_frame'>" + injected_div + "<div class='form_right'>" + injected_input + "</div></div>");


$("#myform").submit(function(event) {
    setPastetext("//+paste-encr " + sjcl.encrypt(getPassword(), getPastetext()));

    return true;
});


