public with sharing class Demo {
    public List<Todo__c> accs {get;set;}
    public Demo(){
        this.accs = [select name,date__c,content__c from Todo__c];
    }
    public static void insertData(){
        List<Todo__c> todos = new List<Todo__c>();
        Todo__c todo = new Todo__c(name = 'Choi game',content__c='Di choi game cung ban be');
        todos.add(todo);
        insert todos;
    }
}