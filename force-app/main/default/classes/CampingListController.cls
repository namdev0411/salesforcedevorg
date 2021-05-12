public with sharing class CampingListController {
    @AuraEnabled
    public static List<Camping_Item__c> getItems(){
        try {
            return [select name,price__c,quantity__c,packed__c from Camping_Item__c];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static Camping_Item__c saveItem(Camping_Item__c campingItem){
        try {
            insert campingItem;
            return campingItem;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}