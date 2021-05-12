@isTest
public class DailyLeadProcessorTest {
    public static String CRON_EXP = '0 38 12 * * ? 2021';
   @IsTest
    static void testXXX(){
        List<Lead> leadlists = new List<lead>();
        for (Integer i = 0; i<200;i++) {
                Lead l = new Lead(Company='Companyxxx' +i, LastName='lastname'+i);
                leadlists.add(l);
            }
        insert leadlists;
        Test.startTest();
        String jobId = System.schedule('sadsadsada', CRON_EXP, new DailyLeadProcessor());
        List<Lead> leadss = [SELECT Id FROM Lead WHERE LeadSource = 'Dreamforce' limit 200];
        Test.stopTest();
        List<Lead> leadss2 = [SELECT Id FROM Lead WHERE LeadSource = 'Dreamforce' limit 200];
        System.assertEquals(200, leadss2.size());
    }
}