"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// by this
const fs = __importStar(require("fs-extra"));
// import exec
const child_process_1 = require("child_process");
// clear the old results
console.log('Clearing old results');
try {
    fs.removeSync('~/app_data/testjob/Outputs');
}
catch (error) {
    console.log('Error clearing old results');
    console.log(error);
}
async function modelLogic() {
    console.log('Running the job');
    await (0, child_process_1.exec)("/usr/bin/wise ~/app_data/testjob/job.fgmj --validate", (error, stdout, stderr) => {
        if (error || stderr) {
            console.log(`error: ${error?.message}`);
            console.log(`stderr: ${stderr}`);
            process.exit(1);
            return;
        }
        console.log("The job validated");
        console.log(`stdout: ${stdout}`);
    });
    (0, child_process_1.exec)("/usr/bin/wise ~/app_data/testjob/job.fgmj", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log("The job was executed");
        console.log(`stdout: ${stdout}`);
        // read in the file ~/app_data/testjob/Outputs/bestSummary.txt
        // and return the contents
        console.log('Reading the results');
        const bestSummary = fs.readFileSync('/root/app_data/testjob/Outputs/bestSummary.txt', 'utf8');
        console.log(bestSummary);
        const worstSummary = fs.readFileSync('/root/app_data/testjob/Outputs/worstSummary.txt', 'utf8');
        console.log(worstSummary);
    });
}
modelLogic();
// console.log("starting the keep alive process");
// // iife to start the keepalive process
// (function keepProcessRunning() {
//     setTimeout(keepProcessRunning, 1 << 30);
//   })();
