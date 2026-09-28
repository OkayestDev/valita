import { ChildProcess, spawn } from "child_process";
import fs from "fs";
import path from "path";

const root = path.resolve(__dirname, "../../..");
const appPath = path.join(root, "example/valita-bookstore/bookstore.app.ts");
const tsxPath = path.join(root, "node_modules/tsx/dist/cli.mjs");
const coverPath = path.join(root, "example/valita-bookstore/cover.png");
const newBooksPath = path.join(root, "example/valita-bookstore/controller/new-books.json");

type HttpResult = {
    status: number;
    body: any;
    headers: Headers;
};

describe("valita bookstore", () => {
    let child: ChildProcess;
    let baseUrl: string;

    beforeAll(async () => {
        fs.rmSync(newBooksPath, { force: true });
        child = spawn(process.execPath, [tsxPath, appPath], {
            cwd: root,
            env: { ...process.env, PORT: "0" },
            stdio: ["ignore", "pipe", "pipe"],
        });
        const port = await waitForServer(child);
        baseUrl = `http://127.0.0.1:${port}`;
    }, 20000);

    afterAll(async () => {
        if (child && child.exitCode === null) {
            child.kill();
            await new Promise((resolve) => child.once("exit", resolve));
        }
        fs.rmSync(newBooksPath, { force: true });
    });

    it("should list books", async () => {
        const response = await request("/books?userId=123");

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Books fetched successfully");
        expect(response.body.books).toHaveLength(4);
        expect(response.body.books[0].title).toBe("The Pragmatic Programmer");
    });

    it("should reject a request without a user id", async () => {
        const response = await request("/books");

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "Unauthorized" });
    });

    it("should fetch one book", async () => {
        const response = await request("/books/1?userId=123");

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Book fetched successfully");
        expect(response.body.book).toMatchObject({
            id: "1",
            title: "The Pragmatic Programmer",
        });
    });

    it("should add a book and write new-books.json", async () => {
        const response = await request("/books?userId=123", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                title: "Designing Data-Intensive Applications",
                author: "Martin Kleppmann",
                genre: "Programming",
                published: 2017,
                in_stock: true,
            }),
        });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Book added successfully");
        expect(response.body.book).toMatchObject({
            id: "5",
            title: "Designing Data-Intensive Applications",
            author: "Martin Kleppmann",
            published: 2017,
            in_stock: true,
        });

        const saved = JSON.parse(fs.readFileSync(newBooksPath, "utf8"));
        expect(saved).toHaveLength(5);
        expect(saved[4].title).toBe("Designing Data-Intensive Applications");
    });

    it("should upload a cover", async () => {
        const cover = fs.readFileSync(coverPath);
        const boundary = "valita-cover";
        const body = Buffer.concat([
            Buffer.from(
                `--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\nFront cover\r\n` +
                    `--${boundary}\r\nContent-Disposition: form-data; name="cover"; filename="cover.png"\r\n` +
                    `Content-Type: image/png\r\n\r\n`,
            ),
            cover,
            Buffer.from(`\r\n--${boundary}--\r\n`),
        ]);
        const response = await request("/books/1/cover?userId=123", {
            method: "POST",
            headers: { "content-type": `multipart/form-data; boundary=${boundary}` },
            body,
        });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            message: "Cover uploaded",
            bookId: "1",
            caption: "Front cover",
            cover: {
                filename: "cover.png",
                mediaType: "image/png",
                size: cover.length,
            },
        });
    });

    it("should reject a book id that is not a positive integer", async () => {
        const notANumber = await request("/books/nope?userId=123");
        const notPositive = await request("/books/0?userId=123");
        const notAnInteger = await request("/books/1.5?userId=123");

        for (const response of [notANumber, notPositive, notAnInteger]) {
            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Validation failed");
            expect(response.body.error).toEqual(
                expect.arrayContaining([expect.objectContaining({ path: ["params", "id"] })]),
            );
        }
    });

    it("should reject a new book that does not match the schema", async () => {
        const before = savedBookCount();
        const response = await request("/books?userId=123", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                title: "",
                author: "Martin Kleppmann",
                genre: "Programming",
                published: "2017",
                in_stock: "yes",
            }),
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Validation failed");
        expect(issuePaths(response.body.error)).toEqual(
            expect.arrayContaining([["body", "title"], ["body", "published"], ["body", "in_stock"]]),
        );
        expect(savedBookCount()).toBe(before);
    });

    it("should reject a cover upload that does not match the schema", async () => {
        const invalidId = await request(multipartCover("/books/0/cover?userId=123", "Front cover"));
        const invalidCaption = await request("/books/1/cover?userId=123", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ caption: 1 }),
        });

        expect(invalidId.status).toBe(400);
        expect(issuePaths(invalidId.body.error)).toEqual(
            expect.arrayContaining([["params", "id"]]),
        );
        expect(invalidCaption.status).toBe(400);
        expect(issuePaths(invalidCaption.body.error)).toEqual(
            expect.arrayContaining([["body", "caption"]]),
        );
    });

    it("should answer unmatched OPTIONS requests", async () => {
        const response = await request("/books", { method: "OPTIONS" });

        expect(response.status).toBe(200);
        expect(response.headers.get("access-control-allow-origin")).toBe("*");
        expect(response.headers.get("access-control-allow-methods")).toBe(
            "GET, POST, PUT, DELETE, OPTIONS",
        );
    });

    function multipartCover(pathname: string, caption: string): [string, RequestInit] {
        const boundary = "valita-cover";
        const body = Buffer.concat([
            Buffer.from(
                `--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${caption}\r\n` +
                    `--${boundary}\r\nContent-Disposition: form-data; name="cover"; filename="cover.png"\r\n` +
                    `Content-Type: image/png\r\n\r\n`,
            ),
            fs.readFileSync(coverPath),
            Buffer.from(`\r\n--${boundary}--\r\n`),
        ]);
        return [
            pathname,
            {
                method: "POST",
                headers: { "content-type": `multipart/form-data; boundary=${boundary}` },
                body,
            },
        ];
    }

    async function request(
        pathnameOrParts: string | [string, RequestInit],
        init?: RequestInit,
    ): Promise<HttpResult> {
        const pathname = Array.isArray(pathnameOrParts) ? pathnameOrParts[0] : pathnameOrParts;
        const options = Array.isArray(pathnameOrParts) ? pathnameOrParts[1] : init;
        const response = await fetch(`${baseUrl}${pathname}`, options);
        const text = await response.text();
        const contentType = response.headers.get("content-type") ?? "";
        const body = contentType.includes("application/json") && text ? JSON.parse(text) : text;
        return { status: response.status, body, headers: response.headers };
    }
});

