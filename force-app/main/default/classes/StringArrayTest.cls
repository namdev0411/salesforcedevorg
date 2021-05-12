public with sharing class StringArrayTest {
    public static List<String> generateStringArray(Integer length){
        List<String> lists = new List<String>();
        for (Integer i = 0;i<length;i++) {
            String newStr = 'Test '+i;
            lists.add(newStr);
        }
        return lists;
    }
}