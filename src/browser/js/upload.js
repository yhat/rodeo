$("#file-upload-trigger").change(function () {
  var input = document.getElementById('file-upload-trigger');
  var file = input.files[0];
  var fr = new FileReader();
  fr.onload = (function(theFile) {
    return function(e) {
      var filename = theFile.name.replace("C:\\fakepath\\", '');
      newEditor(filename, filename, e.target.result);
    };
  })(file);
  fr.readAsText(file);
});
