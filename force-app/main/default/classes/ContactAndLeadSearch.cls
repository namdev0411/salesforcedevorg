public with sharing class ContactAndLeadSearch {
    public ContactAndLeadSearch() {

    }
    public static List<List<SObject>> searchContactsAndLeads(String str){
        List<List<SObject>> lists = [FIND :str IN ALL FIELDS 
                   RETURNING Contact(FirstName,LastName),Lead(FirstName,LastName)];
        return lists;
    } 
}