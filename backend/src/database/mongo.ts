import { logger } from '../utils/logger.js';
import { env } from '../config/config.js';
import { set, connect } from 'mongoose';

class MongoDBClient {
  private static instance: MongoDBClient;
  private connection: any;

  constructor() {
    this.connectToDatabase();
  }

  public static getInstance(): MongoDBClient {
    if (!MongoDBClient.instance) {
      MongoDBClient.instance = new MongoDBClient();
    }
    return MongoDBClient.instance;
  }

  public async connectToDatabase() {
    try {
      set('debug', true);
      console.log('Connecting to MongoDB database...');
      connect(env.MONGO_URI);
      console.log('Connected to MongoDB database!');
    } catch (e) {
      logger.error(`Unable to connect to the databases: ${e}`);
      // If any errors connecting to database, the error is thrown and the deployed system restarts!
      throw new Error(e);
    }
  }

  public getDBConnection(): any {
    return this.connection;
  }
}

export const mongoClient = MongoDBClient.getInstance();
