global with sharing class TodoController {
    public static final Integer perPage {
        get{
            return 5;
        }
    }
    
    public String name {get;set;}
    public String contentC {set;get;}
    public static List<Todo__c> todos {get;set;}
    public String todosJson {get;set;}
    public static Integer page{get;set;}
    public static Integer maxPage{set;get;}

    public TodoController() {
        page=1;
        todos =[select Id,name,date__c,content__c,ownerId from Todo__c limit :perPage];
        this.todosJson = JSON.serialize(todos); 
        maxPage = Integer.valueOf(Math.floor([select count() from Todo__c]/perPage)+1);
    }

    @RemoteAction
    global static Id save(String name){
        Todo__c newTodo = new Todo__c(name=name);
        Database.SaveResult sr = Database.insert(newTodo, false);
            if (sr.success) {
                return sr.getId();
            }else {
                for(Database.Error err : sr.getErrors()) {
                    System.debug(err.getStatusCode() + ': ' + err.getMessage());
                    System.debug('field err ' + err.getFields());
                }
            }
        maxPage = Integer.valueOf(Math.floor([select count() from Todo__c]/perPage)+1);
        return null;
    }
    
    @RemoteAction
    public static Map<Integer,List<Todo__c>> deleteRecord(Id recordId){
        Todo__c tdo = [select id from Todo__c where Id = :recordId];
        if(tdo !=null){
            Database.DeleteResult dr = Database.delete(tdo);
            if (dr.success) {
                System.debug('delete success '+ dr.getId());
                return changePage(page);
            }else {
                for(Database.Error err : dr.getErrors()) {
                    System.debug(err.getStatusCode() + ': ' + err.getMessage());
                    System.debug('field err ' + err.getFields());
                }
            }
        }
        return null;
    }
    //pagination 
    @RemoteAction
    global static Map<Integer,List<Todo__c>> changePage(Integer pageInput){
            page = pageInput;
            Integer offset = page*perPage-perPage;
            todos = [select name,date__c,content__c,ownerId from Todo__c limit :perPage offset :offset];
            Map<Integer,List<Todo__c>> mapResult = new Map<Integer,List<Todo__c>>();
            mapResult.put(page,todos);
            return mapResult;

    }
}