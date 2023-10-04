import { checkIsEmptyDir, wrapLoading } from './utils/common.js';
import { exec } from 'child_process';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
const shellExec = (...args) =>
  new Promise((resolve, reject) => {
    exec(...args, (err) => {
      if (err) {
        return reject(err);
      } else {
        console.log('');
        console.log(
          chalk.redBright(`删除当前文件夹${targetPath}所有内容并重新创建`)
        );
        resolve(true);
      }
    });
  });

const cwd = process.cwd(); //获取当前命令行所在目录
const targetPath = path.join(cwd, 'bb');

console.log('targetPath', targetPath);

checkIsEmptyDir(targetPath)
  .then((isEmpty) => {
    // console.log('isEmpty', isEmpty);
    if (!isEmpty) {
      console.log('这里测试');
      wrapLoading(
        shellExec,
        `正在删除${chalk.yellowBright(targetPath)}子目录及文件等`,
        `cd ${targetPath}/ && rm -rf *`,
        {
          cwd: targetPath
        }
      );
    }
  })
  .catch((e) => {});
