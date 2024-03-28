import { GET as NextGET, POST as NextPOST } from "@lib/auth";

export const GET = NextGET;
export const POST = NextPOST;

// Add custom filter to remove calls that we don't want to allow through this endpoint.
// Remove all POST except (update, signout)
