import { fetchRepos, fetchTags } from '../api/index.js';
import { wrapLoading } from '../utils/common.js';
import chalk from 'chalk';
import logSymbols from 'log-symbols';

export default async () => {
  let repos = await wrapLoading(
    fetchRepos,
    'wait fetch all templates names ...'
  );
  if (!repos) return;
  console.log(`${chalk.yellowBright('the following projects below:')} \r\n`);
  repos.forEach((repo) => {
    console.log(`${logSymbols.success} ${chalk.greenBright(repo.name)}\r\n`);
  });
};
