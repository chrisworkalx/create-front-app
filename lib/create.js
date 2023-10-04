import path from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer';

import { exec } from 'child_process';
import Creator from './creator.js';
import { checkIsEmptyDir, wrapLoading } from '../utils/common.js';
import chalk from 'chalk';

const shellExec = (...args) =>
  new Promise((resolve, reject) => {
    exec(...args, (err) => {
      if (err) {
        return reject(err);
      } else {
        console.log('\r\n');
        console.log(chalk.redBright(`已成功当前文件夹内所有内容并重新创建`));
        console.log(`\r\n${chalk.greenBright('finished...')}`);
        resolve(true);
      }
    });
  });

export default async (projectName, options) => {
  const cwd = process.cwd(); //获取当前命令行所在目录
  const targetPath = path.join(cwd, projectName); //生成项目路径
  let isEmpty = true;
  try {
    isEmpty = await checkIsEmptyDir(targetPath);
  } catch (e) {
    console.log(chalk.redBright(e));
  }

  if (!projectName || projectName === '.') {
    if (!isEmpty) {
      await wrapLoading(
        shellExec,
        `正在删除${chalk.yellowBright(targetPath)}子目录及文件等`,
        'rm -rf *',
        {
          cwd: targetPath
        }
      );
    }
  }
  if (fs.existsSync(targetPath) && projectName && projectName !== '.') {
    //如果有这个路径
    if (options.force) {
      // 有--force 的情况下直接移除旧的项目
      await fs.remove(targetPath);
    } else {
      //否则的话选择是要覆盖呢还是退出
      const { action } = await inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: 'Target directory already exists,please choose an action:',
          choices: [
            {
              name: 'Overwrite',
              value: 'overwrite'
            },
            {
              name: 'Cancel',
              value: false
            }
          ]
        }
      ]);
      // 如果是退出就直接退出
      if (!action) return;
      else {
        //否则的话就是移除旧的
        console.log('\r\nRemoving ...');
        await fs.remove(targetPath);
      }
    }
  }
  // 创建项目
  const creator = new Creator(projectName, targetPath);
  creator.create();
};
