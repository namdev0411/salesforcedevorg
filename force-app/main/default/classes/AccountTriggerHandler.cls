public with sharing class AccountTriggerHandler {
    public static void CreateAccounts(List<Account> newAccountList){
        List<Account> updateList = new List<Account>();
        for ( Account rec : newAccountList ) {
            rec.ShippingState = rec.BillingState;
        }
    }
}