function issuePaths(error: { path: string[] }[]): string[][] {
    return error.map((issue) => issue.path);
}

function savedBookCount(): number {
    if (!fs.existsSync(newBooksPath)) {
        return 0;
    }
    return JSON.parse(fs.readFileSync(newBooksPath, "utf8")).length;
}

function waitForServer(child: ChildProcess): Promise<number> {
    return new Promise((resolve, reject) => {
        const stdout = child.stdout;
        const stderr = child.stderr;
        if (!stdout || !stderr) {
            reject(new Error("Bookstore server pipes were not created"));
            return;
        }

        let output = "";
        const timer = setTimeout(() => {
            cleanup();
            reject(new Error(`Bookstore server did not start\n${output}`));
        }, 15000);
        const onData = (chunk: Buffer) => {
            output += chunk.toString();
            const match = output.match(/Bookstore app is running on port (\d+)/);
            if (!match) {
                return;
            }
            cleanup();
            resolve(Number(match[1]));
        };
        const onExit = (code: number | null) => {
            cleanup();
            reject(new Error(`Bookstore server exited with ${code}\n${output}`));
        };
        const cleanup = () => {
            clearTimeout(timer);
            stdout.off("data", onData);
            stderr.off("data", onData);
            child.off("exit", onExit);
        };
        stdout.on("data", onData);
        stderr.on("data", onData);
        child.on("exit", onExit);
    });
}
