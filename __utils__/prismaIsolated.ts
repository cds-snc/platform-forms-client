import {
  createAdvancedServer,
  IAdvanceServerSession,
  DbRawCommand,
  IResponseWriter,
} from "pg-server";
import { Socket } from "net";
import { logMessage } from "@lib/logger";

export const createFakeDB = () => {
  if (process.env.ISOLATED_INSTANCE) {
    const server = createAdvancedServer(
      class implements IAdvanceServerSession {
        // An optional handler which will be called
        //  on each new connection
        onConnect(socket: Socket) {
          logMessage.debug("👤 Client connected, IP: ", socket.remoteAddress);
        }

        // A handler which will be called on each received instuction.
        onCommand({ command }: DbRawCommand, response: IResponseWriter) {
          // use the "response" writer
          // to react to the "command"  argument
          logMessage.debug(command);
          logMessage.debug(response);
        }
      }
    );
    server.listen(5432, "127.0.0.1");
  }
};
