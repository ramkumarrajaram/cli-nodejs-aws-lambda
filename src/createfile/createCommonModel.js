import { writeFile, createDirectory, exist } from './createFileHelper'

export async function createCommonModel(options, mainDirectory, testDirectory) {

    let modelDirectory = mainDirectory + "/common/model";
    let modelSpecDirectory = testDirectory + "/common/model";

    createDirectory(modelDirectory);
    createDirectory(modelSpecDirectory);

    if (exist(modelDirectory)) {
        writeFile(modelDirectory, `ApiError.ts`, apiErrorTemplate);
        writeFile(modelDirectory, `Response.ts`, responseTemplate);
    }

    if (exist(modelSpecDirectory)) {
        writeFile(modelSpecDirectory, `ApiError.spec.ts`, apiErrorSpecTemplate);
    }
}

const apiErrorTemplate = `export class ApiError extends Error {
    public statusCode: number = 500;
    constructor(message: string, statusCode: number) {
      super(message);
      super.message = this.setMessage(message);
      this.statusCode = statusCode;
      Object.setPrototypeOf(this, ApiError.prototype);
    }
  
    private setMessage = (message: string) => {
      if (message != "") {
        return \`{"message": "\${message}"}\`;
      }
      return '{"message": "INTERNAL_SERVER_ERROR"}';
    }
  }`

const responseTemplate = `export class Response {
    public statusCode: number;
    public body: string;

    constructor(statusCode: number, body: string) {
        this.statusCode = statusCode;
        this.body = body;
    }
}`

const apiErrorSpecTemplate = `import { ApiError } from '../../../main/common/model/ApiError';

describe("Tests API Error", () => {
    it("Given 400 status code returns API error with Bad request", () => {
        const actual = new ApiError("message", 400);

        expect(actual.message).toBe("{\\"message\\": \\"message\\"}");
        expect(actual.statusCode).toBe(400);
    })

    it("Given 500 status code returns API error without message", () => {
        const actual = new ApiError("", 500);

        expect(actual.message).toBe("{\\"message\\": \\"INTERNAL_SERVER_ERROR\\"}");
        expect(actual.statusCode).toBe(500);
    })

    it("Given 401 status code returns API error with custom message", () => {
        const actual = new ApiError("error_message", 401);

        expect(actual.message).toBe("{\\"message\\": \\"error_message\\"}");
        expect(actual.statusCode).toBe(401);
    })
})`