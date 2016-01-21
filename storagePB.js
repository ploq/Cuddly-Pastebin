function getPastePw(paste_id, master_pw, callback) {
    chrome.storage.local.get(paste_id, function (items) {
        try {
            var dec_data = sjcl.decrypt(master_pw, items[paste_id]);
        } catch (err) {
            alertify.error("Wrong master password!");
            return;
        }
        callback(dec_data);
    });
}

function savePastePw(paste_id, paste_pw, master_pw) {
    var stor_line = {};
    stor_line[paste_id] = sjcl.encrypt(master_pw, paste_pw);
    chrome.storage.local.set(stor_line);
}

function pastePwExists(paste_id, callback) {
    chrome.storage.local.get(paste_id, function (items) {
       callback(typeof items[paste_id] !== 'undefined')
    });
}