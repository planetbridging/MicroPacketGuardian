const path = require("path");

function checkPathForAcceptedFileType(filePath, acceptedFileTypes) {
  if (filePath.includes(".")) {
    const fileType = path.extname(filePath);
    if (acceptedFileTypes.includes(fileType)) {
      return true;
    }
  }
  return false;
}

function getMainPath(mainPath) {
  const questionMarkIndex = mainPath.indexOf("?");
  const beforeQuestionMark =
    questionMarkIndex !== -1
      ? mainPath.substring(0, questionMarkIndex)
      : mainPath;
  return beforeQuestionMark;
}

module.exports = { checkPathForAcceptedFileType, getMainPath };
