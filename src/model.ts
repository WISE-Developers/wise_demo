// by this
import * as fs from 'fs-extra';
// import exec
import { exec } from 'child_process';
// clear the old results
fs.removeSync('~/app_data/test_job/Outputs'); 

exec("psaas ~/app_data/test_job/job.fgmj --validate", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});

// iife to start the keepalive process
(function keepProcessRunning() {
    setTimeout(keepProcessRunning, 1 << 30);
  })();