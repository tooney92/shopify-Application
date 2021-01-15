module.exports.issuesCheck = (files, mimeTypes) => {
    //present property is set to true if there are any issues
    const fileIssues = {
        largeFiles: [],
        invalidFormat: [],
        filesGreaterThan20: false
    }
    if (files.length > 20) { fileIssues.filesGreaterThan20 = true }
    files.forEach(file => {
        //checks if file size is greater than 2MB
        if (file.size > 2000000) {
            fileIssues.largeFiles.push(file.name)
        }
        if (!mimeTypes.includes(file.mimetype)) {
            fileIssues.invalidFormat.push(file.name)
        }
    });
    if (fileIssues.largeFiles.length > 0 || fileIssues.invalidFormat.length > 0) {
        return {
            largeFiles: fileIssues.largeFiles,
            invalidFormat: fileIssues.invalidFormat,
            filesGreaterThan20: fileIssues.filesGreaterThan20
        }
    }
    return null
}