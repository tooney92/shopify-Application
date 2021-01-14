

module.exports.issuesCheck = (files, mimeTypes) => {
   
    //present property is set to true if there are any issues
    const fileIssues = {
        largeFiles : [],
        invalidFormat : []
    }

    files.forEach(file => {
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
        return {largeFiles : fileIssues.largeFiles, invalidFormat : fileIssues.invalidFormat}
    }

    return null
    
//    return fileIssues.present ? {issues: true, fileIssues} : {issues:false}
}