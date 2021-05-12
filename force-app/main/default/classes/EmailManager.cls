public class EmailManager {

    public void sendMail(Id userId, String Address,String subject, String body)
    {
       Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
       string [] toaddress = new string[]{address};
       
       //email.setToAddresses(toaddress);

        //Avoid to hit the max number of emails
        email.saveAsActivity = false;
        email.setTargetObjectId(userId);
    
       email.setSubject(subject);
       email.setPlainTextBody(body);

       Messaging.sendEmail( new Messaging.SingleEmailMessage[] { email } );
    }
}