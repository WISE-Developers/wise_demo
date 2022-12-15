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



console.log('Running the job');
exec("/usr/bin/psaas ~/app_data/testjob/job.fgmj --validate", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log("The job validated");
    console.log(`stdout: ${stdout}`);
});
exec("/usr/bin/psaas ~/app_data/testjob/job.fgmj", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log("The job validated");
    console.log(`stdout: ${stdout}`);
});
console.log("starting the keep alive process");
// iife to start the keepalive process
(function keepProcessRunning() {
    setTimeout(keepProcessRunning, 1 << 30);
  })();