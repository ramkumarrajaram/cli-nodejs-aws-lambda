import chalk from 'chalk';
import fs from 'fs';
import ncp from 'ncp';
import path from 'path';
import { promisify } from 'util';
import execa from 'execa';
import Listr from 'listr';
import { projectInstall } from 'pkg-install';

const access = promisify(fs.access);
const copy = promisify(ncp);

const handlerTemplate = `exports.handler = async () => {
  try {
      return "Implementation for Handler";
  } catch (error) {
      throw error
  }
};`;

const handlerSpecTemplate = (handlerName) => {
 return  `const subject = require("../main/${handlerName}");
describe("subject.test ", () => {
    it("returns Implementation details", async () => {
        const response = await subject.handler();
        expect(response).toBe("Implementation for Handler");
    });
}); `;
}

async function copyTemplateFiles(options) {
  copy(options.templateDirectory, options.targetDirectory, {
    clobber: false,
  });

  const mainDirectory = "/src/main";
  const testDirectory = "/src/test";
  let handlerDirectory = options.targetDirectory + mainDirectory
  let handlerSpecDirectory = options.targetDirectory + testDirectory

  createDirectory(options, mainDirectory);
  createDirectory(options, testDirectory);

  if (exist(handlerDirectory)) {
    writeFile(handlerDirectory, `${options.handlerName}.ts`, handlerTemplate);
  }

  if (exist(handlerSpecDirectory)) {
    writeFile(handlerSpecDirectory, `${options.handlerName}.spec.ts`, handlerSpecTemplate(options.handlerName));
  }

  return;
}

function writeFile(fileDirectory, fileName, template) {
  const pathToFile = path.join(fileDirectory, fileName);
  fs.writeFileSync(pathToFile, template);
  console.log(chalk.green("File -> " + pathToFile, "Creation Successfully"));
}

function createDirectory(options, dirPath) {
  fs.mkdirSync(options.targetDirectory + dirPath, { recursive: true }, (error) => {
    if (error) {
      console.log(error);
    } else {
      console.log("success");
    }
  });
}

const exist = (dir) => {
  if (fs.existsSync(dir)) {
    return true;
  } else {
    return false;
  }
};

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
        projectInstall({
          cwd: options.targetDirectory,
        }),
      skip: () =>
        !options.runInstall
          ? 'Pass --install to automatically install dependencies'
          : undefined,
    },
  ]);

  await tasks.run();
  console.log(chalk.green.bold('TypeScript Lambda project created successfully!'));
  return true;
}