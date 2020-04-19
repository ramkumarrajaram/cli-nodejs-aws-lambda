import { createController } from './createController'
import { createDirectory } from './createFileHelper'
import { createCommonModel } from './createCommonModel';

export const createFiles = async (options) => {

    const mainDirectory = options.targetDirectory + "/src/main";
    const testDirectory = options.targetDirectory + "/src/test";

    createDirectory(mainDirectory);
    createDirectory(testDirectory);

    await createController(options, mainDirectory, testDirectory);
    await createCommonModel(options, mainDirectory, testDirectory);
}