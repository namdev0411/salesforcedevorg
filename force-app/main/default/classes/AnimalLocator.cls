public with sharing class AnimalLocator {
    public String getAnimalNameById(Integer id){
        Http http = new http();
        HttpRequest req = new HttpRequest();
        String endPoint = 'https://th-apex-http-callout.herokuapp.com/animals/'+id;
        req.setEndpoint(endPoint);
        req.setMethod('GET');
        req.setHeader('Content-Type', 'application/json;charset=UTF-8');

        HttpResponse res = http.send(req);
        if(res.getStatusCode()!=201){
            System.debug('The status code returned was not expected: ' +
            res.getStatusCode() + ' ' + res.getStatus());
            return null;
        }
        Map<String, Animal> result = (Map<String, Animal>) JSON.deserializeUntyped(res.getBody());
        Animal animal = result.get('animal');
        return animal.name;
    }
    
    public class Animal{
        String name{get;set;}
        String eats{get;set;}
        String say{get;set;}
    }
}