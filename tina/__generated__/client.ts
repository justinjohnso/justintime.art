import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({ url: 'http://localhost:4001/graphql', token: '22aaf26f57275d48c919e7f1c2802cd035fa1fd2', queries,  });
export default client;
  