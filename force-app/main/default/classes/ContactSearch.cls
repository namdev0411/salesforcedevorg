public with sharing class ContactSearch {
   ContactSearch(){

   }
    public static List<Contact> searchForContacts(String lastName, String mailingPostalCode){
        List<Contact> lists = [select id,name from Contact where LastName like :lastName and mailingPostalCode=:MailingPostalCode];
        return lists;
    }
}