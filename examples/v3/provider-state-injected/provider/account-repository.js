class AccountNumber {
  constructor(num) {
    this.id = num
  }
}

class Account {
  constructor(id, version, name, referenceId, accountNumber, created, updated) {
    this.id = id
    this.version = version
    this.name = name
    this.referenceId = referenceId
    this.accountNumber = accountNumber
    this.created = created
    this.updated = updated
  }
}

const accounts = []

const accountRepository = {
  save: (account) => {
    // This similates a save to the DB where the IDs get allocated
    let id = Math.floor(Math.random() * Math.floor(100000))
    let accountNumber = Math.floor(Math.random() * Math.floor(100000))
    let version = Math.floor(Math.random() * Math.floor(10))
    account.id = id
    account.version = version
    account.accountNumber.id = accountNumber
    accounts.push(account)
    return account
  },

  findByAccountNumber: async (accountNumber) => {
    return accounts.find(account => account.accountNumber.id == accountNumber)
  }
}

module.exports = {
  Account, AccountNumber, accountRepository
}
