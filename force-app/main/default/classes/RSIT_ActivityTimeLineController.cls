public with sharing class RSIT_ActivityTimeLineController {
    @AuraEnabled
    public static List<QueryWrapper> initData(String objName, String perPage, List<String> recordChildIds, String sortOrder){
        try {
            Map<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe();

            List<Activity_Timeline_Setting__mdt> settings = [Select Show_activity_timeline_level_1__c, DeveloperName,Child_object_level_1_name__c, Child_object_level_2_name__c, Child_object_level_1_relationship_name__c, Child_object_level_2_relationship_name__c, Detail_field_level_1__c, Detail_field_level_2__c, Event_type_field_level_1__c, Event_type_field_level_2__c, Object_detail__c, Sort_field_level_1__c, Sort_field_level_2__c, Subject_field_level_1__c, Subject_field_level_2__c, Query_condition_level_1__c, Query_condition_level_2__c From Activity_Timeline_Setting__mdt Where Object_detail__c = :objName Order By DeveloperName];

            List<QueryWrapper> queryWrapperSet = new List<QueryWrapper>();
            Set<String> queryStringSet = new Set<String>();

            for(Activity_Timeline_Setting__mdt setting : settings){
                if(setting.Show_activity_timeline_level_1__c){
                    QueryWrapper queryWrapper = new QueryWrapper();
                    queryWrapper.subjectField = setting.Subject_field_level_1__c;
                    queryWrapper.detailFieldsDescribe = generateDescribeOfField(setting.Detail_field_level_1__c, setting.Child_object_level_1_name__c, globalDescribe);
                    queryWrapper.sortField = setting.Sort_field_level_1__c;
                    queryWrapper.eventTypeField = setting.Event_type_field_level_1__c;
                    queryWrapper.queryStr = getQueryForLevel1(setting, queryWrapper.detailFieldsDescribe, recordChildIds, sortOrder, perPage);

                    System.debug(queryWrapper.queryStr);
                    if(!queryStringSet.contains(queryWrapper.queryStr)){
                        queryStringSet.add(queryWrapper.queryStr);
                        queryWrapperSet.add(queryWrapper);
                    }
                }

                if(String.isNotBlank(setting.Child_object_level_2_name__c)){
                    //Have level 2
                    QueryWrapper queryWrapper2 = new QueryWrapper();
                    queryWrapper2.subjectField = setting.Subject_field_level_2__c;
                    queryWrapper2.detailFieldsDescribe = generateDescribeOfField(setting.Detail_field_level_2__c, setting.Child_object_level_2_name__c, globalDescribe);
                    queryWrapper2.sortField = setting.Sort_field_level_2__c;
                    queryWrapper2.eventTypeField = setting.Event_type_field_level_2__c;
                    queryWrapper2.queryStr = getQueryForLevel2(setting, queryWrapper2.detailFieldsDescribe, recordChildIds, sortOrder, perPage);
                    
                    System.debug(queryWrapper2.queryStr);
                    if(!queryStringSet.contains(queryWrapper2.queryStr)){
                        queryStringSet.add(queryWrapper2.queryStr);
                        queryWrapperSet.add(queryWrapper2);
                    }
                }
            }

            System.debug(queryWrapperSet.size());
            return queryWrapperSet;
        } catch (Exception ex) {
            RSIT_Utils.throwExceptionWithMessage(ex.getMessage());
            return null;
        }
    }

    @AuraEnabled
    public static List<TimeLineWrapper> callQueryAndGetRecordBack(String recordId, List<String> recordChildIds, String timeLineId, QueryWrapper queryWrapper){
        try {
            String orderByField = queryWrapper.sortField;
            List<sObject> records = Database.query(queryWrapper.queryStr);
            List<TimeLineWrapper> timelineWrapperList = new List<TimeLineWrapper>();
            for(sObject record : records){
                TimeLineWrapper wrapper = new TimeLineWrapper();
                wrapper.recordId = (String)record.get('Id');
                wrapper.sortFieldData = (DateTime)record.get(orderByField);
                wrapper.recordJson = JSON.serialize(record);
                wrapper.queryWrapper = queryWrapper;
                timelineWrapperList.add(wrapper);
            }
            return timelineWrapperList;
        } catch (Exception ex) {
            RSIT_Utils.throwExceptionWithMessage(ex.getMessage());
            return null;
        }
    }

    @AuraEnabled(cacheable = true)
    public static List<Activity_Timeline_Icon_Setting__mdt> getIconTimeLine(){
        return [SELECT Icon_name__c, DeveloperName, Label FROM Activity_Timeline_Icon_Setting__mdt];
    }

    @AuraEnabled
    public static Boolean deleteActivityTimeLine(String recordId) {
        Boolean isSuccess = false;
        try {
            Database.delete(recordId);
            isSuccess = true;
        } catch(Exception ex) {
            System.debug('Exception:'+ex.getMessage());
        }
        return isSuccess;
    }
    @AuraEnabled
    public static EmailMessage getEmailMessage(String taskId) {
        return [Select Id From EmailMessage where ActivityId = :taskId LIMIT 1];
    }

    private static String getQueryForLevel1(Activity_Timeline_Setting__mdt setting, List<FieldWrapper> detailFieldsDescribe, 
                                            List<String> recordIds, String sortOrder, String perPage){
        Set<String> fieldsNeedToQueryLevel1 = new Set<String>();
        addStringToList(fieldsNeedToQueryLevel1, setting.Subject_field_level_1__c);
        addStringToList(fieldsNeedToQueryLevel1, setting.Sort_field_level_1__c);
        addStringToList(fieldsNeedToQueryLevel1, setting.Event_type_field_level_1__c);
        for(FieldWrapper wrap : detailFieldsDescribe){
            fieldsNeedToQueryLevel1.add(wrap.apiName);
            if(wrap.type == Schema.DisplayType.Reference.name()){
                fieldsNeedToQueryLevel1.add(wrap.relationshipDisplayField);
            }
        } 
        if (setting.Child_object_level_1_name__c == 'Task') {
            addStringToList(fieldsNeedToQueryLevel1, 'Description');
            addStringToList(fieldsNeedToQueryLevel1, 'CreatedDate');
        }
        String fieldsNeedToQueryLevel1Str = String.join(new List<String>(fieldsNeedToQueryLevel1), ', ');
        String condition = '';
        if (!recordIds.isEmpty()) {
            condition += ' AND Id NOT IN :recordChildIds ';
        }
        if(String.isBlank(setting.Query_condition_level_1__c)){
            return String.format('Select {0} From {1} Where {2} = :recordId {3} Order By {4} {5} NULLS FIRST Limit {6}', new List<String>{fieldsNeedToQueryLevel1Str, setting.Child_object_level_1_name__c, setting.Child_object_level_1_relationship_name__c, condition, setting.Sort_field_level_1__c, sortOrder, perPage});
        }
        else{
            return String.format('Select {0} From {1} Where {2} = :recordId {3} And {4} Order By {5} {6} NULLS FIRST Limit {7}', new List<String>{fieldsNeedToQueryLevel1Str, setting.Child_object_level_1_name__c, setting.Child_object_level_1_relationship_name__c, condition, setting.Query_condition_level_1__c, setting.Sort_field_level_1__c, sortOrder, perPage});
        }
    }

    private static String getQueryForLevel2(Activity_Timeline_Setting__mdt setting, List<FieldWrapper> detailFieldsDescribe, 
                                            List<String> recordIds, String sortOrder, String perPage){
        Set<String> fieldsNeedToQueryLevel2 = new Set<String>();
        addStringToList(fieldsNeedToQueryLevel2, setting.Subject_field_level_2__c);
        addStringToList(fieldsNeedToQueryLevel2, setting.Sort_field_level_2__c);
        addStringToList(fieldsNeedToQueryLevel2, setting.Event_type_field_level_2__c);
        for(FieldWrapper wrap : detailFieldsDescribe){
            fieldsNeedToQueryLevel2.add(wrap.apiName);
            if(wrap.type == Schema.DisplayType.Reference.name()){
                fieldsNeedToQueryLevel2.add(wrap.relationshipDisplayField);
            }
        }
        if (setting.Child_object_level_2_name__c == 'Task') {
            addStringToList(fieldsNeedToQueryLevel2, 'Description');
            addStringToList(fieldsNeedToQueryLevel2, 'CreatedDate');
        }
        String fieldsNeedToQueryLevel2Str = String.join(new List<String>(fieldsNeedToQueryLevel2), ', ');
        String condition = '';
        if (!recordIds.isEmpty()) {
            condition = ' AND Id NOT IN :recordChildIds ';
        }

        if(String.isBlank(setting.Query_condition_level_2__c)){
            return String.format('Select {0} From {1} Where {2} In (Select Id From {3} Where {4} = :recordId) {5} Order By {6} {7} NULLS FIRST Limit {8}', new List<String>{fieldsNeedToQueryLevel2Str, setting.Child_object_level_2_name__c, setting.Child_object_level_2_relationship_name__c, setting.Child_object_level_1_name__c, setting.Child_object_level_1_relationship_name__c, condition, setting.Sort_field_level_2__c, sortOrder, perPage});
        }
        else{
            return String.format('Select {0} From {1} Where {2} In (Select Id From {3} Where {4} = :recordId) {5} And {6} Order By {7} {8} NULLS FIRST Limit {9}', 
            new List<String>{fieldsNeedToQueryLevel2Str, setting.Child_object_level_2_name__c, setting.Child_object_level_2_relationship_name__c, setting.Child_object_level_1_name__c, setting.Child_object_level_1_relationship_name__c, condition, setting.Query_condition_level_2__c, setting.Sort_field_level_2__c, sortOrder, perPage});
        }
    }

    private static void addStringToList(Set<String> fieldsNeedToQuery, String str){
        if(String.isNotBlank(str)){
            List<String> lstStr = str.split(',');
            fieldsNeedToQuery.addAll(lstStr);
        }
    }

    private static List<FieldWrapper> generateDescribeOfField(String detailField, String objName, Map<String, Schema.SObjectType> globalDescribe){
        SObjectType objType = Schema.getGlobalDescribe().get(objName);
        if(objType == null){
            return new List<FieldWrapper>();
        }

        List<FieldWrapper> detailFieldsDescribe = new List<FieldWrapper>();
        Map<String,Schema.SObjectField> mfields = objType.getDescribe().fields.getMap();
        if(String.isNotBlank(detailField)){
            List<String> lstStr = detailField.split(',');
            for(String str : lstStr){
                Schema.SObjectField field = mfields.get(str);
                if(field != null){
                    Schema.DescribeFieldResult dfr = field.getDescribe();
                    FieldWrapper fieldWrap = new FieldWrapper();
                    fieldWrap.label = dfr.getLabel();
                    fieldWrap.type = dfr.getType().name();
                    fieldWrap.apiName = dfr.getName();
                    if(dfr.getType() == Schema.DisplayType.Reference){
                        fieldWrap.relationshipDisplayField = String.format('{0}.{1}', new List<String>{dfr.getRelationshipName(), 'Name'});
                    }
                    detailFieldsDescribe.add(fieldWrap);
                }
            }
        }
        return detailFieldsDescribe;
    }

    public class TimeLineWrapper{
        @AuraEnabled
        public String recordId {get;set;}
        @AuraEnabled
        public DateTime sortFieldData {get;set;}
        @AuraEnabled
        public String recordJson {get;set;}
        @AuraEnabled
        public QueryWrapper queryWrapper {get;set;}
    }

    public class QueryWrapper{
        @AuraEnabled
        public String queryStr {get;set;}
        @AuraEnabled
        public String subjectField {get;set;}
        @AuraEnabled
        public List<FieldWrapper> detailFieldsDescribe {get;set;}
        @AuraEnabled
        public String sortField {get;set;}
        @AuraEnabled
        public String eventTypeField {get;set;}
    }

    public class FieldWrapper{
        @AuraEnabled
        public String label {get;set;}
        @AuraEnabled
        public String type {get;set;}
        @AuraEnabled
        public String apiName {get;set;}
        @AuraEnabled
        public String relationshipDisplayField {get;set;}
    }
}