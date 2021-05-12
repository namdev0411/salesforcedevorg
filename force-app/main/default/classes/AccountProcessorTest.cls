@IsTest 
private class AccountProcessorTest {
    @IsTest
     private static void countContactsTest (){
        Test.startTest();
        AccountProcessor.countContacts(new List<Id>{'0015h000007VEAbAAO','0015h000007VEAk'});
        Test.stopTest();
    }
}