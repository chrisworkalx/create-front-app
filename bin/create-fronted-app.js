#!/usr/bin/env node
import program from 'commander';
import chalk from 'chalk';
import create from '../lib/create.js';
import getAllTemplates from '../lib/getAllTemplates.js';
import { packageJson } from '../utils/common.js';

program
  .usage('<command> [option]')
  .version(`version is ${chalk.blue(packageJson.version)}`);

program
  .command('create <project-name>')
  .description(
    //用来描述create命令干啥的
    'A simple CLI for building initialize project include Vue、React、QianKun...'
  )
  .option('-f,--force', 'overwrite target directory if it exists')
  .action((name, cmd) => {
    create(name, cmd);
  })
  .option('-l --list', 'project list');

program
  .command('list')
  .description('display all projects')
  .action(() => {
    getAllTemplates();
  });

// 监听到help命令：ku --help时会调用回调函数
program.on('--help', () => {
  console.log();
  console.log(
    `Run ${chalk.cyan(
      'create-fronted-app <command> --help'
    )} for detailed usage of given command.`
  );
  console.log();
});

// 没有任何命令的时候输出使用帮助
if (!process.argv.slice(2).length) {
  // program.outputHelp();
}

program.parse(process.argv);
