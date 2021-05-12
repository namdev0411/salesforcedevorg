public with sharing class AccountHandler {
    public static Account insertNewAccount(String name){
        Account acc = new Account(name=name);
        Database.SaveResult sr = Database.insert(acc,false);
        if (sr.success) {
            return [select name from Account where Id = :sr.getId()];
        }else {
            return null;
        }
    }
}