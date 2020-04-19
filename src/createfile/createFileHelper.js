import fs from 'fs';
import chalk from 'chalk';
import path from 'path';

export function writeFile(fileDirectory, fileName, template) {
    const pathToFile = path.join(fileDirectory, fileName);
    fs.writeFileSync(pathToFile, template);
    console.log(chalk.green("File -> " + pathToFile, "Creation Successfully"));
}

export function createDirectory(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true }, (error) => {
        if (error) {
            console.log(error);
        } else {
            console.log("success");
        }
    });
}

export const exist = (dir) => {
    if (fs.existsSync(dir)) {
        return true;
    } else {
        return false;
    }
};