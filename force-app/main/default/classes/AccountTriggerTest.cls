@isTest
public class AccountTriggerTest {
    @isTest
    static void Test(){
        List<Account> insertList = new List<Account>();
        for ( Integer i = 0 ; i < 200 ; i++ ) {
            Account insertacc = new Account(
                Name = 'Acc' + i,
                BillingState = 'CA'
            );
            insertList.add(insertacc);
        }
        Test.startTest();
        insert insertList;
        Test.stopTest();
    }
}