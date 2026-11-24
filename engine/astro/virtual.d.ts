declare module 'virtual:factory/config' {
  const config: import('../config/resolve.ts').ResolvedConfig;
  export default config;
}

declare module 'virtual:factory/form' {
  const form: {
    endpoint: string;
    contract: import('../form/contract.ts').FormContract;
    server: import('../form/contract.ts').ServerContract;
  } | null;
  export default form;
}
