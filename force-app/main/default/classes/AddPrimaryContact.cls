public with sharing class AddPrimaryContact implements Queueable{
    List<Account> accs = new List<Account>();
    Contact ct;
    public AddPrimaryContact(Contact ct,String state) {
        this.accs = [Select id from Account where BillingState = :state limit 200];
        this.ct = ct;
    }
    public void execute(QueueableContext context){
        List<Contact> cts = new List<Contact>();
        for(Account acc : accs){
            Contact cont = this.ct.clone(false,false,false,false);
            cont.accountId = acc.Id;
            cts.add(cont);
        }
        insert cts;
    }
}