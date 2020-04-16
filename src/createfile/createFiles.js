import { createController } from './createController'

export  const createFiles = async (options) => {

    const mainDirectory = "/src/main";
    const testDirectory = "/src/test";
    await createController(options, mainDirectory, testDirectory);
}