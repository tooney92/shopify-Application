module.exports.mimeCheck = (files, mimeTypes) => {
   
    
    const invalidFiles = []
    files.forEach(file => {
        if(!mimeTypes.includes(file.mimetype))
        {
            // console.log(file);
            invalidFiles.push(file.name)
        } 
    });
    
    // console.log(invalidFiles);
   return invalidFiles.length > 0 ? {issues:true, invalidFiles} : {issues:false}
}