const fs = require("fs");
const dcmjs = require("dcmjs");
const logger = require("../logger/devLogger");

const dcmFilePath =
  "/Users/xionghailong/dicomWork/dicomServer/public/DCM/test.DCM";

const dcmBuffer = fs.readFileSync(dcmFilePath).buffer;
const dicomData = dcmjs.data.DicomMessage.readFile(dcmBuffer);
logger.log("info", dicomData.dict);

fs.writeFileSync("./dicomData", JSON.stringify(dicomData));
