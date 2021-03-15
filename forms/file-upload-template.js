fileUploader() {
    let fileObj = document.getElementById('fileElem');                    
    let txtareaval = document.getElementById(this.editorContainer);
    fileObj.addEventListener('change', e => {
        
        let files = fileObj.files; 
        let pCount = 0;
        for (let file of files) {
            let isImage = false, isVideo = false, isAudio = false;
            if (file.type.startsWith('image/')) isImage = true;
            if (file.type.startsWith('video/')) isVideo = true;
            if (file.type.startsWith('audio/')) isAudio = true;
            
            let fileString = `${file['name']}~~~${file['size']}~~~${file['type']}`;
            if (this.fileStack.includes(fileString)) file = null;
            
            if ((file) && (this.dsMaxFileCount === 0)) {
                alert("File upload is not allowed");
                file = null;
            };

            if ((file) && (this.fileStack.length === this.dsMaxFileCount)) {
                alert("Allowed file count reached");
                file = null;
            }
            
            if ((file) && (Number(file['size']) > (this.dsMaxFileSize * 1024 * 1000))) {
                alert(((Number(file['size'])/1000)/1024) + "mb is more than the " + this.dsMaxFileSize + "mb allowed");
                file = null;
            }

            if (file != null) {
                this.fileStack.push(fileString);
                let fileNode = null;
                if (isVideo) {
                    fileNode = document.createElement("VIDEO");
                    fileNode.setAttribute("controls", "controls");
                    fileNode.classList.add("postVideos");
                } else if (isImage) {
                    fileNode  = document.createElement("img");
                    fileNode.classList.add("postImages");
                } else if (isAudio) {
                    fileNode  = document.createElement("audio");
                    fileNode.controls = "controls";
                    fileNode.classList.add("postAudios");
                }
                fileNode.classList.add("allEditorFiles");

                const extension = /.w+$/.exec(file.name);
                const newFileName = `${this.filePrefix}${Date.now()}${pCount}${extension}`;
                
                fileNode.id = `${newFileName}`;
                this.eFileNames.push(newFileName);
                this.fileSend.push(file);

                fileNode.file = file;
                txtareaval.appendChild(fileNode);
                var reader      = new FileReader();
                reader.onload   = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(fileNode);
                reader.readAsDataURL(file);

                var br = document.createElement("br");
                txtareaval.appendChild(br);
                txtareaval.focus();
            }
            pCount++;
        }
    });
}


//<img id="blah" alt="your image" width="100" height="100" />
//<input type="file" onchange="document.getElementById('blah').src = window.URL.createObjectURL(this.files[0])"></input>


{/* <input type="file" accept="image/*" onchange="loadFile(event)">
<img id="output"/>
<script>
  var loadFile = function(event) {
    var reader = new FileReader();
    reader.onload = function(){
      var output = document.getElementById('output');
      output.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
  };
</script> */}


{/* <input type="file" accept="image/*" onchange="loadFile(event)">
<img id="output"/>
<script>
  var loadFile = function(event) {
    var reader = new FileReader();
    reader.onload = function(){
      var output = document.getElementById('output');
      output.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
  };
</script> */}

{/* <input type="file" accept="image/*" onchange="loadFile(event)">
<img id="output"/>
<script>
  var loadFile = function(event) {
    var output = document.getElementById('output');
    output.src = URL.createObjectURL(event.target.files[0]);
    output.onload = function() {
      URL.revokeObjectURL(output.src) // free memory
    }
  };
</script> */}