const ssrDetector = {
  name: "ssrDetector",

  lookup(options: Record<string, string>) {
    let found;

    if (options.lookupCookie && typeof window === "undefined") {
      // The following is required to ensure that the cookie is read from the request headers
      // This will not run client-side and is specific to SSR with NextJS
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { cookies } = require("next/headers");
      const localeCookie = cookies().get(options.lookupCookie)?.value;
      if (localeCookie) found = localeCookie;
    }

    return found;
  },
};

export default ssrDetector;
