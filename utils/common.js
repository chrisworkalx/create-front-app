import ConfigStore from 'configstore';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

function sleep(timer) {
  return new Promise((resolve) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      resolve();
    }, timer);
  });
}
function wrapLoading(fn, message, ...args) {
  return new Promise(async (resolve, reject) => {
    const spinner = ora(message);
    try {
      spinner.start();
      const data = await fn(...args);
      spinner.stop();
      resolve(data);
    } catch (e) {
      spinner.fail('fetch failed, refetching ...');
      await sleep(Number(configStore.get('sleep')) || 2000);
      wrapLoading(fn, message, ...args);
    }
  });
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
);
function initConfig(options) {
  const cfaCliName = packageJson.name;
  const defaultOptions = {
    organization: 'dream-children' //github 组织
  };
  return new ConfigStore(cfaCliName, Object.assign(defaultOptions, options));
}
const configStore = initConfig();

const getTargetProjectPackageJson = (dir) =>
  JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));

const checkIsEmptyDir = (folderPath) =>
  new Promise((res, rej) => {
    if (!fs.existsSync(folderPath)) {
      rej('不存在文件夹');
      return;
    }
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        rej(err);
      }
      if (files.length === 0) {
        res(true);
      } else {
        res(false);
      }
    });
  });

export {
  wrapLoading,
  initConfig,
  packageJson,
  configStore,
  getTargetProjectPackageJson,
  checkIsEmptyDir,
  __filename,
  __dirname
};
