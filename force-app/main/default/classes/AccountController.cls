public with sharing class AccountController {

	public List<Account> accounts {get;set;}
	public String searchCondition {get;set;}
	public Account currentRecord {get;set;}

    public AccountController() {}

    public void searchAccount(){
    	accounts = new List<Account>();
    	if(String.isNotBlank(searchCondition)){
    		String likeCondition = '%'+searchCondition+'%';
    		accounts = [SELECT Id,Name,Owner.Name 
	        			FROM Account 
	        			WHERE Name LIKE :likeCondition];
    	}
    }

    public void deleteRecord(){
    	String recordIndex = Apexpages.currentPage().getParameters().get('recordIndex');
    	System.debug('==recordIndex==' + recordIndex);
    	//Account rAcc = accounts[Integer.valueOf(recordIndex)];
    	delete accounts[Integer.valueOf(recordIndex)];
    	accounts.remove(Integer.valueOf(recordIndex));
    }

    public void initRecordById(){
    	String recordId = Apexpages.currentPage().getParameters().get('id');
    	System.debug('==recordId==' + recordId);
    	if(String.isBlank(recordId)){
    		currentRecord = new Account();
    	} else {
    		currentRecord = [SELECT Id, Name FROM Account WHERE Id = :recordId];
    	}
    }

    public void savRecord(){
    	upsert currentRecord;
    }

}