import chalk from 'chalk';
import fs from 'fs';
import ncp from 'ncp';
import path from 'path';
import { promisify } from 'util';
import execa from 'execa';
import Listr from 'listr';
import { projectInstall, install } from 'pkg-install';
import { createFiles } from './createfile/createFiles';

const access = promisify(fs.access);
const copy = promisify(ncp);

async function copyTemplateFiles(options) {
  copy(options.templateDirectory, options.targetDirectory, {
    clobber: false,
  });

  await createFiles(options);

  return;
}

async function initGit(options) {
  const result = await execa('git', ['init'], {
    cwd: options.targetDirectory,
  });
  if (result.failed) {
    return Promise.reject(new Error('Failed to initialize git'));
  }
  return;
}

export async function createProject(options) {
  options = {
    ...options,
    targetDirectory: options.targetDirectory || process.cwd(),
  };
  console.log(chalk.green.bold(options.targetDirectory));

  const currentFileUrl = import.meta.url;
  const templateDir = path.resolve(
    new URL(currentFileUrl).pathname,
    '../../templates',
    options.template.toLowerCase()
  );
  options.templateDirectory = templateDir;

  try {
    await access(templateDir, fs.constants.R_OK);
  } catch (err) {
    console.error('%s Invalid template name', chalk.red.bold('ERROR'));
    process.exit(1);
  }

  const tasks = new Listr([
    {
      title: 'Copy project files',
      task: () => copyTemplateFiles(options),
    },
    {
      title: 'Initialize git',
      task: () => initGit(options),
      enabled: () => options.git,
    },
    {
      title: 'Install dependencies',
      task: () =>
        install(
          options.dependencies.trim().split(" "),
          {
            dev: false,
            prefer: 'npm',
          }
        ),
      skip: () =>
        !options.dependencies
          ? 'Skipped installing dependencies'
          : "",
    },
    {
      title: 'Install dev dependencies',
      task: () =>
        install(
          options.devDependencies.trim().split(" "),
          {
            dev: true,
            prefer: 'npm',
          }
        ),
      skip: () =>
        !options.devDependencies
          ? 'Skipped installing dev dependencies'
          : "",
    }
  ]);

  await tasks.run();
  console.log(chalk.green.bold('TypeScript Lambda project created successfully!'));
  return true;
}