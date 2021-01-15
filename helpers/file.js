// module.exports.mimeCheck = (files, mimeTypes) => {
   
    
//     const invalidFiles = []
//     files.forEach(file => {
//         if(!mimeTypes.includes(file.mimetype))
//         {
//             // console.log(file);
//             invalidFiles.push(file.name)
//         } 
//     });
    
//     // console.log(invalidFiles);
//    return invalidFiles.length > 0 ? {issues:true, invalidFiles} : {issues:false}
// }

module.exports.issuesCheck = (files, mimeTypes) => {
   
    //present property is set to true if there are any issues
    const fileIssues = {
        largeFiles : [],
        invalidFormat : [], 
        filesGreaterThan20: false
    }

    if (files.length > 20) {
        fileIssues.filesGreaterThan20 = true
    }

    files.forEach(file => {
        //checks if file size is greater than 2MB
        if(file.size > 2000000)
        {
            fileIssues.largeFiles.push(file.name)
        } 
        if(!mimeTypes.includes(file.mimetype))
        {
            // console.log(file);
            fileIssues.invalidFormat.push(file.name)
        } 
    });

    if(fileIssues.largeFiles.length > 0 || fileIssues.invalidFormat.length > 0)
    {
        // fileIssues.present = true
        return {
            largeFiles : fileIssues.largeFiles, 
            invalidFormat : fileIssues.invalidFormat,
            filesGreaterThan20: fileIssues.filesGreaterThan20
        }
    }

    return null
    
//    return fileIssues.present ? {issues: true, fileIssues} : {issues:false}
}