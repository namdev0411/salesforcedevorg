@isTest class TestRestrictContactByName {
    
     @IsTest
    static void methodName(){
        Contact ct1 = new Contact(LastName='INVALIDNAME');

        Test.startTest();
        Database.SaveResult reesult = Database.insert(ct1,false);
        Test.stopTest();
        
    }
}