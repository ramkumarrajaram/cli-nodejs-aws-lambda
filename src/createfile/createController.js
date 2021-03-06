import { writeFile, createDirectory, exist } from './createFileHelper'

export async function createController(options, mainDirectory, testDirectory) {
   
    let handlerDirectory = mainDirectory + "/web";
    let handlerSpecDirectory = testDirectory + "/web";

    createDirectory(handlerDirectory);
    createDirectory(handlerSpecDirectory);

    if (exist(handlerDirectory)) {
        writeFile(handlerDirectory, `${options.handlerName}.ts`, handlerTemplate);
    }

    if (exist(handlerSpecDirectory)) {
        writeFile(handlerSpecDirectory, `${options.handlerName}.spec.ts`, handlerSpecTemplate(options.handlerName));
    }
}

const handlerTemplate = `exports.handler = async () => {
    try {
        return "Implementation for Handler";
    } catch (error) {
        throw error
    }
  };`;

const handlerSpecTemplate = (handlerName) => {
    return `const subject = require("../../main/web/${handlerName}");
  describe("subject.test ", () => {
      it("returns Implementation details", async () => {
          const response = await subject.handler();
          expect(response).toBe("Implementation for Handler");
      });
  }); `;
}