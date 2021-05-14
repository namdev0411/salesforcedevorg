public with sharing class RSIT_TimeLineController {
    @AuraEnabled
    public static Boolean deleteActivityTimeLine(String recordId) {
        System.debug('recordId:'+recordId);
        Boolean isSuccess = false;
        try {
            Database.delete(recordId);
            isSuccess = true;
        } catch(Exception ex) {
            System.debug('Exception:'+ex.getMessage());
        }
        return isSuccess;
    }
}