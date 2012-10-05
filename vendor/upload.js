var HasFileReader = typeof window.FileReader !== "undefined";
var HasDragAndDrop = 'draggable' in document.createElement('span');

function Uploader (input, loadingCallback, saveCallback) {
  if (! $(input)[0]) return;
  if (! saveCallback) {
    saveCallback = loadingCallback;
    loadingCallback = null;
  }

  function init (){
    var el = $(input)[0];
    if (HasDragAndDrop && input == "html") {
      el.addEventListener('dragenter', dragenter, false);
      el.addEventListener('dragover', dragover, false);
      el.addEventListener('drop', handleFileSelect, false);
    } else {
      el.addEventListener('change', handleFileSelect, false);
    }
  }

  function dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
    console.log('enter');
  }
  function dragover(e) {
    e.stopPropagation();
    e.preventDefault();
    console.log('over');
  }
  function handleFileSelect (e) {
    e.stopPropagation();
    e.preventDefault();
    var files = e.dataTransfer ? e.dataTransfer.files : e.target.files;

    for (var i = 0, f; f = files[i]; i++) {
      if (!f.type.match('image.*'))
        continue;
      
      if (loadingCallback) {
        loadingCallback();
      }

      if (HasFileReader) {
        var reader = new FileReader();
        reader.onload = function(e) {
          saveCallback(e.target.result);
        };
        reader.readAsDataURL(f);
      } else {
        Proxy.echo(f, function(dataURI){
          saveCallback(dataURI);
        });
      }
      break;
    }
  }
  
  init();
}

var Proxy = {
  'echo': function (file, callback) {
    var xhr = new XMLHttpRequest(),
    fd = new FormData();

    fd.append( 'file', file );
    fd.append( 'type', file.type );
    csrf_formdata(fd);
    
    xhr.addEventListener("error", function(){console.log("error echoing file..")}, false);
    xhr.onreadystatechange = function() {
      if(xhr.readyState == 4 && xhr.status == 200) {
        callback(xhr.responseText);
      }
    }
    xhr.open("POST", '/images/echo', true);
    xhr.send( fd );
  }
};
