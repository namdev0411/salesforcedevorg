public class RandomContactFactory {
    public static List<Contact> generateRandomContacts (Integer ctCount,String lstName){
        List<Contact> lists = new List<Contact>();
        for(Integer i = 0; i<ctCount;i++){
            lists.add(new Contact(FirstName = 'FirstName'+i,LastName=lstName));
        }
        return lists;
    }
}