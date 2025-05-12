
type DbConfig = {
    host: string;
    user: string;
    password: string;
    database: string;
    filePath: string;
    tableName: string;
    batchSize: number;
  };
  

type LastIdResult = { lastId: number | null };

export { DbConfig, LastIdResult}