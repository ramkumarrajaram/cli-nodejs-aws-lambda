import arg from 'arg';
import inquirer from 'inquirer';
import { createProject } from './main';

const parseArgumentsIntoOptions = (rawArgs) => {
        const args = arg(
            {
                '--git': Boolean,
                '--yes': Boolean,
                '-g': '--git',
                '-y': '--yes',
            },
            {
                argv: rawArgs.slice(2),
            }
        );
        return {
            skipPrompts: args['--yes'] || false,
            git: args['--git'] || false,
            template: args._[0],
            dependencies: '',
            devDependencies: '',
            handlerName: 'Handler',
        };
    }

 const promptForMissingOptions = async (options) => {
    const defaultTemplate = 'TypeScript';
    if (options.skipPrompts) {
        return {
            ...options,
            template: options.template || defaultTemplate,
        };
    }

    const questions = [];
    if (!options.template) {
        questions.push({
            type: 'list',
            name: 'template',
            message: 'Please choose which project template to use',
            choices: ['JavaScript', 'TypeScript'],
            default: defaultTemplate,
        });
    }

    if (!options.git) {
        questions.push({
            type: 'confirm',
            name: 'git',
            message: 'Initialize a git repository?',
            default: false,
        });
    }

    if(options.handlerName === 'Handler') {
        questions.push({
            type: 'input',
            name: 'handlerName',
            message: 'Please provide the name for the lambda handler',
            default: 'Handler',
        });
    }

    if (!options.dependencies) {
        questions.push({
            type: 'input',
            name: 'dependencies',
            message: 'Specify the dependencies you wish to install with spaces. If you do not wish to specify hit "Enter": ',
            default: "",
        });
    }

    if (!options.devDependencies) {
        questions.push({
            type: 'input',
            name: 'devDependencies',
            message: 'Specify the dev dependencies you wish to install with spaces. If you do not wish to specify hit "Enter": ',
            default: "",
        });
    }

    const answers = await inquirer.prompt(questions);
    return {
        ...options,
        template: options.template || answers.template,
        git: options.git || answers.git,
        dependencies: answers.dependencies || '',
        devDependencies: answers.devDependencies || '',
        handlerName: answers.handlerName || 'Handler'
    };
}

export async function cli(args) {
    let options = parseArgumentsIntoOptions(args);
    options = await promptForMissingOptions(options);
    await createProject(options);
}
