public with sharing class RSIT_Utils {
    public static void throwExceptionWithMessage(String msg){
        AuraHandledException ex = new AuraHandledException(msg);
        ex.setMessage(msg);
        throw ex;
    }
}