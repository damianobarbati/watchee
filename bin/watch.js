#!/usr/bin/env node
import gaze from 'gaze';
import process from 'process';
import yargs from 'yargs';
import { exec } from 'child_process';

process.title = 'watch';

const captureOutput = (child, output) => child.pipe(output);

const runCmd = function (cmd, filepath, event, cb) {
  console.log('Running ' + cmd);

  const cp = exec(cmd, error => cb(error));

  captureOutput(cp.stdout, process.stdout);
  captureOutput(cp.stderr, process.stderr);
};

const watch = ({ files, command }) => {
  gaze(files, function () {
    console.log('Watch started');

    let lastEvent = new Date();
    let running = false;
    this.on('all', (event, filepath) =>{
      const now = new Date();
      if (!running && (now - lastEvent) > 400) {
        running = true;
        console.log(filepath + ' ' + event);

        if (!command) {
          console.log('No command found.');
          running = false;
          lastEvent = now;
          return;
        }
        runCmd(command, filepath, event, () => {
          running = false;
          console.log(command);
        });
        lastEvent = now;
      }
    });
  });
};

const { argv } = yargs(process.argv.slice(2));
const files = argv.f;
const command = argv.c;

watch({ files, command });
