@isTest
public class AddPrimaryContactTest {
    @TestSetup
    static void makeData(){
        List<Account> accs = new List<Account>();
        for (Integer i = 0;i<100;i++) {
            Account acc;
            if(i<50){
                acc = new Account(name='acc'+i,BillingState='NY');
            }else{
                acc = new Account(name='acc'+i,BillingState='CA');
            }
            accs.add(acc);
        }
        insert accs;
    }
    @IsTest
    static void testQueue(){
        AddPrimaryContact addPC = new AddPrimaryContact(new Contact(),'CA');
        Test.startTest();
        System.enqueueJob(addPC);
        Test.stopTest();
        
    }
}