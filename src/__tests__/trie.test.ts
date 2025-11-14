import { createRouteTrie } from "../trie";

describe("createRouteTrie", () => {
    interface ValueType {
        id: number;
        name: string;
    }

    it("inserts and finds a simple static route", () => {
        const trie = createRouteTrie<ValueType>("trie");
        trie.insert("/static", { id: 1, name: "static" });

        const found = trie.find("/static");
        expect(found).toBeDefined();
        expect(found!.value).toEqual({ id: 1, name: "static" });
        expect(found!.params).toEqual({});
    });

    it("returns undefined for not existing route", () => {
        const trie = createRouteTrie<ValueType>("trie");
        trie.insert("/exists", { id: 1, name: "something" });
        expect(trie.find("/not-exists")).toBeUndefined();
    });

    it("matches route with parameter", () => {
        const trie = createRouteTrie<ValueType>("trie");
        trie.insert("/users/:userId", { id: 2, name: "user route" });

        const found = trie.find("/users/42");
        expect(found).toBeDefined();
        expect(found!.value).toEqual({ id: 2, name: "user route" });
        expect(found!.params).toEqual({ userId: "42" });
    });

    it("matches route with multiple parameters", () => {
        const trie = createRouteTrie<ValueType>("trie");
        trie.insert("/teams/:teamId/users/:userId", { id: 3, name: "team-user" });

        const found = trie.find("/teams/11/users/22");
        expect(found).toBeDefined();
        expect(found!.params).toEqual({ teamId: "11", userId: "22" });
    });

    it("prefers static over param matches", () => {
        const trie = createRouteTrie<string>("trie");
        trie.insert("/foo/bar", "static");
        trie.insert("/foo/:param", "param");

        const found = trie.find("/foo/bar");
        expect(found).toBeDefined();
        expect(found!.value).toBe("static");
        expect(found!.params).toEqual({});
    });

    it("matches param if static does not exist", () => {
        const trie = createRouteTrie<string>("trie");
        trie.insert("/foo/:param", "param");
        const found = trie.find("/foo/baz");
        expect(found).toBeDefined();
        expect(found!.value).toBe("param");
        expect(found!.params).toEqual({ param: "baz" });
    });

    it("matches wildcard * for any suffix", () => {
        const trie = createRouteTrie<string>("trie");
        trie.insert("/files/*", "wildcard route");
        const found = trie.find("/files/this/is/deep/file.txt");
        expect(found).toBeDefined();
        expect(found!.value).toBe("wildcard route");
        expect(found!.params).toEqual({ "*": "this/is/deep/file.txt" });
    });

    it("matches wildcard * with empty suffix", () => {
        const trie = createRouteTrie<string>("trie");
        trie.insert("/assets/*", "assets-wild");
        const found = trie.find("/assets");
        // Should not match because the pattern expects /assets/xyz, not just "/assets"
        expect(found).toBeUndefined();
        const found2 = trie.find("/assets/");
        expect(found2).toBeUndefined();
        const found3 = trie.find("/assets/icons/foo.svg");
        expect(found3).toBeDefined();
        expect(found3!.value).toBe("assets-wild");
        expect(found3!.params).toEqual({ "*": "icons/foo.svg" });
    });

    it("matches param and then wildcard", () => {
        const trie = createRouteTrie<string>("trie");
        trie.insert("/host/:id/*", "host-wild");
        const found = trie.find("/host/99/some/other/stuff");
        expect(found).toBeDefined();
        expect(found!.value).toBe("host-wild");
        expect(found!.params).toEqual({ id: "99", "*": "some/other/stuff" });
    });

    it("does not match partial routes", () => {
        const trie = createRouteTrie<string>("trie");
        trie.insert("/foo/bar", "yes");
        expect(trie.find("/foo")).toBeUndefined();
    });

    it("handles root route", () => {
        const trie = createRouteTrie<string>("trie");
        trie.insert("/", "root");
        const found = trie.find("/");
        expect(found).toBeDefined();
        expect(found!.value).toBe("root");
        expect(found!.params).toEqual({});
    });

    it("allows inserting and finding multiple routes", () => {
        const trie = createRouteTrie<string>("trie");
        trie.insert("/a/b", "ab");
        trie.insert("/a/c", "ac");
        trie.insert("/a/:x", "ax");
        trie.insert("/a/b/c", "abc");

        expect(trie.find("/a/b")?.value).toBe("ab");
        expect(trie.find("/a/c")?.value).toBe("ac");
        expect(trie.find("/a/bar")?.value).toBe("ax");
        expect(trie.find("/a/b/c")?.value).toBe("abc");
        expect(trie.find("/a/b/c/d")).toBeUndefined();
    });

    it("avoids leaking params from backtracking in nested param/wildcard", () => {
        const trie = createRouteTrie<string>("trie");
        trie.insert("/foo/:id", "param");
        trie.insert("/foo/*", "wild");

        const found = trie.find("/foo/xyz/extra");
        expect(found).toBeDefined();
        expect(found!.value).toBe("wild");
        expect(found!.params).toEqual({ "*": "xyz/extra" });

        const found2 = trie.find("/foo/xyz");
        expect(found2).toBeDefined();
        expect(found2!.value).toBe("param");
        expect(found2!.params).toEqual({ id: "xyz" });
    });

    it("throws error value if route is inserted again", () => {
        const trie = createRouteTrie<string>("trie");
        trie.insert("/foo/bar", "first");
        expect(() => trie.insert("/foo/bar", "second")).toThrow("trie /foo/bar already exists");
    });
});
