import path from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import Creator from './creator.js';
export default async (projectName, options) => {
  const cwd = process.cwd(); //获取当前命令行所在目录
  const targetPath = path.join(cwd, projectName); //生成项目路径
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
