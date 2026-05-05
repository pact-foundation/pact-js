export class AccountNumber {
  id: number;
  constructor(num: number) {
    this.id = num;
  }
}

export class Account {
  id: number;
  version: number;
  name: string;
  referenceId: string;
  accountNumber: AccountNumber;
  created: number;
  updated: number;

  constructor(id, version, name, referenceId, accountNumber, created, updated) {
    this.id = id;
    this.version = version;
    this.name = name;
    this.referenceId = referenceId;
    this.accountNumber = accountNumber;
    this.created = created;
    this.updated = updated;
  }
}

const accounts: Account[] = [];

export const accountRepository = {
  save: (account: Account) => {
    // This simulates a save to the DB where the IDs get allocated
    const id = Math.floor(Math.random() * Math.floor(100000));
    const accountNumber = Math.floor(Math.random() * Math.floor(100000));
    const version = Math.floor(Math.random() * Math.floor(10));
    account.id = id;
    account.version = version;
    account.accountNumber.id = accountNumber;
    accounts.push(account);
    return account;
  },

  findByAccountNumber: async (accountNumber) => {
    return accounts.find(
      (account) => Number(account.accountNumber.id) === Number(accountNumber),
    );
  },
};
