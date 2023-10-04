import { fetchRepos, fetchTags } from '../api/index.js';
import inquirer from 'inquirer';
import {
  wrapLoading,
  configStore,
  getTargetProjectPackageJson
} from '../utils/common.js';
import { promisify } from 'util';
import downloadRepo from 'download-git-repo';
import fs from 'fs-extra';
import path from 'path';
import spawn from 'cross-spawn';
import chalk from 'chalk';
import { hasYarnProject, hasYarn } from '../utils/env.js';

const downloadGitRepo = promisify(downloadRepo); //将downloadRepo函数promise化

class Creator {
  constructor(projectName, targetPath) {
    this.name = projectName;
    this.target = targetPath;
  }
  async create() {
    //1. 获取项目模板名称
    const repo = await this.getRepo();
    // 2. 获取版本号
    const tag = await this.getTag(repo);
    // 3. 下载
    await this.download(repo, tag);
  }
  _spawn() {
    const isYarnProject = hasYarnProject(this.name);
    const isYarn = hasYarn();
    //将安装的输出信息由子进程输出到主进程
    spawn(
      isYarnProject ? (isYarn ? 'yarn' : 'npx') : 'npm',
      isYarnProject ? (isYarn ? [] : ['yarn']) : ['install'],
      {
        cwd: this.target,
        stdio: ['pipe', process.stdout, process.stderr]
      }
    ).on('close', () => {
      console.log();
      console.log(
        `Successfully created project ${chalk.yellowBright(this.name)}`
      );
      console.log('Get started with the following commands:');
      console.log();
      console.log(chalk.cyan(`cd ${this.name}`));
      const targetDirPackageJson = getTargetProjectPackageJson(this.target);
      const scripts = Object.keys(targetDirPackageJson.scripts) || [];
      try {
        // try catch 目的为了跳出循环
        ['start', 'dev', 'serve'].forEach((key) => {
          if (scripts.includes(key)) {
            console.log(
              chalk.cyan(
                isYarnProject ? `yarn ${key}\r\n` : `npm run ${key}\r\n`
              )
            );
            throw new Error();
          }
        });
      } catch (e) {
        // console.log(e)
      }
    });
  }
  async getRepo() {
    let repos = await wrapLoading(fetchRepos, 'wait fetch repo ...');
    if (!repos) return;
    repos = repos.map((repo) => repo.name);
    const { repo } = await inquirer.prompt({
      name: 'repo',
      type: 'list',
      choices: repos,
      message: 'please choose a project template'
    });
    return repo;
  }
  async getTag(repo) {
    let tags = await wrapLoading(fetchTags, 'wait fetch tag...', repo);
    if (!tags) return;
    tags = tags.map((repo) => repo.name);
    const { tag } = await inquirer.prompt({
      name: 'tag',
      type: 'list',
      choices: tags,
      message: 'please choose a tag'
    });
    return tag;
  }
  async download(repo, tag) {
    const requestUrl = `${configStore.get('organization')}/${repo}#${tag}`;
    await wrapLoading(
      downloadGitRepo,
      'wait download repo ...',
      requestUrl,
      this.target
    );
    // 进入项目目录自动下载依赖
    this._spawn();
  }
}
export default Creator;
