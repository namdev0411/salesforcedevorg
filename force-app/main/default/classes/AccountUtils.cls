public with sharing class AccountUtils {
    
    public static List<Account> accountsByState(String bState ){
        return [select id,name from Account where BillingState = :bState];
    }
}