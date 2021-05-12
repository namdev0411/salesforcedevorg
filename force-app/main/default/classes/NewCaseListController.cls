public with sharing class NewCaseListController {
    public List<Case> newCases { get; set; }
    public List<Case> getNewCases(){
        this.newCases = [select id,caseNumber from Case where status='New' limit 3 ];
        return this.newCases;
    }
}