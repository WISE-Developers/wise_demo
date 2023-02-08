// by this
import * as fs from 'fs-extra';
// import exec
import { exec } from 'child_process';
// clear the old results
console.log('Clearing old results');
try {
    fs.removeSync('~/app_data/testjob/Outputs');
} catch (error) {
    console.log('Error clearing old results');
    console.log(error);
}

async function modelLogic () {
    console.log('Running the job');
    await exec("/usr/bin/wise ~/app_data/testjob/job.fgmj --validate", (error, stdout, stderr) => {
        if (error || stderr) {
            console.log(`error: ${error?.message}`);
            console.log(`stderr: ${stderr}`);
            console.log(JSON.stringify(error, ["message", "arguments", "type", "name"]));

            process.exit(1);
            return;
        }
        console.log("The job validated");
        console.log(`stdout: ${stdout}`);
    });
    exec("/usr/bin/wise ~/app_data/testjob/job.fgmj", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            console.log(JSON.stringify(error, ["message", "arguments", "type", "name"]));
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
        console.log("ENVIRONMENT",process.env);
        console.log("CWD",process.cwd());
         exec("env", (error, stdout, stderr) => {
            if (error || stderr) {
                console.log(`error: ${error?.message}`);
                console.log(`stderr: ${stderr}`);
                process.exit(1);
                return;
            }
            
            console.log(`Environment was: ${stdout}`);
        });


    });
    
}






modelLogic();


// console.log("starting the keep alive process");
// // iife to start the keepalive process
// (function keepProcessRunning() {
//     setTimeout(keepProcessRunning, 1 << 30);
//   })();