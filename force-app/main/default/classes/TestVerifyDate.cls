@isTest
private class TestVerifyDate {
    @isTest static void testCheckDates(){
        Date date1 = Date.newInstance(2010, 1, 12);
        Date date2 = Date.newInstance(2010, 2, 15);
        Date newDate = VerifyDate.CheckDates(date1,date2);
        System.assertEquals(newDate, date2);
    }
    @isTest static void testCheckDates2(){
        Date date1 = Date.newInstance(2010, 1, 12);
        Date date2 = Date.newInstance(2010, 1, 30);
        Date newDate = VerifyDate.CheckDates(date1,date2);
        System.assertEquals(newDate, Date.newInstance(2010, 1, 30));
    }
}