@isTest
private class LeadProcessorTest {
    @TestSetup
    static void makeData(){
        List<Lead> lists = new List<Lead>();
        for(Integer i = 0;i<200;i++){
            lists.add(new Lead(Title='Lead'+i,LastName='LastName'+i,Company='Company'+i));
        }
        insert lists;
    }
    @isTest static void testMethodX(){
        Test.startTest();
        LeadProcessor lp = new LeadProcessor();
        Id batchId = Database.executeBatch(lp);
        Test.stopTest();
    }
}