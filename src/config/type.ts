export interface CustomStorage {
    // add your custom storage properties here
    "apex::auth.ALSKey": string;
    [key: `apex::config.connection.${string}`]:
        | {
              PC?: {
                  username: string;
                  timestamp: number;
              };
              PS4?: {
                  username: string;
                  timestamp: number;
              };
              X1?: {
                  username: string;
                  timestamp: number;
              };
          }
        | undefined;
}
