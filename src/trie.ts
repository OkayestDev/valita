type TrieNode<T> = {
    children: Record<string, TrieNode<T>>;
    paramChild?: TrieNode<T>; // for :param
    wildcardChild?: TrieNode<T>; // for *
    paramName?: string;
    value?: T;
};

export type RouteTrie<T> = {
    find: (path: string) => { value: T; params: Record<string, string> } | undefined;
    insert: (path: string, value: T) => void;
};

function quickSplit(path: string): string[] {
    const out = [];
    let start = 0;
    for (let i = 0; i < path.length; i++) {
        if (path[i] === "/") {
            if (i > start) {
                out.push(path.slice(start, i));
            }
            start = i + 1;
        }
    }
    if (start < path.length) {
        out.push(path.slice(start));
    }
    return out;
}

export function createRouteTrie<T>(name: string): RouteTrie<T> {
    const root: TrieNode<T> = { children: {} };

    function insert(path: string, value: T) {
        const segments = quickSplit(path);
        let node = root;

        for (const segment of segments) {
            if (segment === "*") {
                if (!node.wildcardChild) {
                    node.wildcardChild = { children: {} };
                }
                node = node.wildcardChild!;
            } else if (segment.startsWith(":")) {
                if (!node.paramChild) {
                    node.paramChild = { children: {}, paramName: segment.slice(1) };
                }
                node = node.paramChild;
            } else {
                if (!node.children[segment]) {
                    node.children[segment] = { children: {} };
                }
                node = node.children[segment];
            }
        }
        if (node.value !== undefined) {
            throw new Error(`${name} ${path} already exists`);
        }
        node.value = value;
    }

    function search(
        node: TrieNode<T>,
        idx: number,
        segments: string[],
        params: Record<string, string> = {},
    ): { node: TrieNode<T>; params: Record<string, string> } | undefined {
        if (idx === segments.length) {
            if (node.value !== undefined) {
                return { node, params };
            }
            return undefined;
        }
        const segment = segments[idx];

        // Exact match first
        if (node.children[segment]) {
            const result = search(node.children[segment], idx + 1, segments, params);
            if (result) {
                return result;
            }
        }

        // Param match
        if (node.paramChild) {
            params[node.paramChild.paramName!] = segment;
            const result = search(node.paramChild, idx + 1, segments, params);
            if (result) {
                return result;
            }
            delete params[node.paramChild.paramName!]; // backtrack
        }

        // Wildcard match (matches the rest, attaches to *)
        if (node.wildcardChild) {
            params["*"] = segments.slice(idx).join("/");
            if (node.wildcardChild.value !== undefined) {
                return { node: node.wildcardChild, params };
            }
        }

        return undefined;
    }

    function find(path: string): { value: T; params: Record<string, string> } | undefined {
        const segments = quickSplit(path);
        const params: Record<string, string> = {};

        const found = search(root, 0, segments, params);
        if (found) {
            return { value: found.node.value!, params: found.params };
        }
        return undefined;
    }

    return { insert, find };
}
