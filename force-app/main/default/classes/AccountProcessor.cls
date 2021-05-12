global class AccountProcessor {
    @future
    public static void countContacts(List<Id> accountIds){
     
        List<Account> accList = new List<Account>();
        for(Id accId : accountIds){
            Integer countAll = [Select Count() from Contact where AccountID = :accId];
            accList.add(new Account(Id=accId,Number_Of_Contacts__c=countAll));
        }
        upsert accList;
    }
}