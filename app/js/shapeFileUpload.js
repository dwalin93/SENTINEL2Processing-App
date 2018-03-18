/**
 * Created by pglah on 06.03.2018.
 */
Dropzone.options.uploadWidget = {
    parallelUploads: 15,
    paramName: 'file',
    autoProcessQueue: false,
    dictDefaultMessage: 'Drag a shapefile here to upload, or click to select one. \n Please provide all shapefile components seperatly and not in a folder.',
    acceptedFiles: '.cpg,.dbf,.prj,.sbn,.sbx,.shp,.shx,.atx,.fbn,.fbx,.ain,.aih,.ixs,.mxs,.xml,.cpg',
    addRemoveLinks: true,
    init: function() {
        $('#uploadShapeFiles').click(function() {
            var myDropzone = Dropzone.forElement(".dropzone");
            myDropzone.processQueue();
        });
        this.on('success', function( file, resp ){
            console.log( file );
            window.localStorage.setItem("Shapefile",file.name.toString().substring(0,file.name.length-4))
            console.log( resp );
        });
        this.on('removed files', function(file){
            console.log('file removed');
        });
        this.on('queuecomplete',function (files) {
            this.removeAllFiles(files);
            alert('Your Shapefile is uploaded sucessfully')
            document.getElementById('ShapeFile').innerHTML = 'Shapefile uploaded: ' + localStorage.getItem("Shapefile");
        })




    }

};

