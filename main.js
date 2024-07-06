$(document).ready(function(){
    // Chuyển đổi giao diện sáng tối
    function toggleTheme() {
        if ($('body').attr('data-theme') === 'light') {
            $('body').attr('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            $('body').attr('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    }

    // Lưu giao diện người dùng đã chọn
    function loadTheme() {
        const theme = localStorage.getItem('theme');
        if (theme) {
            $('body').attr('data-theme', theme);
        }
    }

    function updatePreview() {
        var username = $('#username').val();
        var avatar = $('#avatar').val();
        var content = $('#content').val();
        var embedTitle = $('#embedTitle').val();
        var embedDescription = $('#embedDescription').val();
        var embedColor = $('#embedColor').val();
        var embedImage = $('#embedImage').val();
        var embedFooter = $('#embedFooter').val();

        $('#preview-username').text(username);
        if (avatar) {
            $('#preview-avatar').html('<img src="' + avatar + '">');
        } else {
            $('#preview-avatar').html('');
        }
        $('#preview-content').text(content);

        if ($('#messageType').val() === 'embed') {
            $('#preview-embed').show();
            $('#preview-embed-title').text(embedTitle);
            $('#preview-embed-description').text(embedDescription);
            $('#preview-embed-footer').text(embedFooter);
            $('#preview-embed').css('border-left', '5px solid ' + embedColor);
            if (embedImage) {
                $('#preview-embed-image').html('<img src="' + embedImage + '">');
            } else {
                $('#preview-embed-image').html('');
            }

            if ($('#includeContent').is(':checked')) {
                $('#preview-content').show();
            } else {
                $('#preview-content').hide();
            }
        } else {
            $('#preview-embed').hide();
        }
    }

    $('#messageType').change(function() {
        if ($(this).val() === 'embed') {
            $('.embed-options').show();
            $('#includeContent').prop('checked', false);
            $('.content-group').hide();
        } else {
            $('.embed-options').hide();
            $('.content-group').show();
        }
        updatePreview();
    });

    $('#includeContent').change(function() {
        if ($(this).is(':checked')) {
            $('.content-group').show();
        } else {
            $('.content-group').hide();
        }
        updatePreview();
    });

    $('#colorPicker').change(function() {
        $('#embedColor').val($(this).val());
        updatePreview();
    });

    $('#colorPickerButton').click(function() {
        $('#colorPicker').click();
    });

    $('#link, #username, #avatar, #content, #embedTitle, #embedDescription, #embedFooter, #embedColor, #embedImage').on('input', function() {
        updatePreview();
    });

    function formatDate(date) {
        const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        const dayName = days[date.getDay()];
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${dayName} - ${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
    }

    function sendMessage(withTimestamp) {
        var link = $('#link').val();
        var username = $('#username').val();
        var avatar = $('#avatar').val();
        var messageType = $('#messageType').val();
        var content = $('#content').val();
        var embedTitle = $('#embedTitle').val();
        var embedDescription = $('#embedDescription').val();
        var embedColor = $('#embedColor').val();
        var embedImage = $('#embedImage').val();
        var embedFooter = $('#embedFooter').val();

        if (!link || (!content && messageType === 'plaintext')) {
            alert("Vui lòng điền đầy đủ các trường");
            return false;
        }

        var payload = {
            "username": username,
            "avatar_url": avatar
        };

        if (messageType === 'plaintext') {
            payload.content = content;
        }

        if (messageType === 'embed') {
            var embed = {
                "title": embedTitle,
                "description": embedDescription,
                "color": parseInt(embedColor.replace('#', ''), 16),
                "footer": {
                    "text": embedFooter
                }
            };

            if (embedImage) {
                embed.image = { "url": embedImage };
            }

            if (withTimestamp) {
                embed.footer.text += ' | ' + formatDate(new Date());
            }

            if ($('#includeContent').is(':checked')) {
                payload.content = content;
            }

            payload.embeds = [embed];
        }

        $.post({
            url: link,
            data: JSON.stringify(payload),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(data) {
                $('#log').text('Tin nhắn đã được gửi thành công!');
            },
            error: function() {
                $('#log').text('Lỗi khi gửi tin nhắn.');
            }
        });

        return false;
    }

    function saveConfig() {
        var config = {
            link: $('#link').val(),
            username: $('#username').val(),
            avatar: $('#avatar').val(),
            messageType: $('#messageType').val(),
            content: $('#content').val(),
            embedTitle: $('#embedTitle').val(),
            embedDescription: $('#embedDescription').val(),
            embedColor: $('#embedColor').val(),
            embedImage: $('#embedImage').val(),
            embedFooter: $('#embedFooter').val(),
            includeContent: $('#includeContent').is(':checked')
        };
        var configStr = JSON.stringify(config);
        var blob = new Blob([configStr], {type: "application/json"});
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = "config.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function loadConfig() {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = function(event) {
            var file = event.target.files[0];
            if (file) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    var config = JSON.parse(e.target.result);
                    $('#link').val(config.link);
                    $('#username').val(config.username);
                    $('#avatar').val(config.avatar);
                    $('#messageType').val(config.messageType).change();
                    $('#content').val(config.content);
                    $('#embedTitle').val(config.embedTitle);
                    $('#embedDescription').val(config.embedDescription);
                    $('#embedColor').val(config.embedColor);
                    $('#embedImage').val(config.embedImage);
                    $('#embedFooter').val(config.embedFooter);
                    $('#includeContent').prop('checked', config.includeContent).change();
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    function clearFields() {
        $('#link').val('');
        $('#username').val('');
        $('#avatar').val('');
        $('#messageType').val('plaintext').change();
        $('#content').val('');
        $('#embedTitle').val('');
        $('#embedDescription').val('');
        $('#embedColor').val('');
        $('#embedImage').val('');
        $('#embedFooter').val('');
        $('#includeContent').prop('checked', false).change();
    }

    function loadMessage() {
        var messageLink = $('#messageLink').val();
        var parts = messageLink.split('/');
        var guildId = parts[4]; // Extract the guild ID from the link
        var channelId = parts[5]; // Extract the channel ID from the link
        var messageId = parts[6]; // Extract the message ID from the link

        if (!guildId || !channelId || !messageId) {
            alert("Vui lòng nhập đúng định dạng link tin nhắn.");
            return;
        }

        // Sử dụng API Discord để lấy tin nhắn (cần token của bot Discord)
        $.ajax({
            url: `https://discord.com/api/v9/channels/${channelId}/messages/${messageId}`,
            method: 'GET',
            headers: {
                "Authorization": `Bot YOUR_BOT_TOKEN` // Sử dụng token của bot
            },
            success: function(data) {
                console.log('Message data:', data); // Log dữ liệu tin nhắn

                $('#username').val(data.author.username);
                $('#avatar').val(data.author.avatar ? `https://cdn.discordapp.com/avatars/${data.author.id}/${data.author.avatar}.png` : '');
                $('#content').val(data.content);

                if (data.embeds && data.embeds.length > 0) {
                    $('#messageType').val('embed').change();
                    var embed = data.embeds[0];
                    $('#embedTitle').val(embed.title || '');
                    $('#embedDescription').val(embed.description || '');
                    $('#embedColor').val(embed.color ? `#${embed.color.toString(16).padStart(6, '0')}` : '');
                    $('#embedImage').val(embed.image ? embed.image.url : '');
                    $('#embedFooter').val(embed.footer ? embed.footer.text : '');
                } else {
                    $('#messageType').val('plaintext').change();
                }

                // Gọi hàm updatePreview sau khi tất cả các trường đã được cập nhật
                updatePreview();
            },
            error: function() {
                alert("Không thể tải tin nhắn. Vui lòng kiểm tra lại link và thử lại.");
            }
        });
    }

    $('#btn').click(function(){
        sendMessage(false);
    });

    $('#btnWithTimestamp').click(function(){
        sendMessage(true);
    });

    $('#saveConfig').click(function(){
        saveConfig();
    });

    $('#loadConfig').click(function(){
        loadConfig();
    });

    $('#clearFields').click(function(){
        clearFields();
    });

    $('#toggleTheme').change(function(){
        toggleTheme();
    });

    $('#loadMessage').click(function(){
        loadMessage();
    });

    loadTheme();
    updatePreview();
});