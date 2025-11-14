type TrieNode<T> = {
    children: Map<string, TrieNode<T>>;
    paramChild?: TrieNode<T>; // for :param
    wildcardChild?: TrieNode<T>; // for *
    paramName?: string;
    value?: T;
};

export type RouteTrie<T> = {
    find: (path: string) => { value: T; params: Record<string, string> } | undefined;
    insert: (path: string, value: T) => void;
};

export function createRouteTrie<T>(name: string): RouteTrie<T> {
    const root: TrieNode<T> = { children: new Map() };

    function insert(path: string, value: T) {
        const segments = path.split("/").filter(Boolean);
        let node = root;

        for (const segment of segments) {
            if (segment === "*") {
                if (!node.wildcardChild) {
                    node.wildcardChild = { children: new Map() };
                }
                node = node.wildcardChild!;
            } else if (segment.startsWith(":")) {
                if (!node.paramChild) {
                    node.paramChild = { children: new Map(), paramName: segment.slice(1) };
                }
                node = node.paramChild;
            } else {
                if (!node.children.has(segment)) {
                    node.children.set(segment, { children: new Map() });
                }
                node = node.children.get(segment)!;
            }
        }
        if (node.value !== undefined) {
            throw new Error(`${name} ${path} already exists`);
        }
        node.value = value;
    }

    function find(path: string): { value: T; params: Record<string, string> } | undefined {
        const segments = path.split("/").filter(Boolean);
        const params: Record<string, string> = {};

        function search(
            node: TrieNode<T>,
            idx: number,
        ): { node: TrieNode<T>; params: Record<string, string> } | undefined {
            if (idx === segments.length) {
                if (node.value !== undefined) {
                    return { node, params: { ...params } };
                }
                return undefined;
            }
            const segment = segments[idx];

            // Exact match first
            if (node.children.has(segment)) {
                const result = search(node.children.get(segment)!, idx + 1);
                if (result) {
                    return result;
                }
            }

            // Param match
            if (node.paramChild) {
                params[node.paramChild.paramName!] = segment;
                const result = search(node.paramChild, idx + 1);
                if (result) return result;
                delete params[node.paramChild.paramName!]; // backtrack
            }

            // Wildcard match (matches the rest, attaches to *)
            if (node.wildcardChild) {
                params["*"] = segments.slice(idx).join("/");
                if (node.wildcardChild.value !== undefined) {
                    return { node: node.wildcardChild, params: { ...params } };
                }
            }

            return undefined;
        }

        const found = search(root, 0);
        if (found) {
            return { value: found.node.value!, params: found.params };
        }
        return undefined;
    }

    return { insert, find };
}
