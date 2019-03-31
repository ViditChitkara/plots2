jQuery(document).ready(function() {
/*
 * Based on the basic plugin from jQuery file upload: 
 * https://github.com/blueimp/jQuery-File-Upload/wiki/Basic-plugin
 *
 * .dropzone is for inline images for both wiki and research notes, in:
 *   /app/views/editor/_editor.html.erb
 *   /app/views/wiki/edit.html.erb
 * #side-dropzone, is for the main image of research notes, in /app/views/editor/post.html.erb
*/

    $('.dropzone').bind('dragover',function(e) {
      e.preventDefault();
      $('.dropzone').addClass('hover');
    });
    $('#side-dropzone').bind('dragover',function(e) {
      e.preventDefault();
      $('#side-dropzone').addClass('hover');
    });
    $('.dropzone').bind('dragout',function(e) {
      $('.dropzone').removeClass('hover');
    });
    $('#side-dropzone').bind('dragout',function(e) {
      $('#side-dropzone').removeClass('hover');
    });
    $('.dropzone').bind('drop',function(e) {
      e.preventDefault();
      $E.initialize({});
    });
    $('#side-dropzone').bind('drop',function(e) {
      e.preventDefault();
    });

    $('.dropzone').fileupload({
      url: "/images",
      paramName: "image[photo]",
      dropZone: $('.dropzone'),
      dataType: 'json',
      formData: {
        'uid':$D.uid,
        'nid':$D.nid
      },
      start: function(e) {

        ($D.selected).find('#create_progress').eq(0).show();
        ($D.selected).find('#create_uploading').eq(0).show();
        ($D.selected).find('#create_prompt').eq(0).hide();
        ($D.selected).find('.dropzone').eq(0).removeClass('hover');
      },
      done: function (e, data) {
          ($D.selected).find('#create_progress').hide();
          ($D.selected).find('#create_uploading').hide();
          ($D.selected).find('#create_prompt').show();
        var extension = data.result['filename'].split('.')[data.result['filename'].split('.').length - 1]
        var file_url = data.result.url.split('?')[0]

        var file_type
        if (['gif', 'GIF', 'jpeg', 'JPEG', 'jpg', 'JPG', 'png', 'PNG'].includes(extension))
          file_type = 'image'
        else if (['csv', 'CSV'].includes(extension))
          file_type = 'csv'

        switch (file_type) {
        case 'image':
          orig_image_url = file_url + '?s=o' // size = original
          $E.wrap('[![', '](' + file_url + ')](' + orig_image_url + ')', {'newline': true, 'fallback': data.result['filename']}) // on its own line; see /app/assets/js/editor.js
          break
        case 'csv':
          $E.wrap('[graph:' + file_url + ']', {'newline': true, 'fallback': data.result['filename']})
          break
        default:
          $E.wrap('<a href="'+data.result.url.split('?')[0]+'"><i class="fa fa-file"></i> ','</a>', {'newline': true, 'fallback': data.result['filename'].replace(/[()]/g , "-")}) // on its own line; see /app/assets/js/editor.js
        }

        // here append the image id to the wiki edit form:
        if ($('#node_images').val() && $('#node_images').val().split(',').length > 1) $('#node_images').val([$('#node_images').val(),data.result.id].join(','))
        else $('#node_images').val(data.result.id)

        // eventual handling of multiple files; must add "multiple" to file input and handle on server side:
        //$.each(data.result.files, function (index, file) {
        //    $('<p/>').text(file.name).appendTo(document.body);
        //});
      },

      // see callbacks at https://github.com/blueimp/jQuery-File-Upload/wiki/Options
      fileuploadfail: function(e,data) {

      },
      progressall: function (e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $('#create_progress-bar').css(
          'width',
          progress + '%'
        );
      }
    });

    $('#side-dropzone').fileupload({
      url: "/images",
      paramName: "image[photo]",
      dropZone: $('#side-dropzone'),
      dataType: 'json',
      formData: {
        'uid':$D.uid,
        'nid':$D.nid
      },
      start: function(e) {
        ($D.selected).find('.side-dropzone').eq(0).css('border-color','#ccc');
        ($D.selected).find('.side-dropzone').eq(0).css('background','none');
        ($D.selected).find('#side-progress').eq(0).show();
        ($D.selected).find('#side-dropzone').eq(0).removeClass('hover');
        ($D.selected).find('.side-uploading').eq(0).show();
      },
      done: function (e, data) {
          ($D.selected).find('#side-progress').eq(0).hide()
          ($D.selected).find('#side-dropzone').eq(0).show()
          ($D.selected).find('.side-uploading').eq(0).hide()
          ($D.selected).find('#leadImage')[0].src = data.result.url
          ($D.selected).find('#leadImage').eq(0).show()
        // here append the image id to the note as the lead image
          ($D.selected).find('#main_image').eq(0).val(data.result.id)
          ($D.selected).find("#image_revision").append(
          '<option selected="selected" id="'+data.result.id+'" value="'+data.result.url+'">Temp Image '+data.result.id+'</option>');
      },

      // see callbacks at https://github.com/blueimp/jQuery-File-Upload/wiki/Options
      fileuploadfail: function(e,data) {
      },
      progressall: function (e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10);
        ($D.selected).find('#side-progress .progress-bar').eq(0).css(
          'width',
          progress + '%'
        );
      }
    });
});
