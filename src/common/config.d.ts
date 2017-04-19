interface Config {
  mockService: {
    host: string;
    port: number;
  };
  logging: boolean;
}

export = Config;
