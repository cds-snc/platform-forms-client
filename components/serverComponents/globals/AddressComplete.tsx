"use server";

export const getAddressCompleteApiKey = () => {
  // The Address Complete Key is domain locked, but a DEV key for Localhost could still present issues if exposed.
  //  Instead, store it in an ENV file, and then it gets passed to the Client from the Server as necessary.
  //  Once in Prod, the key no longer has any security concerns as it is domain locked.
  return process.env.ADDRESS_COMPLETE_API_KEY || "";
};
